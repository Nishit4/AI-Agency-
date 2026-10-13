// Package characterization is the LegacyModern AI parity harness.
//
// It loads a behavioral contract (templates/behavioral_contract.json or the file named by
// BEHAVIORAL_CONTRACT), replays every assertion against the registered modern operation,
// and fails unless 100% of assertions match the legacy behavior exactly:
//
//   - numbers and decimal strings are compared as exact rationals (math/big), within the
//     assertion's tolerance (or the contract default), and may not carry more decimal
//     places than the legacy field's scale;
//   - output maps must have exactly the expected keys;
//   - expected errors must match by code and legacy return code;
//   - every declared state transition must happen and no undeclared state may change.
//
// Usage:
//
//	go test -v -cover ./...
//	BEHAVIORAL_CONTRACT=/path/to/contract.json PARITY_REPORT_PATH=parity.json go test -v ./...
//	REQUIRE_VERIFIED_CONTRACT=1 go test ./...                # refuse contracts not verified by the spec publisher
//	SPEC_ONLY=1 go test -run TestContractIntegrity ./...     # audit a contract before any adapter exists
//
// To characterize a real module, replace the reference adapter in `operations` with an
// adapter that calls the modern service (in-process or over HTTP) and keep everything else.
package characterization

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"math/big"
	"os"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"testing"
	"time"
)

// ---------------------------------------------------------------------------
// Contract model (mirrors templates/behavioral_contract.json and mcp_bridge/src/types.ts)
// ---------------------------------------------------------------------------

type Lineage struct {
	File      string `json:"file"`
	StartLine int    `json:"startLine"`
	EndLine   int    `json:"endLine"`
	Symbol    string `json:"symbol,omitempty"`
}

type Tolerance struct {
	Absolute     json.Number `json:"absolute"`
	Relative     json.Number `json:"relative"`
	RoundingMode string      `json:"roundingMode"`
	Scale        int         `json:"scale"`
}

type StateTransition struct {
	Entity string `json:"entity"`
	Field  string `json:"field"`
	Before any    `json:"before"`
	After  any    `json:"after"`
}

type ExpectedError struct {
	Code             string `json:"code"`
	LegacyReturnCode string `json:"legacyReturnCode,omitempty"`
}

type Expected struct {
	Outputs          map[string]any    `json:"outputs"`
	Error            *ExpectedError    `json:"error"`
	StateTransitions []StateTransition `json:"stateTransitions"`
}

type Boundary struct {
	Field     string `json:"field"`
	Kind      string `json:"kind"`
	Value     any    `json:"value"`
	Rationale string `json:"rationale"`
}

type Assertion struct {
	AssertionID      string         `json:"assertionId"`
	RuleID           string         `json:"ruleId"`
	Operation        string         `json:"operation"`
	Category         string         `json:"category"`
	Description      string         `json:"description"`
	Inputs           map[string]any `json:"inputs"`
	InitialState     map[string]any `json:"initialState"`
	Expected         Expected       `json:"expected"`
	Tolerance        *Tolerance     `json:"tolerance,omitempty"`
	StringComparison string         `json:"stringComparison"`
	Boundary         *Boundary      `json:"boundary,omitempty"`
	Lineage          []Lineage      `json:"lineage"`
	Provenance       string         `json:"provenance"`
}

type BusinessRule struct {
	RuleID       string    `json:"ruleId"`
	Description  string    `json:"description"`
	Lineage      []Lineage `json:"lineage"`
	AssertionIDs []string  `json:"assertionIds"`
}

type SourceFile struct {
	Path      string `json:"path"`
	SHA256    string `json:"sha256"`
	LineCount int    `json:"lineCount"`
}

type Contract struct {
	ContractVersion string `json:"contractVersion"`
	ModuleID        string `json:"moduleId"`
	SourceSystem    struct {
		Language   string       `json:"language"`
		Dialect    string       `json:"dialect"`
		Repository string       `json:"repository"`
		CommitSHA  string       `json:"commitSha"`
		Files      []SourceFile `json:"files"`
	} `json:"sourceSystem"`
	ExtractedBy struct {
		Agent       string `json:"agent"`
		Model       string `json:"model"`
		ExtractedAt string `json:"extractedAt"`
	} `json:"extractedBy"`
	VerifiedBy *struct {
		Agent      string   `json:"agent"`
		VerifiedAt string   `json:"verifiedAt"`
		Findings   []string `json:"findings"`
	} `json:"verifiedBy"`
	DefaultTolerance Tolerance      `json:"defaultTolerance"`
	BusinessRules    []BusinessRule `json:"businessRules"`
	Assertions       []Assertion    `json:"assertions"`
}

// ---------------------------------------------------------------------------
// Operation registry
// ---------------------------------------------------------------------------

// Invocation is what the harness hands to a modern operation.
type Invocation struct {
	Inputs map[string]any
	State  map[string]any
}

// Result is what a modern operation returns. State must contain every entity passed in,
// with its post-call values — on error paths too, so the harness can prove a rejected call
// had no side effects.
type Result struct {
	Outputs map[string]any
	State   map[string]any
}

// Operation adapts one modern service operation to the contract's vocabulary.
type Operation func(Invocation) (Result, error)

// ContractError is the error shape operations return for legacy error paths.
type ContractError struct {
	Code             string
	LegacyReturnCode string
	Message          string
}

func (e *ContractError) Error() string {
	return fmt.Sprintf("%s (legacy RC %s): %s", e.Code, e.LegacyReturnCode, e.Message)
}

// operations maps contract operation names to adapters. Register the modern service here.
var operations = map[string]Operation{
	"AssessLateFee": assessLateFeeReference,
}

// ---------------------------------------------------------------------------
// Reference adapter for the LNFEE010 example contract
// ---------------------------------------------------------------------------
//
// This is the clean-room Go implementation of COBOL program LNFEE010
// (examples/legacy/LNFEE010). It doubles as a worked example of an adapter: decode the
// contract inputs, call the domain logic, and encode outputs/state using contract names.

var decimalPattern = regexp.MustCompile(`^-?[0-9]{1,9}(\.[0-9]{1,2})?$`)

var statusRank = map[string]int{"CURRENT": 0, "DELINQUENT": 1, "CHARGEOFF": 2, "CLOSED": -1}

func parseCents(raw any) (int64, error) {
	s, ok := raw.(string)
	if !ok {
		return 0, fmt.Errorf("outstandingBalance must be a decimal string, got %T", raw)
	}
	if !decimalPattern.MatchString(s) {
		return 0, fmt.Errorf("outstandingBalance %q does not fit PIC S9(9)V99", s)
	}
	r, ok := new(big.Rat).SetString(s)
	if !ok {
		return 0, fmt.Errorf("outstandingBalance %q is not a decimal", s)
	}
	r.Mul(r, big.NewRat(100, 1))
	if !r.IsInt() {
		return 0, fmt.Errorf("outstandingBalance %q has more than 2 decimal places", s)
	}
	return r.Num().Int64(), nil
}

func formatCents(c int64) string {
	sign := ""
	if c < 0 {
		sign = "-"
		c = -c
	}
	return fmt.Sprintf("%s%d.%02d", sign, c/100, c%100)
}

func assessLateFeeReference(in Invocation) (Result, error) {
	account, ok := in.State["account"].(map[string]any)
	if !ok {
		return Result{}, errors.New("initialState.account is required")
	}
	status, _ := account["status"].(string)
	status = strings.TrimRight(status, " ")
	balance, err := parseCents(in.Inputs["outstandingBalance"])
	if err != nil {
		return Result{}, err
	}
	dpdNumber, ok := in.Inputs["daysPastDue"].(json.Number)
	if !ok {
		return Result{}, fmt.Errorf("daysPastDue must be a number, got %T", in.Inputs["daysPastDue"])
	}
	dpd, err := dpdNumber.Int64()
	if err != nil || dpd < 0 {
		return Result{}, fmt.Errorf("daysPastDue %q must be a non-negative integer", dpdNumber)
	}

	// 1000-VALIDATE — first failing check wins; a rejected call leaves state untouched.
	unchanged := Result{State: in.State}
	rank, known := statusRank[status]
	switch {
	case !known:
		return unchanged, &ContractError{Code: "INVALID_STATUS", LegacyReturnCode: "08", Message: status}
	case status == "CLOSED":
		return unchanged, &ContractError{Code: "ACCOUNT_CLOSED", LegacyReturnCode: "12"}
	case balance < 0:
		return unchanged, &ContractError{Code: "NEGATIVE_BALANCE", LegacyReturnCode: "08"}
	case dpd > 999:
		return unchanged, &ContractError{Code: "INVALID_DAYS_PAST_DUE", LegacyReturnCode: "08"}
	}

	// 2000-CALC-FEE — 5% (500 bps) rounded half-up to cents, capped at 25.00, after day 15.
	var fee int64
	if dpd > 15 {
		fee = (balance*500 + 5000) / 10000
		if fee > 2500 {
			fee = 2500
		}
	}

	// 3000-ADVANCE-STATUS — escalate only.
	newRank := 0
	switch {
	case dpd >= 90:
		newRank = 2
	case dpd >= 30:
		newRank = 1
	}
	newStatus := status
	if newRank > rank {
		newStatus = map[int]string{1: "DELINQUENT", 2: "CHARGEOFF"}[newRank]
	}

	return Result{
		Outputs: map[string]any{
			"lateFee":     formatCents(fee),
			"feeAssessed": fee > 0,
			"newStatus":   newStatus,
		},
		State: map[string]any{"account": map[string]any{"status": newStatus}},
	}, nil
}

// ---------------------------------------------------------------------------
// Contract loading
// ---------------------------------------------------------------------------

func decodeStrict(data []byte, v any) error {
	dec := json.NewDecoder(bytes.NewReader(data))
	dec.UseNumber()
	dec.DisallowUnknownFields()
	return dec.Decode(v)
}

// loadContracts accepts either a contract instance or the JSON Schema template, in which
// case every entry of its "examples" array is treated as a contract.
func loadContracts(path string) ([]Contract, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("read contract: %w", err)
	}
	var probe struct {
		Schema   string            `json:"$schema"`
		Examples []json.RawMessage `json:"examples"`
	}
	if err := json.Unmarshal(data, &probe); err != nil {
		return nil, fmt.Errorf("parse %s: %w", path, err)
	}
	documents := []json.RawMessage{data}
	if probe.Schema != "" {
		if len(probe.Examples) == 0 {
			return nil, fmt.Errorf("%s is a JSON Schema with no examples; point BEHAVIORAL_CONTRACT at a contract instance", path)
		}
		documents = probe.Examples
	}
	contracts := make([]Contract, 0, len(documents))
	for i, doc := range documents {
		var c Contract
		if err := decodeStrict(doc, &c); err != nil {
			return nil, fmt.Errorf("decode contract %d in %s: %w", i, path, err)
		}
		contracts = append(contracts, c)
	}
	return contracts, nil
}

func contractPath() string {
	if p := os.Getenv("BEHAVIORAL_CONTRACT"); p != "" {
		return p
	}
	return "behavioral_contract.json"
}

// ---------------------------------------------------------------------------
// Comparison engine
// ---------------------------------------------------------------------------

var decimalString = regexp.MustCompile(`^[+-]?[0-9]+(\.[0-9]+)?$`)

// toRat converts JSON numbers, Go numerics and decimal strings to an exact rational.
func toRat(v any) (*big.Rat, bool) {
	switch n := v.(type) {
	case json.Number:
		return new(big.Rat).SetString(n.String())
	case string:
		if !decimalString.MatchString(n) {
			return nil, false
		}
		return new(big.Rat).SetString(n)
	case int:
		return new(big.Rat).SetInt64(int64(n)), true
	case int32:
		return new(big.Rat).SetInt64(int64(n)), true
	case int64:
		return new(big.Rat).SetInt64(n), true
	case float64:
		// Formatting with 'f'/-1 yields the shortest decimal that round-trips, which is the
		// value a human wrote in the contract rather than the binary approximation.
		return new(big.Rat).SetString(strconv.FormatFloat(n, 'f', -1, 64))
	case *big.Rat:
		return n, true
	default:
		return nil, false
	}
}

type tolerance struct {
	absolute *big.Rat
	relative *big.Rat
	scale    int
}

func resolveTolerance(t Tolerance) (tolerance, error) {
	abs, ok := new(big.Rat).SetString(string(t.Absolute))
	if !ok || abs.Sign() < 0 {
		return tolerance{}, fmt.Errorf("invalid absolute tolerance %q", t.Absolute)
	}
	rel, ok := new(big.Rat).SetString(string(t.Relative))
	if !ok || rel.Sign() < 0 {
		return tolerance{}, fmt.Errorf("invalid relative tolerance %q", t.Relative)
	}
	if t.Scale < 0 {
		return tolerance{}, fmt.Errorf("invalid scale %d", t.Scale)
	}
	return tolerance{absolute: abs, relative: rel, scale: t.Scale}, nil
}

func fitsScale(r *big.Rat, scale int) bool {
	factor := new(big.Rat).SetInt(new(big.Int).Exp(big.NewInt(10), big.NewInt(int64(scale)), nil))
	return new(big.Rat).Mul(r, factor).IsInt()
}

func numbersMatch(expected, actual *big.Rat, tol tolerance) (bool, string) {
	if !fitsScale(actual, tol.scale) {
		return false, fmt.Sprintf("actual %s carries more than %d decimal places", actual.FloatString(tol.scale+4), tol.scale)
	}
	diff := new(big.Rat).Sub(actual, expected)
	diff.Abs(diff)
	if diff.Cmp(tol.absolute) <= 0 {
		return true, ""
	}
	if tol.relative.Sign() > 0 && expected.Sign() != 0 {
		limit := new(big.Rat).Mul(tol.relative, new(big.Rat).Abs(expected))
		if diff.Cmp(limit) <= 0 {
			return true, ""
		}
	}
	return false, fmt.Sprintf("expected %s, got %s (|diff| %s exceeds tolerance abs=%s rel=%s)",
		expected.FloatString(tol.scale), actual.FloatString(tol.scale), diff.FloatString(tol.scale+2),
		tol.absolute.FloatString(tol.scale+2), tol.relative.FloatString(6))
}

func normalizeString(s, mode string) string {
	if mode == "rtrim" {
		return strings.TrimRight(s, " ")
	}
	return s
}

func isNumeric(v any) bool {
	switch v.(type) {
	case json.Number, int, int32, int64, float64, *big.Rat:
		return true
	}
	return false
}

// compareValues returns one human-readable mismatch per difference found under path.
func compareValues(path string, expected, actual any, tol tolerance, stringMode string) []string {
	if expected == nil {
		if actual != nil {
			return []string{fmt.Sprintf("%s: expected null, got %v", path, actual)}
		}
		return nil
	}

	expectedStr, expIsStr := expected.(string)
	if isNumeric(expected) || (expIsStr && decimalString.MatchString(expectedStr)) {
		er, _ := toRat(expected)
		ar, ok := toRat(actual)
		if !ok {
			return []string{fmt.Sprintf("%s: expected number %v, got %T %v", path, expected, actual, actual)}
		}
		if match, why := numbersMatch(er, ar, tol); !match {
			return []string{fmt.Sprintf("%s: %s", path, why)}
		}
		return nil
	}

	switch e := expected.(type) {
	case string:
		a, ok := actual.(string)
		if !ok {
			return []string{fmt.Sprintf("%s: expected string %q, got %T %v", path, e, actual, actual)}
		}
		if normalizeString(e, stringMode) != normalizeString(a, stringMode) {
			return []string{fmt.Sprintf("%s: expected %q, got %q (comparison=%s)", path, e, a, stringMode)}
		}
	case bool:
		a, ok := actual.(bool)
		if !ok || a != e {
			return []string{fmt.Sprintf("%s: expected %v, got %v", path, e, actual)}
		}
	case map[string]any:
		a, ok := actual.(map[string]any)
		if !ok {
			return []string{fmt.Sprintf("%s: expected object, got %T", path, actual)}
		}
		var mismatches []string
		for _, key := range sortedKeys(e) {
			av, present := a[key]
			if !present {
				mismatches = append(mismatches, fmt.Sprintf("%s.%s: missing", path, key))
				continue
			}
			mismatches = append(mismatches, compareValues(path+"."+key, e[key], av, tol, stringMode)...)
		}
		for _, key := range sortedKeys(a) {
			if _, declared := e[key]; !declared {
				mismatches = append(mismatches, fmt.Sprintf("%s.%s: unexpected key (value %v)", path, key, a[key]))
			}
		}
		return mismatches
	case []any:
		a, ok := actual.([]any)
		if !ok {
			return []string{fmt.Sprintf("%s: expected array, got %T", path, actual)}
		}
		if len(a) != len(e) {
			return []string{fmt.Sprintf("%s: expected %d elements, got %d", path, len(e), len(a))}
		}
		var mismatches []string
		for i := range e {
			mismatches = append(mismatches, compareValues(fmt.Sprintf("%s[%d]", path, i), e[i], a[i], tol, stringMode)...)
		}
		return mismatches
	default:
		return []string{fmt.Sprintf("%s: unsupported expected type %T", path, expected)}
	}
	return nil
}

func sortedKeys(m map[string]any) []string {
	keys := make([]string, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	return keys
}

// deepCopy round-trips through JSON so operations cannot mutate the contract's initial state.
func deepCopy(m map[string]any) map[string]any {
	if m == nil {
		return map[string]any{}
	}
	data, err := json.Marshal(m)
	if err != nil {
		panic(fmt.Sprintf("initialState is not serialisable: %v", err))
	}
	var out map[string]any
	dec := json.NewDecoder(bytes.NewReader(data))
	dec.UseNumber()
	if err := dec.Decode(&out); err != nil {
		panic(fmt.Sprintf("initialState round-trip failed: %v", err))
	}
	return out
}

func stateField(state map[string]any, entity, field string) (any, bool) {
	e, ok := state[entity].(map[string]any)
	if !ok {
		return nil, false
	}
	v, ok := e[field]
	return v, ok
}

// verifyState checks declared transitions and flags any undeclared change.
func verifyState(a Assertion, before, after map[string]any, tol tolerance) []string {
	var mismatches []string
	declared := map[string]bool{}
	for _, tr := range a.Expected.StateTransitions {
		key := tr.Entity + "." + tr.Field
		declared[key] = true
		if b, ok := stateField(before, tr.Entity, tr.Field); !ok {
			mismatches = append(mismatches, fmt.Sprintf("state.%s: transition declared but not present in initialState", key))
		} else {
			mismatches = append(mismatches, compareValues("initialState."+key, tr.Before, b, tol, a.StringComparison)...)
		}
		v, ok := stateField(after, tr.Entity, tr.Field)
		if !ok {
			mismatches = append(mismatches, fmt.Sprintf("state.%s: missing after call", key))
			continue
		}
		mismatches = append(mismatches, compareValues("state."+key, tr.After, v, tol, a.StringComparison)...)
	}
	for _, entity := range sortedKeys(before) {
		fields, ok := before[entity].(map[string]any)
		if !ok {
			continue
		}
		for _, field := range sortedKeys(fields) {
			key := entity + "." + field
			if declared[key] {
				continue
			}
			v, present := stateField(after, entity, field)
			if !present {
				mismatches = append(mismatches, fmt.Sprintf("state.%s: removed by the call", key))
				continue
			}
			if diff := compareValues("state."+key, fields[field], v, tol, a.StringComparison); len(diff) > 0 {
				mismatches = append(mismatches, fmt.Sprintf("state.%s: undeclared change (%s)", key, strings.Join(diff, "; ")))
			}
		}
	}
	return mismatches
}

// evaluate runs one assertion and returns every parity mismatch found.
func evaluate(c Contract, a Assertion) []string {
	op, ok := operations[a.Operation]
	if !ok {
		return []string{fmt.Sprintf("no operation registered for %q", a.Operation)}
	}
	effective := c.DefaultTolerance
	if a.Tolerance != nil {
		effective = *a.Tolerance
	}
	tol, err := resolveTolerance(effective)
	if err != nil {
		return []string{err.Error()}
	}
	stringMode := a.StringComparison
	if stringMode == "" {
		stringMode = "exact"
	}

	before := deepCopy(a.InitialState)
	result, opErr := op(Invocation{Inputs: a.Inputs, State: deepCopy(a.InitialState)})

	if a.Expected.Error != nil {
		var ce *ContractError
		switch {
		case opErr == nil:
			return []string{fmt.Sprintf("expected error %s (RC %s), call succeeded with %v",
				a.Expected.Error.Code, a.Expected.Error.LegacyReturnCode, result.Outputs)}
		case !errors.As(opErr, &ce):
			return []string{fmt.Sprintf("expected contract error %s, got untyped error: %v", a.Expected.Error.Code, opErr)}
		}
		var mismatches []string
		if ce.Code != a.Expected.Error.Code {
			mismatches = append(mismatches, fmt.Sprintf("error code: expected %s, got %s", a.Expected.Error.Code, ce.Code))
		}
		if a.Expected.Error.LegacyReturnCode != "" && ce.LegacyReturnCode != a.Expected.Error.LegacyReturnCode {
			mismatches = append(mismatches, fmt.Sprintf("legacy return code: expected %s, got %s",
				a.Expected.Error.LegacyReturnCode, ce.LegacyReturnCode))
		}
		// Legacy programs often still fill response fields on a rejected call (e.g. fee 0,
		// flag N, status echoed); when the contract asserts them, they are behavior too.
		if len(a.Expected.Outputs) > 0 {
			mismatches = append(mismatches, compareValues("outputs", a.Expected.Outputs, result.Outputs, tol, stringMode)...)
		}
		if result.State == nil {
			mismatches = append(mismatches, "error path returned no state; adapters must return the post-call state so side effects can be checked")
		} else {
			mismatches = append(mismatches, verifyState(Assertion{StringComparison: stringMode}, before, result.State, tol)...)
		}
		return mismatches
	}

	if opErr != nil {
		return []string{fmt.Sprintf("unexpected error: %v", opErr)}
	}
	mismatches := compareValues("outputs", a.Expected.Outputs, result.Outputs, tol, stringMode)
	mismatches = append(mismatches, verifyState(Assertion{
		Expected:         a.Expected,
		StringComparison: stringMode,
	}, before, result.State, tol)...)
	return mismatches
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

type parityRecord struct {
	AssertionID string   `json:"assertionId"`
	RuleID      string   `json:"ruleId"`
	Category    string   `json:"category"`
	Passed      bool     `json:"passed"`
	Mismatches  []string `json:"mismatches,omitempty"`
}

type parityReport struct {
	ModuleID        string         `json:"moduleId"`
	ContractVersion string         `json:"contractVersion"`
	GeneratedAt     string         `json:"generatedAt"`
	Total           int            `json:"total"`
	Passed          int            `json:"passed"`
	PassRate        float64        `json:"passRate"`
	Results         []parityRecord `json:"results"`
}

func mustLoad(t *testing.T) []Contract {
	t.Helper()
	contracts, err := loadContracts(contractPath())
	if err != nil {
		t.Fatalf("load behavioral contract: %v", err)
	}
	return contracts
}

// TestContractIntegrity rejects contracts that cannot be trusted as a parity oracle.
func TestContractIntegrity(t *testing.T) {
	for _, c := range mustLoad(t) {
		c := c
		t.Run(c.ModuleID, func(t *testing.T) {
			if os.Getenv("REQUIRE_VERIFIED_CONTRACT") == "1" && c.VerifiedBy == nil {
				t.Fatalf("contract %s %s is not verified by the spec publisher", c.ModuleID, c.ContractVersion)
			}
			if _, err := resolveTolerance(c.DefaultTolerance); err != nil {
				t.Errorf("defaultTolerance: %v", err)
			}
			files := map[string]SourceFile{}
			for _, f := range c.SourceSystem.Files {
				files[f.Path] = f
			}
			checkLineage := func(owner string, lineage []Lineage) {
				if len(lineage) == 0 {
					t.Errorf("%s: missing legacy lineage", owner)
				}
				for _, l := range lineage {
					f, ok := files[l.File]
					switch {
					case !ok:
						t.Errorf("%s: lineage file %s not in sourceSystem.files", owner, l.File)
					case l.StartLine < 1 || l.StartLine > l.EndLine || l.EndLine > f.LineCount:
						t.Errorf("%s: lineage %s:%d-%d outside 1-%d", owner, l.File, l.StartLine, l.EndLine, f.LineCount)
					}
				}
			}

			rules := map[string]BusinessRule{}
			for _, r := range c.BusinessRules {
				if _, dup := rules[r.RuleID]; dup {
					t.Errorf("duplicate rule %s", r.RuleID)
				}
				rules[r.RuleID] = r
				checkLineage(r.RuleID, r.Lineage)
			}
			seen := map[string]Assertion{}
			for _, a := range c.Assertions {
				if _, dup := seen[a.AssertionID]; dup {
					t.Errorf("duplicate assertion %s", a.AssertionID)
				}
				seen[a.AssertionID] = a
				if _, ok := rules[a.RuleID]; !ok {
					t.Errorf("%s references unknown rule %s", a.AssertionID, a.RuleID)
				}
				if _, ok := operations[a.Operation]; !ok && os.Getenv("SPEC_ONLY") != "1" {
					t.Errorf("%s uses unregistered operation %q", a.AssertionID, a.Operation)
				}
				if a.Category == "error" && a.Expected.Error == nil {
					t.Errorf("%s is category=error without expected.error", a.AssertionID)
				}
				if a.Expected.Error != nil && len(a.Expected.StateTransitions) > 0 {
					t.Errorf("%s expects an error and state transitions; a rejected call must not change state", a.AssertionID)
				}
				if a.Category == "boundary" && a.Boundary == nil {
					t.Errorf("%s is category=boundary without a boundary descriptor", a.AssertionID)
				}
				if a.Tolerance != nil {
					if _, err := resolveTolerance(*a.Tolerance); err != nil {
						t.Errorf("%s tolerance: %v", a.AssertionID, err)
					}
				}
				checkLineage(a.AssertionID, a.Lineage)
			}
			for _, r := range c.BusinessRules {
				if len(r.AssertionIDs) == 0 {
					t.Errorf("rule %s has no assertions", r.RuleID)
				}
				for _, id := range r.AssertionIDs {
					a, ok := seen[id]
					if !ok {
						t.Errorf("rule %s lists unknown assertion %s", r.RuleID, id)
					} else if a.RuleID != r.RuleID {
						t.Errorf("rule %s lists %s which belongs to %s", r.RuleID, id, a.RuleID)
					}
				}
			}
		})
	}
}

// TestBehavioralParity replays every assertion and enforces the Zero-Regression Invariant.
func TestBehavioralParity(t *testing.T) {
	for _, c := range mustLoad(t) {
		c := c
		report := parityReport{
			ModuleID:        c.ModuleID,
			ContractVersion: c.ContractVersion,
			GeneratedAt:     time.Now().UTC().Format(time.RFC3339),
			Total:           len(c.Assertions),
		}
		t.Run(c.ModuleID, func(t *testing.T) {
			for _, a := range c.Assertions {
				a := a
				name := fmt.Sprintf("%s_%s_%s", a.AssertionID, a.RuleID, a.Category)
				passed := t.Run(name, func(t *testing.T) {
					mismatches := evaluate(c, a)
					record := parityRecord{AssertionID: a.AssertionID, RuleID: a.RuleID, Category: a.Category,
						Passed: len(mismatches) == 0, Mismatches: mismatches}
					report.Results = append(report.Results, record)
					for _, m := range mismatches {
						t.Errorf("%s — %s\n    lineage: %+v", a.Description, m, a.Lineage)
					}
				})
				if passed {
					report.Passed++
				}
			}
		})
		if report.Total > 0 {
			report.PassRate = float64(report.Passed) / float64(report.Total)
		}
		t.Logf("parity %s v%s: %d/%d assertions (%.2f%%)", c.ModuleID, c.ContractVersion,
			report.Passed, report.Total, report.PassRate*100)
		if out := os.Getenv("PARITY_REPORT_PATH"); out != "" {
			data, err := json.MarshalIndent(report, "", "  ")
			if err != nil {
				t.Fatalf("encode parity report: %v", err)
			}
			if err := os.WriteFile(out, append(data, '\n'), 0o644); err != nil {
				t.Fatalf("write parity report: %v", err)
			}
		}
		if report.Passed != report.Total {
			t.Fatalf("Zero-Regression Invariant violated for %s: %d of %d assertions failed",
				c.ModuleID, report.Total-report.Passed, report.Total)
		}
	}
}

// TestComparisonEngine pins the comparison semantics the parity verdict depends on.
func TestComparisonEngine(t *testing.T) {
	exact := tolerance{absolute: new(big.Rat), relative: new(big.Rat), scale: 2}
	cent := tolerance{absolute: big.NewRat(1, 100), relative: new(big.Rat), scale: 2}
	relative := tolerance{absolute: new(big.Rat), relative: big.NewRat(1, 1000), scale: 4}

	cases := []struct {
		name       string
		expected   any
		actual     any
		tol        tolerance
		stringMode string
		wantMatch  bool
	}{
		{"decimal strings equal", "5.01", "5.01", exact, "exact", true},
		{"trailing zero is the same value", "5.10", "5.1", exact, "exact", true},
		{"off by one cent fails exact", "5.01", "5.00", exact, "exact", false},
		{"off by one cent passes cent tolerance", "5.01", "5.00", cent, "exact", true},
		{"two cents fails cent tolerance", "5.01", "4.99", cent, "exact", false},
		{"extra precision is rejected", "5.01", "5.005", cent, "exact", false},
		{"json number vs decimal string", json.Number("25"), "25.00", exact, "exact", true},
		{"int vs json number", json.Number("15"), 15, exact, "exact", true},
		{"float64 binary noise does not leak", json.Number("0.3"), 0.3, exact, "exact", true},
		{"relative tolerance within 0.1%", "1000.0000", "1000.9000", relative, "exact", true},
		{"relative tolerance exceeded", "1000.0000", "1001.5000", relative, "exact", false},
		{"rtrim ignores PIC X padding", "CURRENT   ", "CURRENT", exact, "rtrim", true},
		{"exact keeps padding significant", "CURRENT   ", "CURRENT", exact, "exact", false},
		{"bool mismatch", true, false, exact, "exact", false},
		{"null expected", nil, nil, exact, "exact", true},
		{"null expected, value returned", nil, "x", exact, "exact", false},
		{"missing key", map[string]any{"a": "1"}, map[string]any{}, exact, "exact", false},
		{"unexpected key", map[string]any{"a": "1"}, map[string]any{"a": "1", "b": true}, exact, "exact", false},
		{"array length", []any{"1", "2"}, []any{"1"}, exact, "exact", false},
		{"nested equal", map[string]any{"x": []any{json.Number("1.50")}}, map[string]any{"x": []any{"1.5"}}, exact, "exact", true},
		{"type mismatch string vs number", "ABC", json.Number("1"), exact, "exact", false},
	}
	for _, tc := range cases {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			got := compareValues("v", tc.expected, tc.actual, tc.tol, tc.stringMode)
			if (len(got) == 0) != tc.wantMatch {
				t.Fatalf("compareValues(%v, %v) mismatches=%v, wantMatch=%v", tc.expected, tc.actual, got, tc.wantMatch)
			}
		})
	}
}

// TestUndeclaredStateChangeFails proves the harness catches side effects the contract did not declare.
func TestUndeclaredStateChangeFails(t *testing.T) {
	a := Assertion{StringComparison: "exact", Expected: Expected{}}
	before := map[string]any{"account": map[string]any{"status": "CURRENT", "balance": "10.00"}}
	after := map[string]any{"account": map[string]any{"status": "CURRENT", "balance": "10.01"}}
	tol := tolerance{absolute: new(big.Rat), relative: new(big.Rat), scale: 2}
	if got := verifyState(a, before, after, tol); len(got) != 1 || !strings.Contains(got[0], "undeclared change") {
		t.Fatalf("expected one undeclared-change mismatch, got %v", got)
	}
}

// TestErrorPathSideEffectsFail proves the harness rejects an operation that reports the
// expected error but still mutates state, and one that hides its post-call state.
func TestErrorPathSideEffectsFail(t *testing.T) {
	c := Contract{DefaultTolerance: Tolerance{Absolute: "0", Relative: "0", RoundingMode: "HALF_UP", Scale: 2}}
	a := Assertion{
		AssertionID:  "A-900",
		Operation:    "LeakyReject",
		InitialState: map[string]any{"account": map[string]any{"status": "CURRENT"}},
		Expected:     Expected{Error: &ExpectedError{Code: "NEGATIVE_BALANCE", LegacyReturnCode: "08"}},
	}
	rejectErr := &ContractError{Code: "NEGATIVE_BALANCE", LegacyReturnCode: "08"}
	cases := map[string]Operation{
		"mutates state": func(Invocation) (Result, error) {
			return Result{State: map[string]any{"account": map[string]any{"status": "DELINQUENT"}}}, rejectErr
		},
		"hides state": func(Invocation) (Result, error) { return Result{}, rejectErr },
	}
	for name, op := range cases {
		operations["LeakyReject"] = op
		if got := evaluate(c, a); len(got) == 0 {
			t.Errorf("%s: expected a parity failure, got none", name)
		}
	}
	operations["LeakyReject"] = func(in Invocation) (Result, error) { return Result{State: in.State}, rejectErr }
	if got := evaluate(c, a); len(got) != 0 {
		t.Errorf("clean rejection should pass, got %v", got)
	}
	delete(operations, "LeakyReject")
}

// TestErrorPathOutputsAreCompared proves that response fields a contract asserts on an
// error path are checked, not silently ignored.
func TestErrorPathOutputsAreCompared(t *testing.T) {
	c := Contract{DefaultTolerance: Tolerance{Absolute: "0", Relative: "0", RoundingMode: "HALF_UP", Scale: 2}}
	a := Assertion{
		AssertionID:      "A-901",
		Operation:        "RejectWithResponse",
		StringComparison: "rtrim",
		InitialState:     map[string]any{},
		Expected: Expected{
			Outputs: map[string]any{"lateFee": "0.00", "feeAssessed": "N", "newStatus": "CLOSED    "},
			Error:   &ExpectedError{Code: "ACCOUNT_CLOSED", LegacyReturnCode: "12"},
		},
	}
	reject := &ContractError{Code: "ACCOUNT_CLOSED", LegacyReturnCode: "12"}
	operations["RejectWithResponse"] = func(in Invocation) (Result, error) {
		return Result{State: in.State, Outputs: map[string]any{"lateFee": "0.00", "feeAssessed": "N", "newStatus": "CLOSED"}}, reject
	}
	if got := evaluate(c, a); len(got) != 0 {
		t.Errorf("matching error response should pass, got %v", got)
	}
	operations["RejectWithResponse"] = func(in Invocation) (Result, error) {
		return Result{State: in.State, Outputs: map[string]any{"lateFee": "5.00", "feeAssessed": "Y", "newStatus": "CLOSED"}}, reject
	}
	if got := evaluate(c, a); len(got) != 2 {
		t.Errorf("expected 2 output mismatches on the error path, got %v", got)
	}
	delete(operations, "RejectWithResponse")
}
