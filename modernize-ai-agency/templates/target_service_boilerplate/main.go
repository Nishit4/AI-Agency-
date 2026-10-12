// Command late-fee-service is the LegacyModern AI target-service template: a Clean
// Architecture Go 1.22 microservice generated from a verified behavioral contract.
//
// The reference domain is COBOL program LNFEE010 (late-fee assessment and delinquency
// escalation). Every rule below carries a lineage comment pointing at the legacy source
// line it reproduces, as required by CLAUDE.md.
//
// Layers (dependencies point inward only):
//
//	domain       Money, AccountStatus, Account, LateFeePolicy and their invariants
//	application  LateFeeService use cases and the AccountRepository port
//	adapters     InMemoryAccountRepository (swap for Postgres/DB2 adapters in production)
//	transport    net/http router, JSON codec, middleware, health probes
//	bootstrap    configuration, structured logging, graceful shutdown
//
// Rename the module with `go mod edit -module <path>` when instantiating the template.
package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net"
	"net/http"
	"os"
	"os/signal"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"sync/atomic"
	"syscall"
	"time"
)

// ===========================================================================
// Domain
// ===========================================================================

// Money is a signed amount in cents. It models COBOL PIC S9(9)V99 COMP-3:
// nine integer digits, two implied decimals. Floating point never touches money.
type Money int64

const (
	// MaxMoney is 999,999,999.99 — the largest value PIC S9(9)V99 can hold.
	MaxMoney Money = 99_999_999_999
	// MinMoney is the negative bound of the same picture clause.
	MinMoney Money = -99_999_999_999
)

var moneyPattern = regexp.MustCompile(`^(-)?([0-9]{1,9})(?:\.([0-9]{1,2}))?$`)

// ParseMoney parses a decimal string such as "1234.56" without floating point.
func ParseMoney(s string) (Money, error) {
	m := moneyPattern.FindStringSubmatch(strings.TrimSpace(s))
	if m == nil {
		return 0, &DomainError{Code: CodeInvalidAmount, LegacyReturnCode: "08",
			Message: fmt.Sprintf("amount %q must be a decimal with at most 9 integer digits and 2 decimals", s)}
	}
	units, _ := strconv.ParseInt(m[2], 10, 64)
	frac := m[3]
	if len(frac) == 1 {
		frac += "0"
	}
	var cents int64
	if frac != "" {
		cents, _ = strconv.ParseInt(frac, 10, 64)
	}
	v := units*100 + cents
	if m[1] == "-" {
		v = -v
	}
	return Money(v), nil
}

// String renders the amount with exactly two decimals.
func (m Money) String() string {
	sign := ""
	v := int64(m)
	if v < 0 {
		sign = "-"
		v = -v
	}
	return fmt.Sprintf("%s%d.%02d", sign, v/100, v%100)
}

// MarshalJSON encodes money as a decimal string to preserve exactness across clients.
func (m Money) MarshalJSON() ([]byte, error) { return json.Marshal(m.String()) }

// UnmarshalJSON accepts only decimal strings; JSON numbers would invite float rounding.
func (m *Money) UnmarshalJSON(data []byte) error {
	var s string
	if err := json.Unmarshal(data, &s); err != nil {
		return &DomainError{Code: CodeInvalidAmount, LegacyReturnCode: "08", Message: "amounts must be JSON strings, e.g. \"100.10\""}
	}
	parsed, err := ParseMoney(s)
	if err != nil {
		return err
	}
	*m = parsed
	return nil
}

// AccountStatus mirrors the 88-level values of LN-ACCT-STATUS (copybooks/LNFEEREC.cpy:10-18).
type AccountStatus string

const (
	StatusCurrent    AccountStatus = "CURRENT"
	StatusDelinquent AccountStatus = "DELINQUENT"
	StatusChargeOff  AccountStatus = "CHARGEOFF"
	StatusClosed     AccountStatus = "CLOSED"
)

// rank orders statuses for escalation (LNFEE010.cbl:90-97). Closed is outside the ladder.
func (s AccountStatus) rank() (int, bool) {
	switch s {
	case StatusCurrent:
		return 0, true
	case StatusDelinquent:
		return 1, true
	case StatusChargeOff:
		return 2, true
	case StatusClosed:
		return -1, true
	default:
		return 0, false
	}
}

// Valid reports whether the status is one of the LN-STATUS-VALID values.
func (s AccountStatus) Valid() bool {
	_, ok := s.rank()
	return ok
}

// Error codes. Legacy return codes come from LNFEE010.cbl:45-59.
const (
	CodeInvalidStatus      = "INVALID_STATUS"
	CodeAccountClosed      = "ACCOUNT_CLOSED"
	CodeNegativeBalance    = "NEGATIVE_BALANCE"
	CodeInvalidDaysPastDue = "INVALID_DAYS_PAST_DUE"
	CodeInvalidAmount      = "INVALID_AMOUNT"
	CodeBalanceOverflow    = "BALANCE_OVERFLOW"
	CodeAccountNotFound    = "ACCOUNT_NOT_FOUND"
	CodeVersionConflict    = "VERSION_CONFLICT"
	CodeInvalidRequest     = "INVALID_REQUEST"
)

// DomainError is a business-rule violation that maps to a legacy return code.
type DomainError struct {
	Code             string `json:"code"`
	LegacyReturnCode string `json:"legacyReturnCode,omitempty"`
	Message          string `json:"message"`
}

func (e *DomainError) Error() string { return e.Code + ": " + e.Message }

// ErrNotFound and ErrConflict are repository outcomes the application layer translates.
var (
	ErrNotFound = errors.New("account not found")
	ErrConflict = errors.New("account version conflict")
)

// Account is the aggregate persisted by the repository.
type Account struct {
	ID          string        `json:"accountId"`
	Balance     Money         `json:"outstandingBalance"`
	DaysPastDue int           `json:"daysPastDue"`
	Status      AccountStatus `json:"status"`
	Version     int64         `json:"version"`
	UpdatedAt   time.Time     `json:"updatedAt"`
}

var accountIDPattern = regexp.MustCompile(`^[A-Z0-9]{1,12}$`)

// ValidateAccountID enforces LN-ACCOUNT-ID PIC X(12) with the upper-case alphanumeric
// convention used by the account master file.
func ValidateAccountID(id string) error {
	if !accountIDPattern.MatchString(id) {
		return &DomainError{Code: CodeInvalidRequest, Message: "accountId must be 1-12 upper-case alphanumeric characters"}
	}
	return nil
}

// LateFeePolicy holds the WS-CONSTANTS of LNFEE010 (LNFEE010.cbl:14-21).
type LateFeePolicy struct {
	GraceDays       int   // WS-GRACE-DAYS      VALUE 15
	MaxDaysPastDue  int   // WS-MAX-DAYS        VALUE 999
	RateBasisPoints int64 // WS-FEE-RATE        VALUE .050 (500 bps)
	Cap             Money // WS-FEE-CAP         VALUE 25.00
	DelinquentDays  int   // WS-DELINQ-DAYS     VALUE 30
	ChargeOffDays   int   // WS-CHARGEOFF-DAYS  VALUE 90
}

// DefaultLateFeePolicy returns the production constants.
func DefaultLateFeePolicy() LateFeePolicy {
	return LateFeePolicy{GraceDays: 15, MaxDaysPastDue: 999, RateBasisPoints: 500, Cap: 2500, DelinquentDays: 30, ChargeOffDays: 90}
}

// Assessment is the outcome of applying the policy to one account snapshot.
type Assessment struct {
	LateFee        Money         `json:"lateFee"`
	FeeAssessed    bool          `json:"feeAssessed"`
	PreviousStatus AccountStatus `json:"previousStatus"`
	NewStatus      AccountStatus `json:"newStatus"`
}

// Assess reproduces LNFEE010 exactly. Contract: templates/behavioral_contract.json BR-001..BR-004.
func (p LateFeePolicy) Assess(balance Money, daysPastDue int, status AccountStatus) (Assessment, error) {
	// BR-004 — 1000-VALIDATE, first failure wins (LNFEE010.cbl:45-59).
	currentRank, valid := status.rank()
	switch {
	case !valid:
		return Assessment{}, &DomainError{Code: CodeInvalidStatus, LegacyReturnCode: "08", Message: fmt.Sprintf("status %q is not a valid account status", status)}
	case status == StatusClosed:
		return Assessment{}, &DomainError{Code: CodeAccountClosed, LegacyReturnCode: "12", Message: "late fees cannot be assessed on a closed account"}
	case balance < 0:
		return Assessment{}, &DomainError{Code: CodeNegativeBalance, LegacyReturnCode: "08", Message: "outstanding balance cannot be negative"}
	case daysPastDue < 0 || daysPastDue > p.MaxDaysPastDue:
		return Assessment{}, &DomainError{Code: CodeInvalidDaysPastDue, LegacyReturnCode: "08", Message: fmt.Sprintf("daysPastDue must be between 0 and %d", p.MaxDaysPastDue)}
	}

	// BR-001 — 2000-CALC-FEE (LNFEE010.cbl:64-72): COMPUTE ROUNDED is half-up for the
	// non-negative balances that survive validation. balance*bps/10000, rounded at cents.
	var fee Money
	if daysPastDue > p.GraceDays {
		fee = Money((int64(balance)*p.RateBasisPoints + 5_000) / 10_000)
		if fee > p.Cap {
			fee = p.Cap
		}
	}

	// BR-003 — 3000-ADVANCE-STATUS (LNFEE010.cbl:81-105): escalate only, never downgrade.
	targetRank := 0
	switch {
	case daysPastDue >= p.ChargeOffDays:
		targetRank = 2
	case daysPastDue >= p.DelinquentDays:
		targetRank = 1
	}
	newStatus := status
	if targetRank > currentRank {
		newStatus = map[int]AccountStatus{1: StatusDelinquent, 2: StatusChargeOff}[targetRank]
	}

	// BR-002 — fee-assessed indicator only when the rounded fee is positive (LNFEE010.cbl:73-75).
	return Assessment{LateFee: fee, FeeAssessed: fee > 0, PreviousStatus: status, NewStatus: newStatus}, nil
}

// ===========================================================================
// Application
// ===========================================================================

// AccountRepository is the persistence port. Save must enforce optimistic concurrency:
// it succeeds only when the stored version equals expectedVersion.
type AccountRepository interface {
	Get(ctx context.Context, id string) (Account, error)
	Save(ctx context.Context, account Account, expectedVersion int64) (Account, error)
	Ping(ctx context.Context) error
}

// Clock is injected so use cases are deterministic under test.
type Clock func() time.Time

// LateFeeService implements the use cases exposed by the transport layer.
type LateFeeService struct {
	repo   AccountRepository
	policy LateFeePolicy
	now    Clock
	log    *slog.Logger
}

// NewLateFeeService wires the use cases.
func NewLateFeeService(repo AccountRepository, policy LateFeePolicy, now Clock, log *slog.Logger) *LateFeeService {
	return &LateFeeService{repo: repo, policy: policy, now: now, log: log}
}

// Quote applies the policy to a caller-supplied snapshot without touching persistence.
func (s *LateFeeService) Quote(balance Money, daysPastDue int, status AccountStatus) (Assessment, error) {
	return s.policy.Assess(balance, daysPastDue, status)
}

// AssessCommand asks the service to run the nightly assessment for one account.
type AssessCommand struct {
	AccountID   string
	DaysPastDue int
}

// AssessResult is the persisted outcome of an assessment.
type AssessResult struct {
	Assessment
	Account Account `json:"account"`
}

// AssessAccount loads the account, applies the policy, posts the fee to the balance and
// persists the new status. The fee posting mirrors LNBATCH, which adds LN-LATE-FEE to the
// master balance after LNFEE010 returns RC 00.
func (s *LateFeeService) AssessAccount(ctx context.Context, cmd AssessCommand) (AssessResult, error) {
	if err := ValidateAccountID(cmd.AccountID); err != nil {
		return AssessResult{}, err
	}
	account, err := s.repo.Get(ctx, cmd.AccountID)
	if err != nil {
		return AssessResult{}, err
	}
	assessment, err := s.policy.Assess(account.Balance, cmd.DaysPastDue, account.Status)
	if err != nil {
		return AssessResult{}, err
	}
	newBalance := account.Balance + assessment.LateFee
	if newBalance > MaxMoney {
		return AssessResult{}, &DomainError{Code: CodeBalanceOverflow, LegacyReturnCode: "08", Message: "posting the fee would overflow PIC S9(9)V99"}
	}
	updated := account
	updated.Balance = newBalance
	updated.DaysPastDue = cmd.DaysPastDue
	updated.Status = assessment.NewStatus
	updated.UpdatedAt = s.now().UTC()
	saved, err := s.repo.Save(ctx, updated, account.Version)
	if err != nil {
		return AssessResult{}, err
	}
	s.log.InfoContext(ctx, "late fee assessed",
		slog.String("account_id", saved.ID),
		slog.String("late_fee", assessment.LateFee.String()),
		slog.String("previous_status", string(assessment.PreviousStatus)),
		slog.String("new_status", string(assessment.NewStatus)),
		slog.Int64("version", saved.Version))
	return AssessResult{Assessment: assessment, Account: saved}, nil
}

// UpsertAccountCommand loads or corrects an account (used by the migration loader).
type UpsertAccountCommand struct {
	AccountID       string
	Balance         Money
	DaysPastDue     int
	Status          AccountStatus
	ExpectedVersion int64
}

// UpsertAccount validates the record against the copybook invariants and persists it.
func (s *LateFeeService) UpsertAccount(ctx context.Context, cmd UpsertAccountCommand) (Account, error) {
	if err := ValidateAccountID(cmd.AccountID); err != nil {
		return Account{}, err
	}
	if !cmd.Status.Valid() {
		return Account{}, &DomainError{Code: CodeInvalidStatus, LegacyReturnCode: "08", Message: fmt.Sprintf("status %q is not a valid account status", cmd.Status)}
	}
	if cmd.Balance < MinMoney || cmd.Balance > MaxMoney {
		return Account{}, &DomainError{Code: CodeBalanceOverflow, LegacyReturnCode: "08", Message: "balance exceeds PIC S9(9)V99"}
	}
	if cmd.DaysPastDue < 0 || cmd.DaysPastDue > 9_999 {
		return Account{}, &DomainError{Code: CodeInvalidDaysPastDue, LegacyReturnCode: "08", Message: "daysPastDue must fit PIC 9(4)"}
	}
	return s.repo.Save(ctx, Account{
		ID: cmd.AccountID, Balance: cmd.Balance, DaysPastDue: cmd.DaysPastDue,
		Status: cmd.Status, UpdatedAt: s.now().UTC(),
	}, cmd.ExpectedVersion)
}

// GetAccount returns the current account snapshot.
func (s *LateFeeService) GetAccount(ctx context.Context, id string) (Account, error) {
	if err := ValidateAccountID(id); err != nil {
		return Account{}, err
	}
	return s.repo.Get(ctx, id)
}

// ===========================================================================
// Adapters
// ===========================================================================

// InMemoryAccountRepository is a concurrency-safe repository for local runs and tests.
type InMemoryAccountRepository struct {
	mu       sync.RWMutex
	accounts map[string]Account
}

// NewInMemoryAccountRepository returns an empty repository.
func NewInMemoryAccountRepository() *InMemoryAccountRepository {
	return &InMemoryAccountRepository{accounts: map[string]Account{}}
}

// Get returns a copy of the stored account.
func (r *InMemoryAccountRepository) Get(_ context.Context, id string) (Account, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	a, ok := r.accounts[id]
	if !ok {
		return Account{}, ErrNotFound
	}
	return a, nil
}

// Save stores the account when expectedVersion matches (0 means "must not exist yet").
func (r *InMemoryAccountRepository) Save(_ context.Context, account Account, expectedVersion int64) (Account, error) {
	r.mu.Lock()
	defer r.mu.Unlock()
	current, exists := r.accounts[account.ID]
	switch {
	case !exists && expectedVersion != 0:
		return Account{}, ErrNotFound
	case exists && current.Version != expectedVersion:
		return Account{}, ErrConflict
	}
	account.Version = expectedVersion + 1
	r.accounts[account.ID] = account
	return account, nil
}

// Ping always succeeds for the in-memory adapter.
func (r *InMemoryAccountRepository) Ping(context.Context) error { return nil }

// ===========================================================================
// Transport
// ===========================================================================

const maxRequestBytes = 1 << 20

type ctxKey int

const requestIDKey ctxKey = iota

func requestIDFrom(ctx context.Context) string {
	id, _ := ctx.Value(requestIDKey).(string)
	return id
}

var requestIDPattern = regexp.MustCompile(`^[A-Za-z0-9._-]{1,128}$`)
var requestCounter atomic.Uint64

func newRequestID() string {
	return fmt.Sprintf("%x-%06x", time.Now().UnixNano(), requestCounter.Add(1)&0xffffff)
}

// Health tracks liveness and readiness for the /healthz and /ready probes.
type Health struct {
	ready    atomic.Bool
	draining atomic.Bool
}

// API binds HTTP routes to the application service.
type API struct {
	svc    *LateFeeService
	repo   AccountRepository
	health *Health
	log    *slog.Logger
	info   ServiceInfo
}

// ServiceInfo is reported by the probes.
type ServiceInfo struct {
	Name    string `json:"service"`
	Version string `json:"version"`
}

// Routes builds the router using Go 1.22 method-and-wildcard patterns.
func (a *API) Routes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", a.handleHealthz)
	mux.HandleFunc("GET /ready", a.handleReady)
	mux.HandleFunc("POST /v1/late-fees/quote", a.handleQuote)
	mux.HandleFunc("PUT /v1/accounts/{accountId}", a.handleUpsertAccount)
	mux.HandleFunc("GET /v1/accounts/{accountId}", a.handleGetAccount)
	mux.HandleFunc("POST /v1/accounts/{accountId}/late-fees", a.handleAssess)
	return a.withRequestID(a.withRecovery(a.withAccessLog(mux)))
}

func (a *API) withRequestID(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		id := r.Header.Get("X-Request-ID")
		if !requestIDPattern.MatchString(id) {
			id = newRequestID()
		}
		w.Header().Set("X-Request-ID", id)
		next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), requestIDKey, id)))
	})
}

func (a *API) withRecovery(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if rec := recover(); rec != nil {
				a.log.ErrorContext(r.Context(), "panic recovered",
					slog.String("request_id", requestIDFrom(r.Context())), slog.Any("panic", rec))
				writeJSON(w, http.StatusInternalServerError, errorBody{Error: DomainError{Code: "INTERNAL", Message: "internal error"}})
			}
		}()
		next.ServeHTTP(w, r)
	})
}

type statusRecorder struct {
	http.ResponseWriter
	status int
	bytes  int
}

func (s *statusRecorder) WriteHeader(code int) {
	s.status = code
	s.ResponseWriter.WriteHeader(code)
}

func (s *statusRecorder) Write(b []byte) (int, error) {
	if s.status == 0 {
		s.status = http.StatusOK
	}
	n, err := s.ResponseWriter.Write(b)
	s.bytes += n
	return n, err
}

func (a *API) withAccessLog(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		rec := &statusRecorder{ResponseWriter: w}
		next.ServeHTTP(rec, r)
		if r.URL.Path == "/healthz" || r.URL.Path == "/ready" {
			return
		}
		a.log.InfoContext(r.Context(), "http request",
			slog.String("request_id", requestIDFrom(r.Context())),
			slog.String("method", r.Method),
			slog.String("path", r.URL.Path),
			slog.Int("status", rec.status),
			slog.Int("bytes", rec.bytes),
			slog.Duration("duration", time.Since(start)))
	})
}

type errorBody struct {
	Error     DomainError `json:"error"`
	RequestID string      `json:"requestId,omitempty"`
}

func writeJSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(body)
}

func (a *API) writeError(w http.ResponseWriter, r *http.Request, err error) {
	var de *DomainError
	status := http.StatusInternalServerError
	body := DomainError{Code: "INTERNAL", Message: "internal error"}
	switch {
	case errors.As(err, &de):
		body = *de
		switch de.Code {
		case CodeInvalidRequest, CodeInvalidAmount:
			status = http.StatusBadRequest
		default:
			status = http.StatusUnprocessableEntity
		}
	case errors.Is(err, ErrNotFound):
		status = http.StatusNotFound
		body = DomainError{Code: CodeAccountNotFound, Message: "account not found"}
	case errors.Is(err, ErrConflict):
		status = http.StatusConflict
		body = DomainError{Code: CodeVersionConflict, Message: "account was modified concurrently; reload and retry"}
	default:
		a.log.ErrorContext(r.Context(), "request failed",
			slog.String("request_id", requestIDFrom(r.Context())), slog.String("error", err.Error()))
	}
	writeJSON(w, status, errorBody{Error: body, RequestID: requestIDFrom(r.Context())})
}

func decodeJSON(r *http.Request, w http.ResponseWriter, dst any) error {
	if ct := r.Header.Get("Content-Type"); ct != "" && !strings.HasPrefix(ct, "application/json") {
		return &DomainError{Code: CodeInvalidRequest, Message: "Content-Type must be application/json"}
	}
	dec := json.NewDecoder(http.MaxBytesReader(w, r.Body, maxRequestBytes))
	dec.DisallowUnknownFields()
	if err := dec.Decode(dst); err != nil {
		var de *DomainError
		if errors.As(err, &de) {
			return de
		}
		return &DomainError{Code: CodeInvalidRequest, Message: "malformed JSON body: " + err.Error()}
	}
	if err := dec.Decode(&struct{}{}); !errors.Is(err, io.EOF) {
		return &DomainError{Code: CodeInvalidRequest, Message: "request body must contain a single JSON object"}
	}
	return nil
}

func (a *API) handleHealthz(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{"status": "ok", "service": a.info.Name, "version": a.info.Version})
}

func (a *API) handleReady(w http.ResponseWriter, r *http.Request) {
	if !a.health.ready.Load() || a.health.draining.Load() {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"status": "not_ready", "draining": a.health.draining.Load()})
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()
	if err := a.repo.Ping(ctx); err != nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"status": "dependency_unavailable", "error": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"status": "ready"})
}

type quoteRequest struct {
	OutstandingBalance *Money         `json:"outstandingBalance"`
	DaysPastDue        *int           `json:"daysPastDue"`
	AccountStatus      *AccountStatus `json:"accountStatus"`
}

func (a *API) handleQuote(w http.ResponseWriter, r *http.Request) {
	var req quoteRequest
	if err := decodeJSON(r, w, &req); err != nil {
		a.writeError(w, r, err)
		return
	}
	if req.OutstandingBalance == nil || req.DaysPastDue == nil || req.AccountStatus == nil {
		a.writeError(w, r, &DomainError{Code: CodeInvalidRequest, Message: "outstandingBalance, daysPastDue and accountStatus are required"})
		return
	}
	assessment, err := a.svc.Quote(*req.OutstandingBalance, *req.DaysPastDue, *req.AccountStatus)
	if err != nil {
		a.writeError(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, assessment)
}

type upsertAccountRequest struct {
	OutstandingBalance *Money         `json:"outstandingBalance"`
	DaysPastDue        *int           `json:"daysPastDue"`
	Status             *AccountStatus `json:"status"`
	ExpectedVersion    int64          `json:"expectedVersion"`
}

func (a *API) handleUpsertAccount(w http.ResponseWriter, r *http.Request) {
	var req upsertAccountRequest
	if err := decodeJSON(r, w, &req); err != nil {
		a.writeError(w, r, err)
		return
	}
	if req.OutstandingBalance == nil || req.DaysPastDue == nil || req.Status == nil {
		a.writeError(w, r, &DomainError{Code: CodeInvalidRequest, Message: "outstandingBalance, daysPastDue and status are required"})
		return
	}
	account, err := a.svc.UpsertAccount(r.Context(), UpsertAccountCommand{
		AccountID: r.PathValue("accountId"), Balance: *req.OutstandingBalance, DaysPastDue: *req.DaysPastDue,
		Status: *req.Status, ExpectedVersion: req.ExpectedVersion,
	})
	if err != nil {
		a.writeError(w, r, err)
		return
	}
	status := http.StatusOK
	if account.Version == 1 {
		status = http.StatusCreated
	}
	writeJSON(w, status, account)
}

func (a *API) handleGetAccount(w http.ResponseWriter, r *http.Request) {
	account, err := a.svc.GetAccount(r.Context(), r.PathValue("accountId"))
	if err != nil {
		a.writeError(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, account)
}

type assessRequest struct {
	DaysPastDue *int `json:"daysPastDue"`
}

func (a *API) handleAssess(w http.ResponseWriter, r *http.Request) {
	var req assessRequest
	if err := decodeJSON(r, w, &req); err != nil {
		a.writeError(w, r, err)
		return
	}
	if req.DaysPastDue == nil {
		a.writeError(w, r, &DomainError{Code: CodeInvalidRequest, Message: "daysPastDue is required"})
		return
	}
	result, err := a.svc.AssessAccount(r.Context(), AssessCommand{AccountID: r.PathValue("accountId"), DaysPastDue: *req.DaysPastDue})
	if err != nil {
		a.writeError(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, result)
}

// ===========================================================================
// Bootstrap
// ===========================================================================

// Config is read from the environment (twelve-factor).
type Config struct {
	ServiceName       string
	ServiceVersion    string
	HTTPAddr          string
	LogLevel          slog.Level
	ReadHeaderTimeout time.Duration
	ReadTimeout       time.Duration
	WriteTimeout      time.Duration
	IdleTimeout       time.Duration
	ShutdownTimeout   time.Duration
	DrainDelay        time.Duration
}

// LoadConfig parses configuration using getenv so tests can inject values.
func LoadConfig(getenv func(string) string) (Config, error) {
	cfg := Config{
		ServiceName:       valueOr(getenv("SERVICE_NAME"), "late-fee-service"),
		ServiceVersion:    valueOr(getenv("SERVICE_VERSION"), "0.1.0"),
		HTTPAddr:          valueOr(getenv("HTTP_ADDR"), ":8080"),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       60 * time.Second,
		ShutdownTimeout:   20 * time.Second,
		DrainDelay:        5 * time.Second,
	}
	if err := cfg.LogLevel.UnmarshalText([]byte(valueOr(getenv("LOG_LEVEL"), "INFO"))); err != nil {
		return Config{}, fmt.Errorf("LOG_LEVEL: %w", err)
	}
	durations := map[string]*time.Duration{
		"HTTP_READ_HEADER_TIMEOUT": &cfg.ReadHeaderTimeout,
		"HTTP_READ_TIMEOUT":        &cfg.ReadTimeout,
		"HTTP_WRITE_TIMEOUT":       &cfg.WriteTimeout,
		"HTTP_IDLE_TIMEOUT":        &cfg.IdleTimeout,
		"SHUTDOWN_TIMEOUT":         &cfg.ShutdownTimeout,
		"READINESS_DRAIN_DELAY":    &cfg.DrainDelay,
	}
	for name, target := range durations {
		raw := getenv(name)
		if raw == "" {
			continue
		}
		d, err := time.ParseDuration(raw)
		if err != nil || d < 0 {
			return Config{}, fmt.Errorf("%s: invalid duration %q", name, raw)
		}
		*target = d
	}
	return cfg, nil
}

func valueOr(v, fallback string) string {
	if v == "" {
		return fallback
	}
	return v
}

// NewLogger returns a JSON slog logger that stamps every record with service metadata.
func NewLogger(w io.Writer, cfg Config) *slog.Logger {
	return slog.New(slog.NewJSONHandler(w, &slog.HandlerOptions{Level: cfg.LogLevel})).
		With(slog.String("service", cfg.ServiceName), slog.String("version", cfg.ServiceVersion))
}

// run serves on ln until ctx is cancelled, then drains and shuts down gracefully.
func run(ctx context.Context, cfg Config, logger *slog.Logger, ln net.Listener, repo AccountRepository) error {
	health := &Health{}
	svc := NewLateFeeService(repo, DefaultLateFeePolicy(), time.Now, logger)
	api := &API{svc: svc, repo: repo, health: health, log: logger, info: ServiceInfo{Name: cfg.ServiceName, Version: cfg.ServiceVersion}}

	srv := &http.Server{
		Handler:           api.Routes(),
		ReadHeaderTimeout: cfg.ReadHeaderTimeout,
		ReadTimeout:       cfg.ReadTimeout,
		WriteTimeout:      cfg.WriteTimeout,
		IdleTimeout:       cfg.IdleTimeout,
		ErrorLog:          slog.NewLogLogger(logger.Handler(), slog.LevelError),
		BaseContext:       func(net.Listener) context.Context { return context.WithoutCancel(ctx) },
	}

	serveErr := make(chan error, 1)
	go func() {
		logger.Info("http server listening", slog.String("addr", ln.Addr().String()))
		serveErr <- srv.Serve(ln)
	}()
	health.ready.Store(true)

	select {
	case err := <-serveErr:
		if errors.Is(err, http.ErrServerClosed) {
			return nil
		}
		return fmt.Errorf("http server: %w", err)
	case <-ctx.Done():
	}

	logger.Info("shutdown requested; draining", slog.Duration("drain_delay", cfg.DrainDelay))
	health.draining.Store(true)
	time.Sleep(cfg.DrainDelay)

	shutdownCtx, cancel := context.WithTimeout(context.Background(), cfg.ShutdownTimeout)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		_ = srv.Close()
		return fmt.Errorf("graceful shutdown: %w", err)
	}
	if err := <-serveErr; err != nil && !errors.Is(err, http.ErrServerClosed) {
		return fmt.Errorf("http server: %w", err)
	}
	logger.Info("shutdown complete")
	return nil
}

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	code := serve(ctx, os.Getenv, os.Stdout, os.Stderr)
	stop()
	os.Exit(code)
}

// serve wires configuration, logging and the listener, and returns the process exit code.
func serve(ctx context.Context, getenv func(string) string, stdout, stderr io.Writer) int {
	cfg, err := LoadConfig(getenv)
	if err != nil {
		fmt.Fprintf(stderr, "configuration error: %v\n", err)
		return 2
	}
	logger := NewLogger(stdout, cfg)
	slog.SetDefault(logger)

	ln, err := net.Listen("tcp", cfg.HTTPAddr)
	if err != nil {
		logger.Error("listen failed", slog.String("addr", cfg.HTTPAddr), slog.String("error", err.Error()))
		return 1
	}
	if err := run(ctx, cfg, logger, ln, NewInMemoryAccountRepository()); err != nil {
		logger.Error("service stopped with error", slog.String("error", err.Error()))
		return 1
	}
	return 0
}
