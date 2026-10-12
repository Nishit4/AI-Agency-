// End-to-end tests for the Legacy Spec Bridge. Run with `npm test` (builds first).
// No Gemini key is needed: the cache is seeded with a fixture and ingest is exercised
// only up to the point where it must call the API.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import {
  bundleLegacySources,
  buildGeminiResponseSchema,
  collectReviewFlags,
  renderBundle,
  verifyIngestResult,
} from "../dist/gemini_client.js";
import { BehavioralContractSchema } from "../dist/types.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const serverEntry = path.resolve(here, "..", "dist", "index.js");
const SHA = "a".repeat(64);

function lineage(startLine, endLine) {
  return { file: "src/LNFEE010.cbl", startLine, endLine };
}

function fixtureAnalysis() {
  return {
    moduleId: "LNFEE010",
    displayName: "Loan late-fee assessment",
    language: "COBOL",
    dialect: "IBM Enterprise COBOL 6.3",
    summary: "Assesses late fees on past-due loan accounts and advances delinquency status.",
    sourceFiles: [{ path: "src/LNFEE010.cbl", sha256: SHA, lineCount: 40, language: "COBOL" }],
    astNodes: [{ id: "N1", kind: "program", name: "LNFEE010", parentId: null, lineage: lineage(1, 40), annotations: [] }],
    dependencies: [],
    dataFlows: [],
    businessRules: [
      {
        ruleId: "BR-001",
        title: "Late fee",
        description: "5% of balance, capped at 25.00, after a 15-day grace period",
        category: "calculation",
        formalStatement: "fee = min(round_half_up(balance * 0.05, 2), 25.00) when daysPastDue > 15",
        inputs: ["outstandingBalance", "daysPastDue"],
        outputs: ["lateFee"],
        lineage: [lineage(20, 28)],
        confidence: 0.6,
        openQuestions: ["Is the cap applied before or after rounding?"],
      },
    ],
    globalState: [],
    risks: [],
    metrics: { totalLines: 40, executableLines: 22, cyclomaticComplexity: 4, deadCodeLines: 0 },
  };
}

function fixtureAssertion(id, overrides = {}) {
  return {
    assertionId: id,
    ruleId: "BR-001",
    operation: "AssessLateFee",
    category: "nominal",
    description: "Balance 100.10, 20 days past due",
    inputs: { outstandingBalance: "100.10", daysPastDue: 20, accountStatus: "CURRENT" },
    initialState: {},
    expected: { outputs: { lateFee: "5.01" }, error: null, stateTransitions: [] },
    stringComparison: "exact",
    lineage: [lineage(20, 28)],
    provenance: "synthesized",
    ...overrides,
  };
}

function fixtureEntry() {
  const analysis = fixtureAnalysis();
  const assertions = [fixtureAssertion("A-001")];
  return {
    moduleId: "LNFEE010",
    bundleHash: SHA,
    model: "gemini-2.5-pro",
    createdAt: "2026-10-01T09:00:00.000Z",
    usage: { promptTokens: 1200, responseTokens: 900, totalTokens: 2100 },
    analysis,
    contract: {
      contractVersion: "1.0.0",
      moduleId: "LNFEE010",
      sourceSystem: {
        language: "COBOL",
        dialect: "IBM Enterprise COBOL 6.3",
        repository: "git@example.internal:loans/mainframe.git",
        commitSha: "4f2c9e1",
        files: [{ path: "src/LNFEE010.cbl", sha256: SHA, lineCount: 40 }],
      },
      extractedBy: { agent: "01_gemini_cognitive_ingest", model: "gemini-2.5-pro", extractedAt: "2026-10-01T09:00:00.000Z" },
      verifiedBy: null,
      defaultTolerance: { absolute: 0, relative: 0, roundingMode: "HALF_UP", scale: 2 },
      businessRules: [{ ruleId: "BR-001", description: "Late fee", lineage: [lineage(20, 28)], assertionIds: ["A-001"] }],
      assertions,
    },
    workOrder: {
      workOrderId: "WO-2026-000123",
      moduleId: "LNFEE010",
      clientAccount: "ACME-BANK",
      podId: "pod-alpha",
      targetLanguage: "Go",
      targetServiceName: "late-fee-service",
      branch: "modernize/LNFEE010",
      contractVersion: "1.0.0",
      assertionCount: 1,
      acceptanceCriteria: { parityPassRate: 1, minBranchCoverage: 0.9, maxP99LatencyMs: 250 },
      slaHours: 72,
      status: "spec_published",
      createdAt: "2026-10-01T09:00:00.000Z",
      dueAt: "2026-10-04T09:00:00.000Z",
    },
    reviewFlags: ["LOW_CONFIDENCE BR-001 (0.6 < 0.8): Is the cap applied before or after rounding?"],
  };
}

async function withServer(fn) {
  const cacheDir = await mkdtemp(path.join(tmpdir(), "spec-cache-"));
  await mkdir(path.join(cacheDir, "LNFEE010"), { recursive: true });
  await writeFile(path.join(cacheDir, "LNFEE010", "latest.json"), JSON.stringify(fixtureEntry(), null, 2));
  const env = { ...process.env, SPEC_CACHE_DIR: cacheDir };
  delete env.GEMINI_API_KEY;
  delete env.GOOGLE_API_KEY;
  const transport = new StdioClientTransport({ command: process.execPath, args: [serverEntry], env, stderr: "pipe" });
  const client = new Client({ name: "bridge-test", version: "1.0.0" });
  await client.connect(transport);
  try {
    await fn(client, cacheDir);
  } finally {
    await client.close();
    await rm(cacheDir, { recursive: true, force: true });
  }
}

function parse(result) {
  return JSON.parse(result.content[0].text);
}

test("server lists the four tools and the behavioral-assertions template", async () => {
  await withServer(async (client) => {
    const { tools } = await client.listTools();
    assert.deepEqual(
      tools.map((t) => t.name).sort(),
      ["get_subsystem_spec", "ingest_legacy_subsystem", "list_ingested_modules", "publish_verified_contract"],
    );
    const { resourceTemplates } = await client.listResourceTemplates();
    assert.equal(resourceTemplates[0].uriTemplate, "legacy://behavioral-assertions/{moduleId}");
    const { resources } = await client.listResources();
    assert.equal(resources[0].uri, "legacy://behavioral-assertions/LNFEE010");
  });
});

test("get_subsystem_spec and the resource return the cached contract", async () => {
  await withServer(async (client) => {
    const summary = parse(await client.callTool({ name: "get_subsystem_spec", arguments: { moduleId: "LNFEE010" } }));
    assert.equal(summary.assertions, 1);
    assert.equal(summary.verified, false);
    assert.equal(summary.reviewFlags.length, 1);

    const resource = await client.readResource({ uri: "legacy://behavioral-assertions/LNFEE010" });
    const contract = JSON.parse(resource.contents[0].text);
    assert.equal(contract.moduleId, "LNFEE010");
    assert.equal(contract.assertions[0].expected.outputs.lateFee, "5.01");

    const missing = await client.callTool({ name: "get_subsystem_spec", arguments: { moduleId: "NOPE01" } });
    assert.equal(missing.isError, true);
  });
});

test("publish_verified_contract refuses unresolved flags, then publishes with resolutions", async () => {
  await withServer(async (client) => {
    const refused = await client.callTool({
      name: "publish_verified_contract",
      arguments: { moduleId: "LNFEE010", findings: ["audit complete"] },
    });
    assert.equal(refused.isError, true);
    assert.match(refused.content[0].text, /unresolved/);

    const flag = fixtureEntry().reviewFlags[0];
    const boundary = fixtureAssertion("A-002", {
      category: "boundary",
      description: "Exactly 15 days past due is still inside the grace period",
      inputs: { outstandingBalance: "100.00", daysPastDue: 15, accountStatus: "CURRENT" },
      expected: { outputs: { lateFee: "0.00" }, error: null, stateTransitions: [] },
      boundary: { field: "daysPastDue", kind: "max", value: 15, rationale: "Grace period upper bound (IF WS-DPD > 15)" },
    });
    const published = await client.callTool({
      name: "publish_verified_contract",
      arguments: {
        moduleId: "LNFEE010",
        findings: ["Added grace-period boundary assertion"],
        resolutions: [{ flag, resolution: "Confirmed with client SME: cap applies after ROUNDED, per line 26." }],
        amendedAssertions: [boundary],
      },
    });
    assert.notEqual(published.isError, true, published.content[0].text);
    const body = parse(published);
    assert.equal(body.contractVersion, "1.1.0");
    assert.equal(body.verified, true);
    assert.equal(body.assertions, 2);
    assert.deepEqual(body.reviewFlags, []);
  });
});

test("ingest without a Gemini key fails cleanly after bundling", async () => {
  await withServer(async (client, cacheDir) => {
    const legacyRoot = path.join(cacheDir, "..", `legacy-${process.pid}`);
    await mkdir(path.join(legacyRoot, "src"), { recursive: true });
    await writeFile(path.join(legacyRoot, "src", "LNFEE010.cbl"), "       IDENTIFICATION DIVISION.\n       PROGRAM-ID. LNFEE010.\n");
    try {
      const result = await client.callTool({
        name: "ingest_legacy_subsystem",
        arguments: {
          moduleId: "LNFEE010",
          rootDir: legacyRoot,
          repository: "loans/mainframe",
          commitSha: "4f2c9e1",
          clientAccount: "ACME-BANK",
          podId: "pod-alpha",
          targetServiceName: "late-fee-service",
        },
      });
      assert.equal(result.isError, true);
      assert.match(result.content[0].text, /GEMINI_API_KEY/);
    } finally {
      await rm(legacyRoot, { recursive: true, force: true });
    }
  });
});

test("bundler numbers lines, hashes deterministically and skips unknown files", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "legacy-"));
  try {
    await mkdir(path.join(root, "copybooks"), { recursive: true });
    await writeFile(path.join(root, "LNFEE010.cbl"), "       IDENTIFICATION DIVISION.\r\n       PROGRAM-ID. LNFEE010.\r\n");
    await writeFile(path.join(root, "copybooks", "LNACCT.cpy"), "       01 LN-ACCOUNT.\n          05 LN-BAL PIC S9(9)V99 COMP-3.\n");
    await writeFile(path.join(root, "notes.txt"), "not source");
    const limits = { maxBundleBytes: 1_000_000, maxFileBytes: 100_000 };
    const first = await bundleLegacySources(root, limits);
    const second = await bundleLegacySources(root, limits);
    assert.equal(first.bundleHash, second.bundleHash);
    assert.deepEqual(first.files.map((f) => f.relativePath), ["copybooks/LNACCT.cpy", "LNFEE010.cbl"]);
    assert.deepEqual(first.skipped, [{ path: "notes.txt", reason: "unrecognised extension" }]);
    const rendered = renderBundle(first);
    assert.match(rendered, /000002\|\s+05 LN-BAL PIC S9\(9\)V99 COMP-3\./);
    assert.doesNotMatch(rendered, /\r/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("verification catches bad lineage and missing coverage; flags capture low confidence", () => {
  const bundle = {
    rootDir: "/legacy",
    files: [{ relativePath: "src/LNFEE010.cbl", absolutePath: "/legacy/src/LNFEE010.cbl", language: "COBOL", sha256: SHA, lineCount: 40, bytes: 1, content: "" }],
    totalBytes: 1,
    totalLines: 40,
    bundleHash: SHA,
    skipped: [],
  };
  const good = { analysis: fixtureAnalysis(), assertions: [fixtureAssertion("A-001")] };
  assert.deepEqual(verifyIngestResult(good, bundle), []);
  assert.equal(collectReviewFlags(good, bundle, 0.8).length, 1);

  const bad = {
    analysis: fixtureAnalysis(),
    assertions: [fixtureAssertion("A-001", { ruleId: "BR-999", lineage: [{ file: "src/LNFEE010.cbl", startLine: 30, endLine: 99 }] })],
  };
  const issues = verifyIngestResult(bad, bundle);
  assert.ok(issues.some((i) => i.includes("unknown rule BR-999")));
  assert.ok(issues.some((i) => i.includes("past end of file")));
  assert.ok(issues.some((i) => i.includes("rule BR-001 has no behavioral assertions")));
});

test("Gemini response schema only carries supported keywords", () => {
  const schema = JSON.stringify(buildGeminiResponseSchema());
  assert.doesNotMatch(schema, /"pattern"/);
  assert.doesNotMatch(schema, /"\$schema"/);
  assert.doesNotMatch(schema, /"format"/);
  assert.match(schema, /"assertions"/);
});

test("template contract satisfies the bridge schema and matches the sample legacy bundle", async () => {
  const agencyRoot = path.resolve(here, "..", "..");
  const template = JSON.parse(await readFile(path.join(agencyRoot, "templates", "behavioral_contract.json"), "utf8"));
  assert.ok(template.examples.length >= 1);
  const contract = BehavioralContractSchema.parse(template.examples[0]);

  const bundle = await bundleLegacySources(path.join(agencyRoot, "examples", "legacy", "LNFEE010"), {
    maxBundleBytes: 1_000_000,
    maxFileBytes: 100_000,
  });
  const measured = Object.fromEntries(bundle.files.map((f) => [f.relativePath, f]));
  for (const file of contract.sourceSystem.files) {
    assert.ok(measured[file.path], `bundle is missing ${file.path}`);
    assert.equal(measured[file.path].sha256, file.sha256, `sha256 drift for ${file.path}`);
    assert.equal(measured[file.path].lineCount, file.lineCount, `line count drift for ${file.path}`);
  }
});
