/**
 * Canonical type system for the LegacyModern AI specification bridge.
 *
 * Every artifact that crosses an agent boundary (Gemini ingest -> spec publisher ->
 * Claude Code transpiler -> parity gatekeeper) is described here, together with a
 * runtime Zod schema so that payloads coming back from an LLM or from disk are
 * validated before anything downstream trusts them.
 */
import { z } from "zod";

/* ------------------------------------------------------------------------- */
/* Shared primitives                                                         */
/* ------------------------------------------------------------------------- */

export const LEGACY_LANGUAGES = [
  "COBOL",
  "PL/I",
  "PL/SQL",
  "JCL",
  "Java",
  "RPG",
  "Natural",
  "Assembler",
  "CICS-BMS",
  "SQL",
  "Other",
] as const;
export type LegacyLanguage = (typeof LEGACY_LANGUAGES)[number];

export const TARGET_LANGUAGES = ["Go", "TypeScript"] as const;
export type TargetLanguage = (typeof TARGET_LANGUAGES)[number];

/** Module identifiers double as branch names (`modernize/<module-id>`), so keep them git-safe. */
export const MODULE_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
export const ModuleIdSchema = z
  .string()
  .regex(MODULE_ID_PATTERN, "moduleId must be 1-64 chars of [A-Za-z0-9._-] and start alphanumeric");

/** A pointer back into the legacy source. Every rule and assertion must carry at least one. */
export const SourceLineageSchema = z.object({
  file: z.string().min(1),
  startLine: z.number().int().positive(),
  endLine: z.number().int().positive(),
  symbol: z.string().optional(),
});
export type SourceLineage = z.infer<typeof SourceLineageSchema>;

/* ------------------------------------------------------------------------- */
/* Legacy module analysis (Gemini output)                                    */
/* ------------------------------------------------------------------------- */

export const AST_NODE_KINDS = [
  "program",
  "division",
  "section",
  "paragraph",
  "copybook",
  "record",
  "field",
  "package",
  "procedure",
  "function",
  "trigger",
  "cursor",
  "class",
  "method",
  "sql_statement",
  "file_descriptor",
  "screen_map",
  "job_step",
] as const;

export const AstNodeSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(AST_NODE_KINDS),
  name: z.string().min(1),
  parentId: z.string().nullable(),
  lineage: SourceLineageSchema,
  /** PIC clause, SQL type, or Java type — the declared data shape when the node is data. */
  dataType: z.string().optional(),
  /** Physical storage hints that change arithmetic semantics (COMP-3, COMP, DISPLAY, NUMBER(p,s)). */
  storage: z
    .object({
      usage: z.string(),
      precision: z.number().int().nonnegative().optional(),
      scale: z.number().int().optional(),
      signed: z.boolean().optional(),
      byteLength: z.number().int().positive().optional(),
    })
    .optional(),
  annotations: z.array(z.string()).default([]),
});
export type AstNode = z.infer<typeof AstNodeSchema>;

export const DEPENDENCY_KINDS = [
  "CALL",
  "COPY",
  "INCLUDE",
  "EXEC_SQL",
  "EXEC_CICS",
  "DB_TABLE_READ",
  "DB_TABLE_WRITE",
  "FILE_READ",
  "FILE_WRITE",
  "MQ_PUT",
  "MQ_GET",
  "PACKAGE_REF",
  "JAVA_IMPORT",
  "JOB_STEP",
] as const;

export const DependencySchema = z.object({
  kind: z.enum(DEPENDENCY_KINDS),
  from: z.string().min(1),
  to: z.string().min(1),
  /** true when the target was not present in the ingested bundle and must be stubbed or ingested later. */
  external: z.boolean(),
  lineage: SourceLineageSchema,
});
export type Dependency = z.infer<typeof DependencySchema>;

export const DataFlowSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  sink: z.string().min(1),
  transformation: z.string().min(1),
  /** Global / WORKING-STORAGE / package-state variables touched along the way. */
  sharedState: z.array(z.string()).default([]),
  lineage: z.array(SourceLineageSchema).min(1),
});
export type DataFlow = z.infer<typeof DataFlowSchema>;

export const RULE_CATEGORIES = [
  "calculation",
  "validation",
  "routing",
  "state_transition",
  "persistence",
  "error_handling",
  "rounding",
  "date_time",
  "authorization",
  "formatting",
] as const;

export const BusinessRuleSchema = z.object({
  ruleId: z.string().regex(/^BR-[0-9]{3,}$/, "ruleId must look like BR-001"),
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(RULE_CATEGORIES),
  /** Precise statement of the rule, formulas included, written so a test can be derived from it. */
  formalStatement: z.string().min(1),
  inputs: z.array(z.string()).min(1),
  outputs: z.array(z.string()).min(1),
  lineage: z.array(SourceLineageSchema).min(1),
  /** 0..1 — how sure the ingest agent is. Anything below the publish threshold blocks publication. */
  confidence: z.number().min(0).max(1),
  openQuestions: z.array(z.string()).default([]),
});
export type BusinessRule = z.infer<typeof BusinessRuleSchema>;

export const LegacyModuleAnalysisSchema = z.object({
  moduleId: ModuleIdSchema,
  displayName: z.string().min(1),
  language: z.enum(LEGACY_LANGUAGES),
  dialect: z.string().min(1),
  summary: z.string().min(1),
  sourceFiles: z
    .array(
      z.object({
        path: z.string().min(1),
        sha256: z.string().regex(/^[a-f0-9]{64}$/),
        lineCount: z.number().int().nonnegative(),
        language: z.enum(LEGACY_LANGUAGES),
      }),
    )
    .min(1),
  astNodes: z.array(AstNodeSchema).min(1),
  dependencies: z.array(DependencySchema),
  dataFlows: z.array(DataFlowSchema),
  businessRules: z.array(BusinessRuleSchema).min(1),
  globalState: z.array(
    z.object({
      name: z.string().min(1),
      declaredAt: SourceLineageSchema,
      writers: z.array(z.string()),
      readers: z.array(z.string()),
      risk: z.enum(["low", "medium", "high"]),
    }),
  ),
  risks: z.array(
    z.object({
      id: z.string().min(1),
      severity: z.enum(["low", "medium", "high", "critical"]),
      description: z.string().min(1),
      mitigation: z.string().min(1),
      lineage: z.array(SourceLineageSchema),
    }),
  ),
  metrics: z.object({
    totalLines: z.number().int().nonnegative(),
    executableLines: z.number().int().nonnegative(),
    cyclomaticComplexity: z.number().int().nonnegative(),
    deadCodeLines: z.number().int().nonnegative(),
  }),
});
export type LegacyModuleAnalysis = z.infer<typeof LegacyModuleAnalysisSchema>;

/* ------------------------------------------------------------------------- */
/* Behavioral assertions (the parity contract)                               */
/* ------------------------------------------------------------------------- */

export const ASSERTION_CATEGORIES = [
  "nominal",
  "boundary",
  "error",
  "state_transition",
  "regression",
] as const;

export const ToleranceSchema = z.object({
  /** Maximum absolute difference allowed for numeric comparisons. 0 means exact. */
  absolute: z.number().nonnegative(),
  /** Maximum relative difference (|a-e|/|e|). 0 disables the relative check. */
  relative: z.number().nonnegative(),
  roundingMode: z.enum(["HALF_UP", "HALF_EVEN", "TRUNCATE", "CEILING", "FLOOR"]),
  /** Decimal places the legacy field carries (e.g. 2 for PIC S9(9)V99). */
  scale: z.number().int().nonnegative(),
});
export type Tolerance = z.infer<typeof ToleranceSchema>;

export const StateTransitionSchema = z.object({
  entity: z.string().min(1),
  field: z.string().min(1),
  before: z.unknown(),
  after: z.unknown(),
});
export type StateTransition = z.infer<typeof StateTransitionSchema>;

export const BoundaryConditionSchema = z.object({
  field: z.string().min(1),
  kind: z.enum(["min", "max", "min_minus_one", "max_plus_one", "zero", "empty", "null", "overflow", "precision_edge"]),
  value: z.unknown(),
  rationale: z.string().min(1),
});
export type BoundaryCondition = z.infer<typeof BoundaryConditionSchema>;

export const BehavioralAssertionSchema = z.object({
  assertionId: z.string().regex(/^A-[0-9]{3,}$/, "assertionId must look like A-001"),
  ruleId: z.string().regex(/^BR-[0-9]{3,}$/),
  operation: z.string().min(1),
  category: z.enum(ASSERTION_CATEGORIES),
  description: z.string().min(1),
  /** The input vector, keyed by the modern field name. */
  inputs: z.record(z.string(), z.unknown()),
  initialState: z.record(z.string(), z.unknown()).default({}),
  expected: z.object({
    outputs: z.record(z.string(), z.unknown()),
    error: z
      .object({
        code: z.string().min(1),
        legacyReturnCode: z.string().optional(),
      })
      .nullable(),
    stateTransitions: z.array(StateTransitionSchema).default([]),
  }),
  tolerance: ToleranceSchema.optional(),
  /** "rtrim" mirrors COBOL PIC X space padding; "exact" for everything else. */
  stringComparison: z.enum(["exact", "rtrim"]).default("exact"),
  boundary: BoundaryConditionSchema.optional(),
  lineage: z.array(SourceLineageSchema).min(1),
  /** Where the vector came from: synthesized by the agent or replayed from production capture. */
  provenance: z.enum(["synthesized", "production_capture", "client_supplied"]),
});
export type BehavioralAssertion = z.infer<typeof BehavioralAssertionSchema>;

export const BehavioralContractSchema = z.object({
  contractVersion: z.string().regex(/^[0-9]+\.[0-9]+\.[0-9]+$/),
  moduleId: ModuleIdSchema,
  sourceSystem: z.object({
    language: z.enum(LEGACY_LANGUAGES),
    dialect: z.string().min(1),
    repository: z.string().min(1),
    commitSha: z.string().min(7),
    files: z
      .array(
        z.object({
          path: z.string().min(1),
          sha256: z.string().regex(/^[a-f0-9]{64}$/),
          lineCount: z.number().int().nonnegative(),
        }),
      )
      .min(1),
  }),
  extractedBy: z.object({
    agent: z.string().min(1),
    model: z.string().min(1),
    extractedAt: z.iso.datetime(),
  }),
  verifiedBy: z
    .object({
      agent: z.string().min(1),
      verifiedAt: z.iso.datetime(),
      findings: z.array(z.string()),
    })
    .nullable(),
  defaultTolerance: ToleranceSchema,
  businessRules: z
    .array(
      z.object({
        ruleId: z.string().regex(/^BR-[0-9]{3,}$/),
        description: z.string().min(1),
        lineage: z.array(SourceLineageSchema).min(1),
        assertionIds: z.array(z.string()).min(1),
      }),
    )
    .min(1),
  assertions: z.array(BehavioralAssertionSchema).min(1),
});
export type BehavioralContract = z.infer<typeof BehavioralContractSchema>;

/* ------------------------------------------------------------------------- */
/* Work orders (handoff to Claude Code)                                      */
/* ------------------------------------------------------------------------- */

export const WORK_ORDER_STATUSES = [
  "draft",
  "spec_published",
  "characterization_in_progress",
  "transpilation_in_progress",
  "parity_review",
  "approved",
  "rejected",
  "delivered",
] as const;
export type WorkOrderStatus = (typeof WORK_ORDER_STATUSES)[number];

export const ModernizationWorkOrderSchema = z.object({
  workOrderId: z.string().regex(/^WO-[0-9]{4}-[0-9]{4,}$/),
  moduleId: ModuleIdSchema,
  clientAccount: z.string().min(1),
  podId: z.string().min(1),
  targetLanguage: z.enum(TARGET_LANGUAGES),
  targetServiceName: z.string().regex(/^[a-z][a-z0-9-]{1,62}$/),
  branch: z.string().regex(/^modernize\/[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/),
  contractVersion: z.string().regex(/^[0-9]+\.[0-9]+\.[0-9]+$/),
  assertionCount: z.number().int().positive(),
  acceptanceCriteria: z.object({
    parityPassRate: z.literal(1),
    minBranchCoverage: z.number().min(0.9).max(1),
    maxP99LatencyMs: z.number().positive(),
  }),
  /** Turnaround in Provider Business Days (Mon-Fri, India Standard Time), per the MSA Exhibit B. */
  slaBusinessDays: z.number().int().positive(),
  status: z.enum(WORK_ORDER_STATUSES),
  createdAt: z.iso.datetime(),
  dueAt: z.iso.datetime(),
});
export type ModernizationWorkOrder = z.infer<typeof ModernizationWorkOrderSchema>;

/* ------------------------------------------------------------------------- */
/* Gemini response envelope + cache entry                                    */
/* ------------------------------------------------------------------------- */

/** What Gemini is asked to return in a single structured response. */
export const IngestResultSchema = z.object({
  analysis: LegacyModuleAnalysisSchema,
  assertions: z.array(BehavioralAssertionSchema).min(1),
});
export type IngestResult = z.infer<typeof IngestResultSchema>;

export interface SourceFile {
  /** Path relative to the subsystem root, always forward-slash separated. */
  relativePath: string;
  absolutePath: string;
  language: LegacyLanguage;
  sha256: string;
  lineCount: number;
  bytes: number;
  content: string;
}

export interface SourceBundle {
  rootDir: string;
  files: SourceFile[];
  totalBytes: number;
  totalLines: number;
  /** sha256 over the sorted (path, sha256) pairs — the cache key for the whole subsystem. */
  bundleHash: string;
  skipped: Array<{ path: string; reason: string }>;
}

export interface SpecCacheEntry {
  moduleId: string;
  bundleHash: string;
  model: string;
  createdAt: string;
  usage: {
    promptTokens: number;
    responseTokens: number;
    totalTokens: number;
  };
  contract: BehavioralContract;
  analysis: LegacyModuleAnalysis;
  workOrder: ModernizationWorkOrder;
  /**
   * Items a human or the spec publisher must resolve before the contract can be stamped
   * as verified (low-confidence rules, unresolved external dependencies, skipped files).
   */
  reviewFlags: string[];
}

export interface IngestOptions {
  moduleId: string;
  rootDir: string;
  repository: string;
  commitSha: string;
  clientAccount: string;
  podId: string;
  targetLanguage: TargetLanguage;
  targetServiceName: string;
  /** Re-run Gemini even when a cache entry exists for the same bundle hash. */
  forceRefresh: boolean;
}
