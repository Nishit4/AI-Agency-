/**
 * Gemini long-context ingestion client.
 *
 * Responsibilities:
 *   1. Recursively bundle a legacy subsystem (COBOL, copybooks, PL/SQL, JCL, Java ...)
 *      into a single line-numbered corpus that fits Gemini's 1M+ token window.
 *   2. Ask Gemini for a structured JSON response (analysis + behavioral assertions)
 *      using the Macro-Cognitive Legacy Ingest Agent system prompt.
 *   3. Validate the response with Zod, cross-check every lineage pointer against the
 *      real files, and repair once if the model returned an invalid payload.
 *   4. Persist the verified contract, analysis and work order to `.spec_cache/`.
 */
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ApiError, GoogleGenAI, type Content } from "@google/genai";
import { z } from "zod";
import {
  BehavioralContractSchema,
  IngestResultSchema,
  ModernizationWorkOrderSchema,
  ModuleIdSchema,
  type BehavioralAssertion,
  type BehavioralContract,
  type IngestOptions,
  type IngestResult,
  type LegacyLanguage,
  type LegacyModuleAnalysis,
  type ModernizationWorkOrder,
  type SourceBundle,
  type SourceFile,
  type SpecCacheEntry,
  type Tolerance,
} from "./types.js";

/* ------------------------------------------------------------------------- */
/* Configuration                                                             */
/* ------------------------------------------------------------------------- */

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function intFromEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === "") return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer, got "${raw}"`);
  }
  return parsed;
}

function floatFromEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === "") return fallback;
  const parsed = Number.parseFloat(raw);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
    throw new Error(`${name} must be a number between 0 and 1, got "${raw}"`);
  }
  return parsed;
}

export interface GeminiClientConfig {
  apiKey: string;
  model: string;
  cacheDir: string;
  ingestPromptPath: string;
  maxInputTokens: number;
  maxBundleBytes: number;
  maxFileBytes: number;
  maxAttempts: number;
  minRuleConfidence: number;
  defaultSlaHours: number;
}

export function loadConfigFromEnv(): GeminiClientConfig {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY ?? "";
  return {
    apiKey,
    model: process.env.GEMINI_MODEL ?? "gemini-2.5-pro",
    cacheDir: path.resolve(process.env.SPEC_CACHE_DIR ?? path.join(process.cwd(), ".spec_cache")),
    ingestPromptPath: path.resolve(
      process.env.INGEST_PROMPT_PATH ?? path.join(PACKAGE_ROOT, "..", "agents", "01_gemini_cognitive_ingest.md"),
    ),
    maxInputTokens: intFromEnv("GEMINI_MAX_INPUT_TOKENS", 900_000),
    maxBundleBytes: intFromEnv("MAX_BUNDLE_BYTES", 3_500_000),
    maxFileBytes: intFromEnv("MAX_FILE_BYTES", 1_500_000),
    maxAttempts: intFromEnv("GEMINI_MAX_ATTEMPTS", 2),
    minRuleConfidence: floatFromEnv("MIN_RULE_CONFIDENCE", 0.8),
    defaultSlaHours: intFromEnv("WORK_ORDER_SLA_HOURS", 72),
  };
}

/* ------------------------------------------------------------------------- */
/* Source bundling                                                           */
/* ------------------------------------------------------------------------- */

const EXTENSION_LANGUAGE: Record<string, LegacyLanguage> = {
  ".cbl": "COBOL",
  ".cob": "COBOL",
  ".cobol": "COBOL",
  ".cpy": "COBOL",
  ".copy": "COBOL",
  ".pli": "PL/I",
  ".pl1": "PL/I",
  ".pks": "PL/SQL",
  ".pkb": "PL/SQL",
  ".pls": "PL/SQL",
  ".plb": "PL/SQL",
  ".prc": "PL/SQL",
  ".fnc": "PL/SQL",
  ".trg": "PL/SQL",
  ".sql": "SQL",
  ".ddl": "SQL",
  ".jcl": "JCL",
  ".proc": "JCL",
  ".java": "Java",
  ".rpg": "RPG",
  ".rpgle": "RPG",
  ".sqlrpgle": "RPG",
  ".nat": "Natural",
  ".asm": "Assembler",
  ".mlc": "Assembler",
  ".mac": "Assembler",
  ".bms": "CICS-BMS",
};

const IGNORED_DIRECTORIES = new Set([
  ".git",
  ".svn",
  ".hg",
  "node_modules",
  "target",
  "build",
  "dist",
  "out",
  ".spec_cache",
  ".idea",
  ".vscode",
]);

function sha256(data: string | Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}

/** POSIX line count: a trailing newline terminates the last line rather than starting a new one. */
export function countLines(content: string): number {
  if (content.length === 0) return 0;
  const parts = content.split("\n").length;
  return content.endsWith("\n") ? parts - 1 : parts;
}

function detectLanguage(filePath: string): LegacyLanguage | null {
  return EXTENSION_LANGUAGE[path.extname(filePath).toLowerCase()] ?? null;
}

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const results: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!IGNORED_DIRECTORIES.has(entry.name)) results.push(...(await walk(full)));
    } else if (entry.isFile()) {
      results.push(full);
    }
  }
  return results;
}

/**
 * Recursively collects every recognised legacy source file under `rootDir`.
 * Files are sorted by path so the bundle (and therefore its hash) is deterministic.
 */
export async function bundleLegacySources(
  rootDir: string,
  limits: { maxBundleBytes: number; maxFileBytes: number },
): Promise<SourceBundle> {
  const absoluteRoot = path.resolve(rootDir);
  const stat = await fs.stat(absoluteRoot).catch(() => null);
  if (!stat || !stat.isDirectory()) {
    throw new Error(`Legacy subsystem root "${absoluteRoot}" does not exist or is not a directory`);
  }

  const candidates = (await walk(absoluteRoot)).sort((a, b) => a.localeCompare(b));
  const files: SourceFile[] = [];
  const skipped: SourceBundle["skipped"] = [];
  let totalBytes = 0;
  let totalLines = 0;

  for (const absolutePath of candidates) {
    const relativePath = path.relative(absoluteRoot, absolutePath).split(path.sep).join("/");
    const language = detectLanguage(absolutePath);
    if (!language) {
      skipped.push({ path: relativePath, reason: "unrecognised extension" });
      continue;
    }
    const buffer = await fs.readFile(absolutePath);
    if (buffer.includes(0)) {
      skipped.push({ path: relativePath, reason: "binary content (NUL byte) — convert from EBCDIC before ingest" });
      continue;
    }
    if (buffer.byteLength > limits.maxFileBytes) {
      skipped.push({ path: relativePath, reason: `file exceeds MAX_FILE_BYTES (${buffer.byteLength} bytes)` });
      continue;
    }
    if (totalBytes + buffer.byteLength > limits.maxBundleBytes) {
      throw new Error(
        `Subsystem exceeds MAX_BUNDLE_BYTES (${limits.maxBundleBytes}). Split it into smaller modules ` +
          `before ingest; stopped at ${relativePath}.`,
      );
    }
    const content = buffer.toString("utf8").replace(/\r\n/g, "\n");
    const lineCount = countLines(content);
    files.push({
      relativePath,
      absolutePath,
      language,
      sha256: sha256(buffer),
      lineCount,
      bytes: buffer.byteLength,
      content,
    });
    totalBytes += buffer.byteLength;
    totalLines += lineCount;
  }

  if (files.length === 0) {
    throw new Error(`No legacy source files found under "${absoluteRoot}"`);
  }

  const bundleHash = sha256(files.map((f) => `${f.relativePath}\u0000${f.sha256}`).join("\n"));
  return { rootDir: absoluteRoot, files, totalBytes, totalLines, bundleHash, skipped };
}

/** Renders the bundle with 6-digit line numbers so the model can cite exact lineage. */
export function renderBundle(bundle: SourceBundle): string {
  const sections = bundle.files.map((file) => {
    const body = file.content.endsWith("\n") ? file.content.slice(0, -1) : file.content;
    const numbered = body
      .split("\n")
      .map((line, index) => `${String(index + 1).padStart(6, "0")}| ${line}`)
      .join("\n");
    return [
      `=== FILE: ${file.relativePath} | language=${file.language} | lines=${file.lineCount} | sha256=${file.sha256} ===`,
      numbered,
      `=== END FILE: ${file.relativePath} ===`,
    ].join("\n");
  });
  return sections.join("\n\n");
}

/* ------------------------------------------------------------------------- */
/* Gemini structured-output schema                                           */
/* ------------------------------------------------------------------------- */

/**
 * Gemini's responseJsonSchema accepts a subset of JSON Schema. We send the structural
 * keywords only (types, properties, required, enums, array bounds) and enforce the rest
 * (regex patterns, datetime formats, cross references) with Zod after the response.
 */
const GEMINI_SCHEMA_KEYWORDS = new Set([
  "type",
  "properties",
  "required",
  "items",
  "enum",
  "description",
  "minimum",
  "maximum",
  "minItems",
  "maxItems",
  "anyOf",
  "additionalProperties",
  "$defs",
  "$ref",
]);

function sanitizeForGemini(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(sanitizeForGemini);
  if (node === null || typeof node !== "object") return node;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    if (!GEMINI_SCHEMA_KEYWORDS.has(key)) continue;
    if (key === "properties" || key === "$defs") {
      const props: Record<string, unknown> = {};
      for (const [propName, propSchema] of Object.entries(value as Record<string, unknown>)) {
        props[propName] = sanitizeForGemini(propSchema);
      }
      out[key] = props;
    } else if (key === "additionalProperties") {
      out[key] = typeof value === "boolean" ? value : sanitizeForGemini(value);
    } else {
      out[key] = sanitizeForGemini(value);
    }
  }
  return out;
}

export function buildGeminiResponseSchema(): unknown {
  return sanitizeForGemini(z.toJSONSchema(IngestResultSchema, { target: "draft-2020-12", unrepresentable: "any" }));
}

/* ------------------------------------------------------------------------- */
/* Post-response verification                                                */
/* ------------------------------------------------------------------------- */

export class IngestValidationError extends Error {
  constructor(
    message: string,
    readonly issues: string[],
  ) {
    super(message);
    this.name = "IngestValidationError";
  }
}

function verifyLineage(
  label: string,
  lineage: Array<{ file: string; startLine: number; endLine: number }>,
  filesByPath: Map<string, SourceFile>,
  issues: string[],
): void {
  for (const pointer of lineage) {
    const file = filesByPath.get(pointer.file);
    if (!file) {
      issues.push(`${label}: lineage references unknown file "${pointer.file}"`);
      continue;
    }
    if (pointer.startLine > pointer.endLine) {
      issues.push(`${label}: lineage ${pointer.file} has startLine ${pointer.startLine} > endLine ${pointer.endLine}`);
    }
    if (pointer.endLine > file.lineCount) {
      issues.push(`${label}: lineage ${pointer.file}:${pointer.endLine} is past end of file (${file.lineCount} lines)`);
    }
  }
}

/**
 * Cross-checks a schema-valid ingest result against the real bundle. Returns the list
 * of structural problems; an empty list means the result is internally consistent.
 * Uncertainty (low confidence) is not a structural problem — see `collectReviewFlags`.
 */
export function verifyIngestResult(result: IngestResult, bundle: SourceBundle): string[] {
  const issues: string[] = [];
  const filesByPath = new Map(bundle.files.map((f) => [f.relativePath, f]));
  const ruleIds = new Set<string>();

  for (const rule of result.analysis.businessRules) {
    if (ruleIds.has(rule.ruleId)) issues.push(`duplicate ruleId ${rule.ruleId}`);
    ruleIds.add(rule.ruleId);
    verifyLineage(`rule ${rule.ruleId}`, rule.lineage, filesByPath, issues);
  }

  for (const node of result.analysis.astNodes) verifyLineage(`astNode ${node.id}`, [node.lineage], filesByPath, issues);
  for (const dep of result.analysis.dependencies) verifyLineage(`dependency ${dep.from}->${dep.to}`, [dep.lineage], filesByPath, issues);
  for (const flow of result.analysis.dataFlows) verifyLineage(`dataFlow ${flow.id}`, flow.lineage, filesByPath, issues);

  const assertionIds = new Set<string>();
  const coveredRules = new Set<string>();
  for (const assertion of result.assertions) {
    if (assertionIds.has(assertion.assertionId)) issues.push(`duplicate assertionId ${assertion.assertionId}`);
    assertionIds.add(assertion.assertionId);
    if (!ruleIds.has(assertion.ruleId)) {
      issues.push(`assertion ${assertion.assertionId} references unknown rule ${assertion.ruleId}`);
    }
    coveredRules.add(assertion.ruleId);
    verifyLineage(`assertion ${assertion.assertionId}`, assertion.lineage, filesByPath, issues);
    if (assertion.category === "error" && assertion.expected.error === null) {
      issues.push(`assertion ${assertion.assertionId} is category=error but expected.error is null`);
    }
    if (assertion.category === "boundary" && !assertion.boundary) {
      issues.push(`assertion ${assertion.assertionId} is category=boundary but has no boundary descriptor`);
    }
  }

  for (const ruleId of ruleIds) {
    if (!coveredRules.has(ruleId)) issues.push(`rule ${ruleId} has no behavioral assertions`);
  }
  return issues;
}

/**
 * Items that do not make the payload invalid but must be resolved before the contract
 * is stamped as verified. Asking the model to "fix" these would only teach it to inflate
 * confidence, so they are recorded and routed to the spec publisher instead.
 */
export function collectReviewFlags(result: IngestResult, bundle: SourceBundle, minRuleConfidence: number): string[] {
  const flags: string[] = [];
  for (const rule of result.analysis.businessRules) {
    if (rule.confidence < minRuleConfidence) {
      flags.push(
        `LOW_CONFIDENCE ${rule.ruleId} (${rule.confidence} < ${minRuleConfidence}): ` +
          (rule.openQuestions.join(" | ") || "no open questions recorded"),
      );
    }
  }
  for (const dep of result.analysis.dependencies) {
    if (dep.external) {
      flags.push(`EXTERNAL_DEPENDENCY ${dep.kind} ${dep.from} -> ${dep.to} (${dep.lineage.file}:${dep.lineage.startLine})`);
    }
  }
  for (const skipped of bundle.skipped) {
    if (skipped.reason !== "unrecognised extension") flags.push(`SKIPPED_FILE ${skipped.path}: ${skipped.reason}`);
  }
  for (const risk of result.analysis.risks) {
    if (risk.severity === "critical") flags.push(`CRITICAL_RISK ${risk.id}: ${risk.description}`);
  }
  return flags;
}

/* ------------------------------------------------------------------------- */
/* Contract + work order assembly                                            */
/* ------------------------------------------------------------------------- */

const DEFAULT_TOLERANCE: Tolerance = { absolute: 0, relative: 0, roundingMode: "HALF_UP", scale: 2 };

export function assembleContract(
  options: IngestOptions,
  bundle: SourceBundle,
  analysis: LegacyModuleAnalysis,
  assertions: BehavioralAssertion[],
  model: string,
): BehavioralContract {
  const rules = analysis.businessRules.map((rule) => ({
    ruleId: rule.ruleId,
    description: `${rule.title}: ${rule.formalStatement}`,
    lineage: rule.lineage,
    assertionIds: assertions.filter((a) => a.ruleId === rule.ruleId).map((a) => a.assertionId),
  }));
  const contract: BehavioralContract = {
    contractVersion: "1.0.0",
    moduleId: options.moduleId,
    sourceSystem: {
      language: analysis.language,
      dialect: analysis.dialect,
      repository: options.repository,
      commitSha: options.commitSha,
      files: bundle.files.map((f) => ({ path: f.relativePath, sha256: f.sha256, lineCount: f.lineCount })),
    },
    extractedBy: {
      agent: "01_gemini_cognitive_ingest",
      model,
      extractedAt: new Date().toISOString(),
    },
    verifiedBy: null,
    defaultTolerance: DEFAULT_TOLERANCE,
    businessRules: rules,
    assertions,
  };
  return BehavioralContractSchema.parse(contract);
}

export function assembleWorkOrder(
  options: IngestOptions,
  bundle: SourceBundle,
  contract: BehavioralContract,
  slaHours: number,
  now: Date = new Date(),
): ModernizationWorkOrder {
  const sequence = (Number.parseInt(bundle.bundleHash.slice(0, 8), 16) % 1_000_000).toString().padStart(6, "0");
  const workOrder: ModernizationWorkOrder = {
    workOrderId: `WO-${now.getUTCFullYear()}-${sequence}`,
    moduleId: options.moduleId,
    clientAccount: options.clientAccount,
    podId: options.podId,
    targetLanguage: options.targetLanguage,
    targetServiceName: options.targetServiceName,
    branch: `modernize/${options.moduleId}`,
    contractVersion: contract.contractVersion,
    assertionCount: contract.assertions.length,
    acceptanceCriteria: { parityPassRate: 1, minBranchCoverage: 0.9, maxP99LatencyMs: 250 },
    slaHours,
    status: "spec_published",
    createdAt: now.toISOString(),
    dueAt: new Date(now.getTime() + slaHours * 3_600_000).toISOString(),
  };
  return ModernizationWorkOrderSchema.parse(workOrder);
}

/* ------------------------------------------------------------------------- */
/* Spec cache                                                                */
/* ------------------------------------------------------------------------- */

const SpecCacheEntrySchema = z.object({
  moduleId: ModuleIdSchema,
  bundleHash: z.string().regex(/^[a-f0-9]{64}$/),
  model: z.string(),
  createdAt: z.iso.datetime(),
  usage: z.object({
    promptTokens: z.number().int().nonnegative(),
    responseTokens: z.number().int().nonnegative(),
    totalTokens: z.number().int().nonnegative(),
  }),
  contract: BehavioralContractSchema,
  analysis: IngestResultSchema.shape.analysis,
  workOrder: ModernizationWorkOrderSchema,
  reviewFlags: z.array(z.string()),
});

export class SpecCache {
  constructor(readonly dir: string) {}

  private moduleDir(moduleId: string): string {
    return path.join(this.dir, ModuleIdSchema.parse(moduleId));
  }

  private async writeAtomic(target: string, data: string): Promise<void> {
    await fs.mkdir(path.dirname(target), { recursive: true });
    const tmp = `${target}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tmp, data, "utf8");
    await fs.rename(tmp, target);
  }

  async write(entry: SpecCacheEntry): Promise<string> {
    const validated = SpecCacheEntrySchema.parse(entry);
    const body = `${JSON.stringify(validated, null, 2)}\n`;
    const versioned = path.join(this.moduleDir(entry.moduleId), `${entry.bundleHash}.json`);
    await this.writeAtomic(versioned, body);
    await this.writeAtomic(path.join(this.moduleDir(entry.moduleId), "latest.json"), body);
    return versioned;
  }

  private async readFile(file: string): Promise<SpecCacheEntry | null> {
    let raw: string;
    try {
      raw = await fs.readFile(file, "utf8");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw error;
    }
    return SpecCacheEntrySchema.parse(JSON.parse(raw));
  }

  async readLatest(moduleId: string): Promise<SpecCacheEntry | null> {
    return this.readFile(path.join(this.moduleDir(moduleId), "latest.json"));
  }

  async readByHash(moduleId: string, bundleHash: string): Promise<SpecCacheEntry | null> {
    if (!/^[a-f0-9]{64}$/.test(bundleHash)) throw new Error("bundleHash must be a sha256 hex digest");
    return this.readFile(path.join(this.moduleDir(moduleId), `${bundleHash}.json`));
  }

  /** Replaces the latest entry in place (used when the spec publisher stamps verification). */
  async update(entry: SpecCacheEntry): Promise<string> {
    return this.write(entry);
  }

  async listModules(): Promise<string[]> {
    try {
      const entries = await fs.readdir(this.dir, { withFileTypes: true });
      const modules: string[] = [];
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const latest = path.join(this.dir, entry.name, "latest.json");
        if (await fs.stat(latest).then(() => true, () => false)) modules.push(entry.name);
      }
      return modules.sort();
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw error;
    }
  }
}

/* ------------------------------------------------------------------------- */
/* Gemini client                                                             */
/* ------------------------------------------------------------------------- */

const FALLBACK_SYSTEM_INSTRUCTION = [
  "You are the Macro-Cognitive Legacy Ingest Agent for LegacyModern AI.",
  "Reverse-engineer the supplied legacy subsystem and return ONLY a JSON object with keys `analysis` and `assertions`",
  "that conforms to the response schema. Cite exact file paths and the 6-digit line numbers shown in the corpus for",
  "every AST node, dependency, data flow, business rule and assertion. Model COBOL COMP-3 packed decimals, PIC clause",
  "scale and sign, ROUNDED semantics, PL/SQL package state, and global/WORKING-STORAGE variables precisely.",
  "Produce nominal, boundary, error and state_transition assertions for every business rule. Never invent behavior",
  "that is not present in the source; record uncertainty in openQuestions and lower the confidence score instead.",
].join(" ");

function isRetryable(error: unknown): boolean {
  if (error instanceof ApiError) return error.status === 429 || error.status >= 500;
  const code = (error as NodeJS.ErrnoException | undefined)?.code;
  return code === "ECONNRESET" || code === "ETIMEDOUT" || code === "EAI_AGAIN";
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export interface IngestOutcome {
  entry: SpecCacheEntry;
  cachePath: string;
  fromCache: boolean;
  skipped: SourceBundle["skipped"];
}

export class GeminiIngestClient {
  private readonly ai: GoogleGenAI | null;
  readonly cache: SpecCache;

  constructor(readonly config: GeminiClientConfig = loadConfigFromEnv()) {
    this.ai = config.apiKey ? new GoogleGenAI({ apiKey: config.apiKey }) : null;
    this.cache = new SpecCache(config.cacheDir);
  }

  private requireClient(): GoogleGenAI {
    if (!this.ai) {
      throw new Error("GEMINI_API_KEY (or GOOGLE_API_KEY) is not set; ingestion requires a Gemini API key.");
    }
    return this.ai;
  }

  private async loadSystemInstruction(): Promise<string> {
    try {
      const prompt = await fs.readFile(this.config.ingestPromptPath, "utf8");
      if (prompt.trim().length > 0) return prompt;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    return FALLBACK_SYSTEM_INSTRUCTION;
  }

  /** Calls generateContent with exponential backoff on 429/5xx/network errors. */
  private async generateWithRetry(contents: Content[], systemInstruction: string) {
    const ai = this.requireClient();
    const maxNetworkRetries = 4;
    for (let attempt = 0; ; attempt++) {
      try {
        return await ai.models.generateContent({
          model: this.config.model,
          contents,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseJsonSchema: buildGeminiResponseSchema(),
            temperature: 0,
            maxOutputTokens: 65_536,
          },
        });
      } catch (error) {
        if (attempt >= maxNetworkRetries || !isRetryable(error)) throw error;
        await sleep(2 ** attempt * 2_000);
      }
    }
  }

  private buildUserPrompt(options: IngestOptions, bundle: SourceBundle): string {
    return [
      `MODULE ID: ${options.moduleId}`,
      `SOURCE REPOSITORY: ${options.repository} @ ${options.commitSha}`,
      `TARGET: ${options.targetLanguage} service "${options.targetServiceName}"`,
      `FILES: ${bundle.files.length} | LINES: ${bundle.totalLines} | BUNDLE SHA256: ${bundle.bundleHash}`,
      "",
      "Analyse the complete corpus below. Use the file paths exactly as written in the FILE headers and the",
      "6-digit line numbers as lineage. Return the JSON object described by the response schema and nothing else.",
      "",
      renderBundle(bundle),
    ].join("\n");
  }

  /**
   * Ingests a legacy subsystem end to end and returns the cached, verified specification.
   * Re-uses the cache when the bundle hash is unchanged unless `forceRefresh` is set.
   */
  async ingest(options: IngestOptions): Promise<IngestOutcome> {
    ModuleIdSchema.parse(options.moduleId);
    const bundle = await bundleLegacySources(options.rootDir, {
      maxBundleBytes: this.config.maxBundleBytes,
      maxFileBytes: this.config.maxFileBytes,
    });

    if (!options.forceRefresh) {
      const cached = await this.cache.readByHash(options.moduleId, bundle.bundleHash);
      if (cached) {
        const cachePath = path.join(this.cache.dir, options.moduleId, `${bundle.bundleHash}.json`);
        return { entry: cached, cachePath, fromCache: true, skipped: bundle.skipped };
      }
    }

    const ai = this.requireClient();
    const systemInstruction = await this.loadSystemInstruction();
    const userPrompt = this.buildUserPrompt(options, bundle);
    const contents: Content[] = [{ role: "user", parts: [{ text: userPrompt }] }];

    const tokenCount = await ai.models.countTokens({ model: this.config.model, contents });
    const promptTokens = tokenCount.totalTokens ?? 0;
    if (promptTokens > this.config.maxInputTokens) {
      throw new Error(
        `Subsystem renders to ${promptTokens} tokens, above GEMINI_MAX_INPUT_TOKENS=${this.config.maxInputTokens}. ` +
          "Split the module along CALL/package boundaries and ingest the parts separately.",
      );
    }

    let usagePrompt = 0;
    let usageResponse = 0;
    let lastIssues: string[] = [];

    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      const response = await this.generateWithRetry(contents, systemInstruction);
      usagePrompt += response.usageMetadata?.promptTokenCount ?? 0;
      usageResponse +=
        (response.usageMetadata?.candidatesTokenCount ?? 0) + (response.usageMetadata?.thoughtsTokenCount ?? 0);

      const text = response.text ?? "";
      let issues: string[];
      let parsed: IngestResult | null = null;
      try {
        const candidate = IngestResultSchema.safeParse(JSON.parse(text));
        if (candidate.success) {
          parsed = candidate.data;
          issues = verifyIngestResult(parsed, bundle);
        } else {
          issues = candidate.error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`);
        }
      } catch (error) {
        issues = [`response is not valid JSON: ${(error as Error).message}`];
      }

      if (parsed && issues.length === 0) {
        const analysis: LegacyModuleAnalysis = {
          ...parsed.analysis,
          moduleId: options.moduleId,
          // Never trust model-reported hashes or line counts; use the measured bundle.
          sourceFiles: bundle.files.map((f) => ({
            path: f.relativePath,
            sha256: f.sha256,
            lineCount: f.lineCount,
            language: f.language,
          })),
        };
        const contract = assembleContract(options, bundle, analysis, parsed.assertions, this.config.model);
        const workOrder = assembleWorkOrder(options, bundle, contract, this.config.defaultSlaHours);
        const entry: SpecCacheEntry = {
          moduleId: options.moduleId,
          bundleHash: bundle.bundleHash,
          model: this.config.model,
          createdAt: new Date().toISOString(),
          usage: {
            promptTokens: usagePrompt,
            responseTokens: usageResponse,
            totalTokens: usagePrompt + usageResponse,
          },
          contract,
          analysis,
          workOrder,
          reviewFlags: collectReviewFlags(parsed, bundle, this.config.minRuleConfidence),
        };
        const cachePath = await this.cache.write(entry);
        return { entry, cachePath, fromCache: false, skipped: bundle.skipped };
      }

      lastIssues = issues;
      contents.push({ role: "model", parts: [{ text }] });
      contents.push({
        role: "user",
        parts: [
          {
            text:
              "Your previous response failed validation. Fix every issue below and return the complete corrected " +
              "JSON object (not a diff). Do not lower standards to pass: if a rule is genuinely uncertain, keep the " +
              "low confidence and explain it in openQuestions.\n- " +
              issues.slice(0, 200).join("\n- "),
          },
        ],
      });
    }

    throw new IngestValidationError(
      `Gemini output for ${options.moduleId} failed validation after ${this.config.maxAttempts} attempt(s)`,
      lastIssues,
    );
  }
}
