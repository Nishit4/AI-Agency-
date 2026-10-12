#!/usr/bin/env node
/**
 * LegacyModern AI — Legacy Spec Bridge (MCP server, stdio transport).
 *
 * Exposes Gemini-extracted legacy specifications to Claude Code:
 *   tools
 *     - ingest_legacy_subsystem   : bundle + analyse a legacy subsystem with Gemini, cache the verified spec
 *     - get_subsystem_spec        : read a cached spec (summary | analysis | contract | work_order | full)
 *     - list_ingested_modules     : enumerate cached modules and their verification state
 *     - publish_verified_contract : spec-publisher sign-off (merges amended assertions, stamps verifiedBy)
 *   resources
 *     - legacy://behavioral-assertions/{moduleId} : the behavioral contract consumed by characterization tests
 *
 * stdout is reserved for JSON-RPC frames; every log line goes to stderr.
 */
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { GeminiIngestClient, IngestValidationError } from "./gemini_client.js";
import {
  BehavioralAssertionSchema,
  BehavioralContractSchema,
  ModernizationWorkOrderSchema,
  ModuleIdSchema,
  TARGET_LANGUAGES,
  type BehavioralAssertion,
  type BehavioralContract,
  type SpecCacheEntry,
} from "./types.js";

const SERVER_NAME = "legacymodern-spec-bridge";
const SERVER_VERSION = "1.0.0";

function log(level: "info" | "warn" | "error", message: string, fields: Record<string, unknown> = {}): void {
  process.stderr.write(`${JSON.stringify({ time: new Date().toISOString(), level, msg: message, ...fields })}\n`);
}

function jsonResult(payload: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
    structuredContent: payload as Record<string, unknown>,
  };
}

function errorResult(message: string, details: unknown = undefined) {
  const payload = details === undefined ? { error: message } : { error: message, details };
  return {
    content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
    isError: true,
  };
}

function summarize(entry: SpecCacheEntry) {
  const byCategory: Record<string, number> = {};
  for (const assertion of entry.contract.assertions) {
    byCategory[assertion.category] = (byCategory[assertion.category] ?? 0) + 1;
  }
  return {
    moduleId: entry.moduleId,
    displayName: entry.analysis.displayName,
    language: entry.analysis.language,
    dialect: entry.analysis.dialect,
    summary: entry.analysis.summary,
    bundleHash: entry.bundleHash,
    model: entry.model,
    createdAt: entry.createdAt,
    contractVersion: entry.contract.contractVersion,
    verified: entry.contract.verifiedBy !== null,
    reviewFlags: entry.reviewFlags,
    files: entry.contract.sourceSystem.files.length,
    totalLines: entry.analysis.metrics.totalLines,
    businessRules: entry.analysis.businessRules.length,
    assertions: entry.contract.assertions.length,
    assertionsByCategory: byCategory,
    externalDependencies: entry.analysis.dependencies.filter((d) => d.external).map((d) => `${d.kind}:${d.to}`),
    highRisks: entry.analysis.risks.filter((r) => r.severity === "high" || r.severity === "critical"),
    workOrder: entry.workOrder,
    tokenUsage: entry.usage,
    resourceUri: `legacy://behavioral-assertions/${entry.moduleId}`,
  };
}

/** Merges amended assertions into a contract and validates lineage against the recorded source files. */
function mergeAssertions(contract: BehavioralContract, amended: BehavioralAssertion[]): { contract: BehavioralContract; problems: string[] } {
  const problems: string[] = [];
  const files = new Map(contract.sourceSystem.files.map((f) => [f.path, f]));
  const ruleIds = new Set(contract.businessRules.map((r) => r.ruleId));
  const assertions = new Map(contract.assertions.map((a) => [a.assertionId, a]));

  for (const assertion of amended) {
    if (!ruleIds.has(assertion.ruleId)) problems.push(`${assertion.assertionId}: unknown rule ${assertion.ruleId}`);
    for (const pointer of assertion.lineage) {
      const file = files.get(pointer.file);
      if (!file) problems.push(`${assertion.assertionId}: lineage file ${pointer.file} is not part of the contract`);
      else if (pointer.endLine > file.lineCount || pointer.startLine > pointer.endLine) {
        problems.push(`${assertion.assertionId}: lineage ${pointer.file}:${pointer.startLine}-${pointer.endLine} is out of range`);
      }
    }
    if (assertion.category === "error" && assertion.expected.error === null) {
      problems.push(`${assertion.assertionId}: category=error requires expected.error`);
    }
    assertions.set(assertion.assertionId, assertion);
  }

  const merged = [...assertions.values()].sort((a, b) => a.assertionId.localeCompare(b.assertionId));
  const businessRules = contract.businessRules.map((rule) => ({
    ...rule,
    assertionIds: merged.filter((a) => a.ruleId === rule.ruleId).map((a) => a.assertionId),
  }));
  return { contract: { ...contract, assertions: merged, businessRules }, problems };
}

function bumpVersion(version: string, part: "minor" | "patch"): string {
  const [major, minor, patch] = version.split(".").map((n) => Number.parseInt(n, 10));
  return part === "minor" ? `${major}.${minor + 1}.0` : `${major}.${minor}.${patch + 1}`;
}

export function createServer(client: GeminiIngestClient = new GeminiIngestClient()): McpServer {
  const server = new McpServer(
    { name: SERVER_NAME, version: SERVER_VERSION },
    {
      instructions:
        "Legacy Spec Bridge for LegacyModern AI. Call ingest_legacy_subsystem once per module, then read the " +
        "behavioral contract from legacy://behavioral-assertions/{moduleId} (or get_subsystem_spec) before writing " +
        "characterization tests. Never transpile a module whose contract is unverified.",
    },
  );

  server.registerTool(
    "ingest_legacy_subsystem",
    {
      title: "Ingest legacy subsystem with Gemini",
      description:
        "Recursively bundles a legacy subsystem directory (COBOL, copybooks, PL/SQL, JCL, Java, RPG, ...), sends it " +
        "to Gemini's long-context window, validates the extracted analysis and behavioral assertions, and caches the " +
        "result under .spec_cache/<moduleId>/. Returns a summary and the generated work order. Re-uses the cache when " +
        "the source bundle hash is unchanged unless forceRefresh is true.",
      inputSchema: {
        moduleId: ModuleIdSchema.describe("Stable module identifier, also used for the modernize/<module-id> branch"),
        rootDir: z.string().min(1).describe("Absolute or cwd-relative path to the legacy subsystem directory"),
        repository: z.string().min(1).describe("Client source repository URL or name"),
        commitSha: z.string().min(7).describe("Commit SHA (or change-set id) of the ingested source"),
        clientAccount: z.string().min(1).describe("Client account code, e.g. ACME-BANK"),
        podId: z.string().min(1).describe("Delivery pod id from config/pod_config.yaml"),
        targetLanguage: z.enum(TARGET_LANGUAGES).default("Go"),
        targetServiceName: z
          .string()
          .regex(/^[a-z][a-z0-9-]{1,62}$/)
          .describe("Kebab-case name of the modern service to generate"),
        forceRefresh: z.boolean().default(false),
      },
      annotations: { readOnlyHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        log("info", "ingest started", { moduleId: args.moduleId, rootDir: args.rootDir });
        const outcome = await client.ingest(args);
        log("info", "ingest finished", {
          moduleId: args.moduleId,
          fromCache: outcome.fromCache,
          assertions: outcome.entry.contract.assertions.length,
          reviewFlags: outcome.entry.reviewFlags.length,
        });
        return jsonResult({
          fromCache: outcome.fromCache,
          cachePath: outcome.cachePath,
          skippedFiles: outcome.skipped,
          ...summarize(outcome.entry),
        });
      } catch (error) {
        if (error instanceof IngestValidationError) {
          log("warn", "ingest validation failed", { moduleId: args.moduleId, issues: error.issues.length });
          return errorResult(error.message, { issues: error.issues });
        }
        log("error", "ingest failed", { moduleId: args.moduleId, error: (error as Error).message });
        return errorResult((error as Error).message);
      }
    },
  );

  server.registerTool(
    "get_subsystem_spec",
    {
      title: "Get cached subsystem specification",
      description:
        "Returns the cached Gemini specification for a module. section=summary (default) gives counts, flags and the " +
        "work order; analysis gives AST nodes, dependencies, data flows and business rules; contract gives the " +
        "behavioral contract; work_order gives the ModernizationWorkOrder; full returns everything.",
      inputSchema: {
        moduleId: ModuleIdSchema,
        section: z.enum(["summary", "analysis", "contract", "work_order", "full"]).default("summary"),
        bundleHash: z
          .string()
          .regex(/^[a-f0-9]{64}$/)
          .optional()
          .describe("Read a specific historical spec instead of latest"),
      },
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
    },
    async ({ moduleId, section, bundleHash }) => {
      try {
        const entry = bundleHash ? await client.cache.readByHash(moduleId, bundleHash) : await client.cache.readLatest(moduleId);
        if (!entry) {
          return errorResult(`No cached spec for module ${moduleId}. Run ingest_legacy_subsystem first.`);
        }
        switch (section) {
          case "analysis":
            return jsonResult(entry.analysis);
          case "contract":
            return jsonResult(entry.contract);
          case "work_order":
            return jsonResult(entry.workOrder);
          case "full":
            return jsonResult(entry);
          case "summary":
            return jsonResult(summarize(entry));
        }
      } catch (error) {
        return errorResult((error as Error).message);
      }
    },
  );

  server.registerTool(
    "list_ingested_modules",
    {
      title: "List ingested modules",
      description: "Lists every module with a cached spec, its contract version, verification state and open review flags.",
      inputSchema: {},
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
    },
    async () => {
      try {
        const modules = [];
        for (const moduleId of await client.cache.listModules()) {
          const entry = await client.cache.readLatest(moduleId);
          if (!entry) continue;
          modules.push({
            moduleId,
            contractVersion: entry.contract.contractVersion,
            verified: entry.contract.verifiedBy !== null,
            assertions: entry.contract.assertions.length,
            reviewFlags: entry.reviewFlags.length,
            workOrderStatus: entry.workOrder.status,
            createdAt: entry.createdAt,
          });
        }
        return jsonResult({ modules });
      } catch (error) {
        return errorResult((error as Error).message);
      }
    },
  );

  server.registerTool(
    "publish_verified_contract",
    {
      title: "Publish verified behavioral contract",
      description:
        "Used by the Specification & Schema Bridge Agent after auditing a contract. Merges amended or additional " +
        "assertions (matched by assertionId), requires a written resolution for every open review flag, stamps " +
        "verifiedBy, bumps the contract version, and moves the work order to spec_published. Fails without writing if " +
        "any flag is unresolved or any amended assertion is inconsistent.",
      inputSchema: {
        moduleId: ModuleIdSchema,
        verifierAgent: z.string().min(1).default("02_mcp_spec_publisher"),
        findings: z.array(z.string().min(1)).describe("Audit findings recorded on the contract"),
        resolutions: z
          .array(z.object({ flag: z.string().min(1), resolution: z.string().min(10) }))
          .default([])
          .describe("One entry per review flag, copied verbatim, with how it was resolved"),
        amendedAssertions: z.array(BehavioralAssertionSchema).default([]),
      },
      annotations: { readOnlyHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ moduleId, verifierAgent, findings, resolutions, amendedAssertions }) => {
      try {
        const entry = await client.cache.readLatest(moduleId);
        if (!entry) return errorResult(`No cached spec for module ${moduleId}.`);

        const resolved = new Set(resolutions.map((r) => r.flag));
        const unresolved = entry.reviewFlags.filter((flag) => !resolved.has(flag));
        if (unresolved.length > 0) {
          return errorResult("Contract not published: review flags are unresolved.", { unresolved });
        }

        const { contract: merged, problems } = mergeAssertions(entry.contract, amendedAssertions);
        const uncovered = merged.businessRules.filter((r) => r.assertionIds.length === 0).map((r) => r.ruleId);
        if (uncovered.length > 0) problems.push(`rules without assertions: ${uncovered.join(", ")}`);
        if (problems.length > 0) {
          return errorResult("Contract not published: amended assertions are inconsistent.", { problems });
        }

        const version = bumpVersion(entry.contract.contractVersion, amendedAssertions.length > 0 ? "minor" : "patch");
        const contract = BehavioralContractSchema.parse({
          ...merged,
          contractVersion: version,
          verifiedBy: {
            agent: verifierAgent,
            verifiedAt: new Date().toISOString(),
            findings: [...findings, ...resolutions.map((r) => `RESOLVED ${r.flag} :: ${r.resolution}`)],
          },
        });
        const workOrder = ModernizationWorkOrderSchema.parse({
          ...entry.workOrder,
          contractVersion: version,
          assertionCount: contract.assertions.length,
          status: "spec_published",
        });
        const updated: SpecCacheEntry = { ...entry, contract, workOrder, reviewFlags: [] };
        const cachePath = await client.cache.update(updated);
        server.sendResourceListChanged();
        log("info", "contract published", { moduleId, version, assertions: contract.assertions.length });
        return jsonResult({ published: true, cachePath, ...summarize(updated) });
      } catch (error) {
        return errorResult((error as Error).message);
      }
    },
  );

  server.registerResource(
    "behavioral-assertions",
    new ResourceTemplate("legacy://behavioral-assertions/{moduleId}", {
      list: async () => {
        const modules = await client.cache.listModules();
        return {
          resources: modules.map((moduleId) => ({
            uri: `legacy://behavioral-assertions/${moduleId}`,
            name: `${moduleId} behavioral contract`,
            mimeType: "application/json",
          })),
        };
      },
      complete: {
        moduleId: async (value) => (await client.cache.listModules()).filter((m) => m.startsWith(value)),
      },
    }),
    {
      title: "Behavioral assertions",
      description:
        "Behavioral contract (business rules + input/output assertions with lineage) for a legacy module, in the " +
        "format consumed by templates/characterization_test.go.",
      mimeType: "application/json",
    },
    async (uri, variables) => {
      const raw = variables.moduleId;
      const moduleId = ModuleIdSchema.parse(Array.isArray(raw) ? raw[0] : raw);
      const entry = await client.cache.readLatest(moduleId);
      if (!entry) throw new Error(`No cached spec for module ${moduleId}. Run ingest_legacy_subsystem first.`);
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(entry.contract, null, 2),
          },
        ],
      };
    },
  );

  return server;
}

async function main(): Promise<void> {
  const client = new GeminiIngestClient();
  if (!client.config.apiKey) {
    log("warn", "GEMINI_API_KEY is not set; read-only tools work, ingest_legacy_subsystem will fail");
  }
  const server = createServer(client);
  const transport = new StdioServerTransport();

  const shutdown = async (signal: string) => {
    log("info", "shutting down", { signal });
    await server.close().catch(() => undefined);
    process.exit(0);
  };
  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));

  await server.connect(transport);
  log("info", "server ready", { name: SERVER_NAME, version: SERVER_VERSION, model: client.config.model, cacheDir: client.config.cacheDir });
}

main().catch((error: unknown) => {
  log("error", "fatal", { error: error instanceof Error ? error.stack : String(error) });
  process.exit(1);
});
