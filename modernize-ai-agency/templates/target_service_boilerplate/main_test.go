package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"net"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"sync"
	"testing"
	"time"
)

func discardLogger() *slog.Logger { return slog.New(slog.NewJSONHandler(io.Discard, nil)) }

func fixedClock() time.Time { return time.Date(2026, 10, 1, 2, 0, 0, 0, time.UTC) }

// TestLateFeePolicyParity replays the LNFEE010 behavioral contract vectors (A-001..A-018).
func TestLateFeePolicyParity(t *testing.T) {
	policy := DefaultLateFeePolicy()
	cases := []struct {
		id         string
		balance    string
		dpd        int
		status     AccountStatus
		wantFee    string
		wantFlag   bool
		wantStatus AccountStatus
		wantCode   string
		wantRC     string
	}{
		{"A-001 half-up 5.005 -> 5.01", "100.10", 20, StatusCurrent, "5.01", true, StatusCurrent, "", ""},
		{"A-002 grace day 15", "100.00", 15, StatusCurrent, "0.00", false, StatusCurrent, "", ""},
		{"A-003 first chargeable day", "100.00", 16, StatusCurrent, "5.00", true, StatusCurrent, "", ""},
		{"A-004 exactly at cap", "500.00", 20, StatusCurrent, "25.00", true, StatusCurrent, "", ""},
		{"A-005 capped", "500.20", 20, StatusCurrent, "25.00", true, StatusCurrent, "", ""},
		{"A-006 0.005 rounds up", "0.10", 20, StatusCurrent, "0.01", true, StatusCurrent, "", ""},
		{"A-007 0.0045 rounds down, flag N", "0.09", 20, StatusCurrent, "0.00", false, StatusCurrent, "", ""},
		{"A-008 zero balance", "0.00", 20, StatusCurrent, "0.00", false, StatusCurrent, "", ""},
		{"A-009 escalate to delinquent", "1000.00", 30, StatusCurrent, "25.00", true, StatusDelinquent, "", ""},
		{"A-010 escalate to chargeoff", "250.00", 90, StatusDelinquent, "12.50", true, StatusChargeOff, "", ""},
		{"A-011 never downgrade", "100.00", 20, StatusChargeOff, "5.00", true, StatusChargeOff, "", ""},
		{"A-012 day 29 stays current", "40.00", 29, StatusCurrent, "2.00", true, StatusCurrent, "", ""},
		{"A-013 invalid status", "100.00", 20, AccountStatus("FROZEN"), "", false, "", CodeInvalidStatus, "08"},
		{"A-014 closed before negative", "-5.00", 20, StatusClosed, "", false, "", CodeAccountClosed, "12"},
		{"A-015 negative balance", "-0.01", 20, StatusCurrent, "", false, "", CodeNegativeBalance, "08"},
		{"A-016 days over 999", "100.00", 1000, StatusCurrent, "", false, "", CodeInvalidDaysPastDue, "08"},
		{"A-017 day 999 accepted", "100.00", 999, StatusCurrent, "5.00", true, StatusChargeOff, "", ""},
		{"A-018 PIC ceiling", "999999999.99", 61, StatusDelinquent, "25.00", true, StatusDelinquent, "", ""},
	}
	for _, tc := range cases {
		tc := tc
		t.Run(tc.id, func(t *testing.T) {
			balance, err := ParseMoney(tc.balance)
			if err != nil {
				t.Fatalf("ParseMoney(%q): %v", tc.balance, err)
			}
			got, err := policy.Assess(balance, tc.dpd, tc.status)
			if tc.wantCode != "" {
				var de *DomainError
				if !errors.As(err, &de) {
					t.Fatalf("expected DomainError %s, got %v", tc.wantCode, err)
				}
				if de.Code != tc.wantCode || de.LegacyReturnCode != tc.wantRC {
					t.Fatalf("got %s/RC %s, want %s/RC %s", de.Code, de.LegacyReturnCode, tc.wantCode, tc.wantRC)
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if got.LateFee.String() != tc.wantFee || got.FeeAssessed != tc.wantFlag || got.NewStatus != tc.wantStatus {
				t.Fatalf("got fee=%s flag=%v status=%s, want fee=%s flag=%v status=%s",
					got.LateFee, got.FeeAssessed, got.NewStatus, tc.wantFee, tc.wantFlag, tc.wantStatus)
			}
		})
	}
}

// TestContractFileParity re-runs the policy against templates/behavioral_contract.json when the
// template sits next to it, so the service and the contract can never drift apart silently.
func TestContractFileParity(t *testing.T) {
	path := os.Getenv("BEHAVIORAL_CONTRACT")
	if path == "" {
		path = "../behavioral_contract.json"
	}
	data, err := os.ReadFile(path)
	if errors.Is(err, os.ErrNotExist) && os.Getenv("BEHAVIORAL_CONTRACT") == "" {
		t.Skip("no behavioral contract next to the template; set BEHAVIORAL_CONTRACT to enable")
	}
	if err != nil {
		t.Fatalf("read contract: %v", err)
	}
	type assertion struct {
		AssertionID string `json:"assertionId"`
		Operation   string `json:"operation"`
		Inputs      struct {
			OutstandingBalance string `json:"outstandingBalance"`
			DaysPastDue        int    `json:"daysPastDue"`
		} `json:"inputs"`
		InitialState struct {
			Account struct {
				Status string `json:"status"`
			} `json:"account"`
		} `json:"initialState"`
		Expected struct {
			Outputs struct {
				LateFee     string `json:"lateFee"`
				FeeAssessed bool   `json:"feeAssessed"`
				NewStatus   string `json:"newStatus"`
			} `json:"outputs"`
			Error *struct {
				Code             string `json:"code"`
				LegacyReturnCode string `json:"legacyReturnCode"`
			} `json:"error"`
		} `json:"expected"`
	}
	type contract struct {
		Assertions []assertion `json:"assertions"`
	}
	var doc struct {
		Examples []contract `json:"examples"`
		contract
	}
	if err := json.Unmarshal(data, &doc); err != nil {
		t.Fatalf("decode contract: %v", err)
	}
	contracts := doc.Examples
	if len(contracts) == 0 {
		contracts = []contract{doc.contract}
	}
	policy := DefaultLateFeePolicy()
	ran := 0
	for _, c := range contracts {
		for _, a := range c.Assertions {
			if a.Operation != "AssessLateFee" {
				continue
			}
			ran++
			balance, perr := ParseMoney(a.Inputs.OutstandingBalance)
			if perr != nil {
				t.Errorf("%s: %v", a.AssertionID, perr)
				continue
			}
			got, err := policy.Assess(balance, a.Inputs.DaysPastDue, AccountStatus(strings.TrimRight(a.InitialState.Account.Status, " ")))
			if a.Expected.Error != nil {
				var de *DomainError
				if !errors.As(err, &de) || de.Code != a.Expected.Error.Code || de.LegacyReturnCode != a.Expected.Error.LegacyReturnCode {
					t.Errorf("%s: expected %s/RC %s, got %v", a.AssertionID, a.Expected.Error.Code, a.Expected.Error.LegacyReturnCode, err)
				}
				continue
			}
			if err != nil {
				t.Errorf("%s: unexpected error %v", a.AssertionID, err)
				continue
			}
			want := a.Expected.Outputs
			if got.LateFee.String() != want.LateFee || got.FeeAssessed != want.FeeAssessed ||
				string(got.NewStatus) != strings.TrimRight(want.NewStatus, " ") {
				t.Errorf("%s: got %+v, want %+v", a.AssertionID, got, want)
			}
		}
	}
	if ran == 0 {
		t.Fatal("contract contained no AssessLateFee assertions")
	}
}

func TestParseMoney(t *testing.T) {
	cases := []struct {
		in      string
		want    Money
		wantErr bool
	}{
		{"0", 0, false},
		{"0.5", 50, false},
		{"100.10", 10010, false},
		{"-0.01", -1, false},
		{"999999999.99", MaxMoney, false},
		{"-999999999.99", MinMoney, false},
		{"1000000000.00", 0, true},
		{"1.234", 0, true},
		{"1e3", 0, true},
		{"", 0, true},
		{"12,50", 0, true},
		{".50", 0, true},
	}
	for _, tc := range cases {
		got, err := ParseMoney(tc.in)
		if (err != nil) != tc.wantErr || (!tc.wantErr && got != tc.want) {
			t.Errorf("ParseMoney(%q) = %d, %v; want %d, err=%v", tc.in, got, err, tc.want, tc.wantErr)
		}
		if !tc.wantErr {
			back, _ := ParseMoney(got.String())
			if back != got {
				t.Errorf("round trip %q -> %s -> %d", tc.in, got, back)
			}
		}
	}
	if _, err := json.Marshal(Money(-1)); err != nil {
		t.Fatal(err)
	}
	var m Money
	if err := json.Unmarshal([]byte(`12.50`), &m); err == nil {
		t.Fatal("JSON numbers must be rejected for money")
	}
}

func newTestAPI(t *testing.T) (*API, *InMemoryAccountRepository) {
	t.Helper()
	repo := NewInMemoryAccountRepository()
	health := &Health{}
	health.ready.Store(true)
	api := &API{
		svc:    NewLateFeeService(repo, DefaultLateFeePolicy(), fixedClock, discardLogger()),
		repo:   repo,
		health: health,
		log:    discardLogger(),
		info:   ServiceInfo{Name: "late-fee-service", Version: "test"},
	}
	return api, repo
}

func do(t *testing.T, h http.Handler, method, path, body string) *httptest.ResponseRecorder {
	t.Helper()
	req := httptest.NewRequest(method, path, strings.NewReader(body))
	if body != "" {
		req.Header.Set("Content-Type", "application/json")
	}
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	return rec
}

func TestHTTPQuote(t *testing.T) {
	api, _ := newTestAPI(t)
	h := api.Routes()
	cases := []struct {
		name       string
		body       string
		wantStatus int
		wantSubstr string
	}{
		{"nominal", `{"outstandingBalance":"100.10","daysPastDue":20,"accountStatus":"CURRENT"}`, 200, `"lateFee":"5.01"`},
		{"escalation", `{"outstandingBalance":"1000.00","daysPastDue":30,"accountStatus":"CURRENT"}`, 200, `"newStatus":"DELINQUENT"`},
		{"closed account", `{"outstandingBalance":"10.00","daysPastDue":20,"accountStatus":"CLOSED"}`, 422, `"legacyReturnCode":"12"`},
		{"invalid status", `{"outstandingBalance":"10.00","daysPastDue":20,"accountStatus":"FROZEN"}`, 422, CodeInvalidStatus},
		{"PIC X(10) padded status accepted", `{"outstandingBalance":"40.00","daysPastDue":30,"accountStatus":"CURRENT   "}`, 200, `"newStatus":"DELINQUENT"`},
		{"leading space stays invalid", `{"outstandingBalance":"40.00","daysPastDue":30,"accountStatus":"  CURRENT"}`, 422, CodeInvalidStatus},
		{"status is case-sensitive", `{"outstandingBalance":"40.00","daysPastDue":30,"accountStatus":"current"}`, 422, CodeInvalidStatus},
		{"numeric money rejected", `{"outstandingBalance":10.5,"daysPastDue":20,"accountStatus":"CURRENT"}`, 400, CodeInvalidAmount},
		{"unknown field", `{"outstandingBalance":"1.00","daysPastDue":1,"accountStatus":"CURRENT","x":1}`, 400, CodeInvalidRequest},
		{"missing field", `{"outstandingBalance":"1.00"}`, 400, "required"},
		{"two objects", `{"outstandingBalance":"1.00","daysPastDue":1,"accountStatus":"CURRENT"}{}`, 400, "single JSON object"},
		{"malformed", `{`, 400, "malformed"},
	}
	for _, tc := range cases {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			rec := do(t, h, http.MethodPost, "/v1/late-fees/quote", tc.body)
			if rec.Code != tc.wantStatus || !strings.Contains(rec.Body.String(), tc.wantSubstr) {
				t.Fatalf("status=%d body=%s; want %d containing %q", rec.Code, rec.Body.String(), tc.wantStatus, tc.wantSubstr)
			}
			if rec.Header().Get("X-Request-ID") == "" {
				t.Fatal("missing X-Request-ID")
			}
		})
	}
}

func TestHTTPAccountLifecycle(t *testing.T) {
	api, _ := newTestAPI(t)
	h := api.Routes()

	rec := do(t, h, http.MethodPut, "/v1/accounts/ACCT00000001", `{"outstandingBalance":"1000.00","daysPastDue":0,"status":"CURRENT"}`)
	if rec.Code != http.StatusCreated {
		t.Fatalf("create: %d %s", rec.Code, rec.Body)
	}
	rec = do(t, h, http.MethodPut, "/v1/accounts/ACCT00000001", `{"outstandingBalance":"1000.00","daysPastDue":0,"status":"CURRENT"}`)
	if rec.Code != http.StatusConflict {
		t.Fatalf("stale create should conflict: %d %s", rec.Code, rec.Body)
	}

	rec = do(t, h, http.MethodPost, "/v1/accounts/ACCT00000001/late-fees", `{"daysPastDue":30}`)
	if rec.Code != http.StatusOK {
		t.Fatalf("assess: %d %s", rec.Code, rec.Body)
	}
	var result AssessResult
	if err := json.Unmarshal(rec.Body.Bytes(), &result); err != nil {
		t.Fatal(err)
	}
	if result.LateFee != 2500 || result.Account.Balance != 102500 || result.Account.Status != StatusDelinquent || result.Account.Version != 2 {
		t.Fatalf("unexpected assessment result %+v", result)
	}

	rec = do(t, h, http.MethodGet, "/v1/accounts/ACCT00000001", "")
	if rec.Code != http.StatusOK || !strings.Contains(rec.Body.String(), `"outstandingBalance":"1025.00"`) {
		t.Fatalf("get: %d %s", rec.Code, rec.Body)
	}
	if rec = do(t, h, http.MethodGet, "/v1/accounts/MISSING1", ""); rec.Code != http.StatusNotFound {
		t.Fatalf("missing account: %d", rec.Code)
	}
	if rec = do(t, h, http.MethodGet, "/v1/accounts/bad-id", ""); rec.Code != http.StatusBadRequest {
		t.Fatalf("invalid id: %d", rec.Code)
	}
	if rec = do(t, h, http.MethodDelete, "/v1/accounts/ACCT00000001", ""); rec.Code != http.StatusMethodNotAllowed {
		t.Fatalf("method routing: %d", rec.Code)
	}
}

func TestConcurrentAssessmentsAreSerialisedByVersion(t *testing.T) {
	repo := NewInMemoryAccountRepository()
	svc := NewLateFeeService(repo, DefaultLateFeePolicy(), fixedClock, discardLogger())
	ctx := context.Background()
	if _, err := svc.UpsertAccount(ctx, UpsertAccountCommand{AccountID: "ACCT1", Balance: 10000, Status: StatusCurrent}); err != nil {
		t.Fatal(err)
	}
	var wg sync.WaitGroup
	var mu sync.Mutex
	succeeded, conflicted := 0, 0
	start := make(chan struct{})
	for i := 0; i < 16; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			<-start
			_, err := svc.AssessAccount(ctx, AssessCommand{AccountID: "ACCT1", DaysPastDue: 20})
			mu.Lock()
			defer mu.Unlock()
			switch {
			case err == nil:
				succeeded++
			case errors.Is(err, ErrConflict):
				conflicted++
			default:
				t.Errorf("unexpected error: %v", err)
			}
		}()
	}
	close(start)
	wg.Wait()
	final, _ := repo.Get(ctx, "ACCT1")
	if int64(succeeded) != final.Version-1 || succeeded+conflicted != 16 {
		t.Fatalf("succeeded=%d conflicted=%d final version=%d", succeeded, conflicted, final.Version)
	}
}

func TestHealthProbes(t *testing.T) {
	api, _ := newTestAPI(t)
	h := api.Routes()
	if rec := do(t, h, http.MethodGet, "/healthz", ""); rec.Code != http.StatusOK {
		t.Fatalf("healthz: %d", rec.Code)
	}
	if rec := do(t, h, http.MethodGet, "/ready", ""); rec.Code != http.StatusOK {
		t.Fatalf("ready: %d", rec.Code)
	}
	api.health.draining.Store(true)
	if rec := do(t, h, http.MethodGet, "/ready", ""); rec.Code != http.StatusServiceUnavailable {
		t.Fatalf("ready while draining: %d", rec.Code)
	}
	if rec := do(t, h, http.MethodGet, "/healthz", ""); rec.Code != http.StatusOK {
		t.Fatalf("healthz must stay up while draining: %d", rec.Code)
	}
}

func TestStructuredLogging(t *testing.T) {
	var buf bytes.Buffer
	cfg, err := LoadConfig(func(string) string { return "" })
	if err != nil {
		t.Fatal(err)
	}
	logger := NewLogger(&buf, cfg)
	api, _ := newTestAPI(t)
	api.log = logger
	req := httptest.NewRequest(http.MethodPost, "/v1/late-fees/quote",
		strings.NewReader(`{"outstandingBalance":"1.00","daysPastDue":1,"accountStatus":"CURRENT"}`))
	req.Header.Set("X-Request-ID", "req-123")
	api.Routes().ServeHTTP(httptest.NewRecorder(), req)
	var entry map[string]any
	if err := json.Unmarshal(bytes.TrimSpace(buf.Bytes()), &entry); err != nil {
		t.Fatalf("log line is not JSON: %v (%s)", err, buf.String())
	}
	for key, want := range map[string]any{"msg": "http request", "request_id": "req-123", "service": "late-fee-service", "status": float64(200)} {
		if entry[key] != want {
			t.Errorf("log %s = %v, want %v", key, entry[key], want)
		}
	}
}

func TestLoadConfig(t *testing.T) {
	env := map[string]string{"HTTP_ADDR": ":9090", "LOG_LEVEL": "DEBUG", "SHUTDOWN_TIMEOUT": "3s"}
	cfg, err := LoadConfig(func(k string) string { return env[k] })
	if err != nil {
		t.Fatal(err)
	}
	if cfg.HTTPAddr != ":9090" || cfg.LogLevel != slog.LevelDebug || cfg.ShutdownTimeout != 3*time.Second {
		t.Fatalf("unexpected config %+v", cfg)
	}
	if _, err := LoadConfig(func(k string) string { return map[string]string{"SHUTDOWN_TIMEOUT": "soon"}[k] }); err == nil {
		t.Fatal("invalid duration accepted")
	}
	if _, err := LoadConfig(func(k string) string { return map[string]string{"LOG_LEVEL": "LOUD"}[k] }); err == nil {
		t.Fatal("invalid log level accepted")
	}
}

// TestGracefulShutdown starts the real server, holds a request open across the shutdown
// signal and checks that it completes and run returns cleanly.
func TestGracefulShutdown(t *testing.T) {
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	cfg, _ := LoadConfig(func(k string) string {
		return map[string]string{"READINESS_DRAIN_DELAY": "200ms", "SHUTDOWN_TIMEOUT": "5s"}[k]
	})
	ctx, cancel := context.WithCancel(context.Background())
	done := make(chan error, 1)
	go func() { done <- run(ctx, cfg, discardLogger(), ln, NewInMemoryAccountRepository()) }()

	base := "http://" + ln.Addr().String()
	deadline := time.Now().Add(3 * time.Second)
	for {
		resp, err := http.Get(base + "/ready")
		if err == nil {
			resp.Body.Close()
			if resp.StatusCode == http.StatusOK {
				break
			}
		}
		if time.Now().After(deadline) {
			t.Fatal("server never became ready")
		}
		time.Sleep(20 * time.Millisecond)
	}

	cancel()
	time.Sleep(50 * time.Millisecond)
	resp, err := http.Get(base + "/ready")
	if err != nil {
		t.Fatalf("server stopped accepting during drain: %v", err)
	}
	resp.Body.Close()
	if resp.StatusCode != http.StatusServiceUnavailable {
		t.Fatalf("ready during drain = %d, want 503", resp.StatusCode)
	}

	select {
	case err := <-done:
		if err != nil {
			t.Fatalf("run returned %v", err)
		}
	case <-time.After(10 * time.Second):
		t.Fatal("run did not return after shutdown")
	}
	if _, err := http.Get(base + "/healthz"); err == nil {
		t.Fatal("server still accepting connections after shutdown")
	}
}

func TestServeExitCodes(t *testing.T) {
	var stdout, stderr bytes.Buffer
	if code := serve(context.Background(), func(k string) string {
		return map[string]string{"LOG_LEVEL": "LOUD"}[k]
	}, &stdout, &stderr); code != 2 || !strings.Contains(stderr.String(), "configuration error") {
		t.Fatalf("bad config: code=%d stderr=%s", code, stderr.String())
	}
	if code := serve(context.Background(), func(k string) string {
		return map[string]string{"HTTP_ADDR": "256.0.0.1:99999"}[k]
	}, &stdout, &stderr); code != 1 {
		t.Fatalf("bad listen address: code=%d", code)
	}
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	if code := serve(ctx, func(k string) string {
		return map[string]string{"HTTP_ADDR": "127.0.0.1:0", "READINESS_DRAIN_DELAY": "0s"}[k]
	}, &stdout, &stderr); code != 0 {
		t.Fatalf("clean shutdown: code=%d", code)
	}
}

func TestServiceValidationErrors(t *testing.T) {
	repo := NewInMemoryAccountRepository()
	svc := NewLateFeeService(repo, DefaultLateFeePolicy(), fixedClock, discardLogger())
	ctx := context.Background()
	upserts := []struct {
		name string
		cmd  UpsertAccountCommand
		code string
	}{
		{"bad id", UpsertAccountCommand{AccountID: "lower", Status: StatusCurrent}, CodeInvalidRequest},
		{"bad status", UpsertAccountCommand{AccountID: "A1", Status: "FROZEN"}, CodeInvalidStatus},
		{"balance overflow", UpsertAccountCommand{AccountID: "A1", Status: StatusCurrent, Balance: MaxMoney + 1}, CodeBalanceOverflow},
		{"balance underflow", UpsertAccountCommand{AccountID: "A1", Status: StatusCurrent, Balance: MinMoney - 1}, CodeBalanceOverflow},
		{"days overflow", UpsertAccountCommand{AccountID: "A1", Status: StatusCurrent, DaysPastDue: 10_000}, CodeInvalidDaysPastDue},
		{"days negative", UpsertAccountCommand{AccountID: "A1", Status: StatusCurrent, DaysPastDue: -1}, CodeInvalidDaysPastDue},
	}
	for _, tc := range upserts {
		_, err := svc.UpsertAccount(ctx, tc.cmd)
		var de *DomainError
		if !errors.As(err, &de) || de.Code != tc.code {
			t.Errorf("%s: got %v, want %s", tc.name, err, tc.code)
		}
		if de != nil && de.Error() == "" {
			t.Errorf("%s: empty error string", tc.name)
		}
	}
	if _, err := svc.UpsertAccount(ctx, UpsertAccountCommand{AccountID: "A2", Status: StatusCurrent, ExpectedVersion: 3}); !errors.Is(err, ErrNotFound) {
		t.Errorf("update of missing account: %v", err)
	}

	if _, err := svc.AssessAccount(ctx, AssessCommand{AccountID: "bad id"}); err == nil {
		t.Error("invalid account id accepted")
	}
	if _, err := svc.AssessAccount(ctx, AssessCommand{AccountID: "NOPE", DaysPastDue: 20}); !errors.Is(err, ErrNotFound) {
		t.Errorf("missing account: %v", err)
	}
	if _, err := svc.UpsertAccount(ctx, UpsertAccountCommand{AccountID: "CLOSED1", Status: StatusClosed, Balance: 100}); err != nil {
		t.Fatal(err)
	}
	if _, err := svc.AssessAccount(ctx, AssessCommand{AccountID: "CLOSED1", DaysPastDue: 20}); err == nil {
		t.Error("closed account assessed")
	}
	if _, err := svc.UpsertAccount(ctx, UpsertAccountCommand{AccountID: "MAX1", Status: StatusCurrent, Balance: MaxMoney}); err != nil {
		t.Fatal(err)
	}
	var de *DomainError
	if _, err := svc.AssessAccount(ctx, AssessCommand{AccountID: "MAX1", DaysPastDue: 20}); !errors.As(err, &de) || de.Code != CodeBalanceOverflow {
		t.Errorf("fee posting overflow: %v", err)
	}
}

type failingRepo struct{ *InMemoryAccountRepository }

func (failingRepo) Ping(context.Context) error { return errors.New("database unreachable") }

func (failingRepo) Get(context.Context, string) (Account, error) {
	return Account{}, errors.New("connection reset by peer")
}

func TestHTTPErrorPaths(t *testing.T) {
	api, _ := newTestAPI(t)
	h := api.Routes()
	cases := []struct {
		name, method, path, body string
		contentType              string
		wantStatus               int
		wantSubstr               string
	}{
		{"assess malformed", http.MethodPost, "/v1/accounts/A1/late-fees", `{`, "application/json", 400, "malformed"},
		{"assess missing days", http.MethodPost, "/v1/accounts/A1/late-fees", `{}`, "application/json", 400, "daysPastDue is required"},
		{"assess unknown account", http.MethodPost, "/v1/accounts/A1/late-fees", `{"daysPastDue":5}`, "application/json", 404, CodeAccountNotFound},
		{"upsert malformed", http.MethodPut, "/v1/accounts/A1", `[]`, "application/json", 400, "malformed"},
		{"upsert missing fields", http.MethodPut, "/v1/accounts/A1", `{"status":"CURRENT"}`, "application/json", 400, "required"},
		{"upsert invalid status", http.MethodPut, "/v1/accounts/A1", `{"outstandingBalance":"1.00","daysPastDue":0,"status":"X"}`, "application/json", 422, CodeInvalidStatus},
		{"wrong content type", http.MethodPost, "/v1/late-fees/quote", `{}`, "text/plain", 400, "Content-Type"},
	}
	for _, tc := range cases {
		req := httptest.NewRequest(tc.method, tc.path, strings.NewReader(tc.body))
		req.Header.Set("Content-Type", tc.contentType)
		rec := httptest.NewRecorder()
		h.ServeHTTP(rec, req)
		if rec.Code != tc.wantStatus || !strings.Contains(rec.Body.String(), tc.wantSubstr) {
			t.Errorf("%s: status=%d body=%s; want %d containing %q", tc.name, rec.Code, rec.Body.String(), tc.wantStatus, tc.wantSubstr)
		}
	}

	if rec := do(t, h, http.MethodPut, "/v1/accounts/A1", `{"outstandingBalance":"1.00","daysPastDue":0,"status":"CURRENT"}`); rec.Code != http.StatusCreated {
		t.Fatalf("create: %d", rec.Code)
	}
	if rec := do(t, h, http.MethodPut, "/v1/accounts/A1", `{"outstandingBalance":"2.00","daysPastDue":0,"status":"CURRENT","expectedVersion":1}`); rec.Code != http.StatusOK {
		t.Fatalf("update: %d %s", rec.Code, rec.Body)
	}
	if rec := do(t, h, http.MethodPost, "/v1/accounts/A1/late-fees", `{"daysPastDue":1000}`); rec.Code != http.StatusUnprocessableEntity {
		t.Fatalf("domain error on assess: %d", rec.Code)
	}

	broken := &API{
		svc:    NewLateFeeService(failingRepo{NewInMemoryAccountRepository()}, DefaultLateFeePolicy(), fixedClock, discardLogger()),
		repo:   failingRepo{NewInMemoryAccountRepository()},
		health: api.health,
		log:    discardLogger(),
	}
	bh := broken.Routes()
	if rec := do(t, bh, http.MethodGet, "/ready", ""); rec.Code != http.StatusServiceUnavailable || !strings.Contains(rec.Body.String(), "dependency_unavailable") {
		t.Fatalf("ready with failing dependency: %d %s", rec.Code, rec.Body)
	}
	if rec := do(t, bh, http.MethodGet, "/v1/accounts/A1", ""); rec.Code != http.StatusInternalServerError || strings.Contains(rec.Body.String(), "connection reset") {
		t.Fatalf("infrastructure errors must be 500 without leaking detail: %d %s", rec.Code, rec.Body)
	}
}

func TestPanicRecovery(t *testing.T) {
	api, _ := newTestAPI(t)
	h := api.withRequestID(api.withRecovery(http.HandlerFunc(func(http.ResponseWriter, *http.Request) {
		panic("boom")
	})))
	rec := do(t, h, http.MethodGet, "/", "")
	if rec.Code != http.StatusInternalServerError || !strings.Contains(rec.Body.String(), "INTERNAL") {
		t.Fatalf("panic not recovered: %d %s", rec.Code, rec.Body)
	}
}

func TestStatusRecorderDefaultsTo200(t *testing.T) {
	rec := httptest.NewRecorder()
	sr := &statusRecorder{ResponseWriter: rec}
	if _, err := sr.Write([]byte("ok")); err != nil {
		t.Fatal(err)
	}
	if sr.status != http.StatusOK || sr.bytes != 2 {
		t.Fatalf("status=%d bytes=%d", sr.status, sr.bytes)
	}
}

// topLevelKeyCounts returns how often each top-level key appears in one JSON object;
// encoding/json silently keeps the last duplicate, so duplicates must be found by token.
func topLevelKeyCounts(t *testing.T, line []byte) map[string]int {
	t.Helper()
	dec := json.NewDecoder(bytes.NewReader(line))
	if tok, err := dec.Token(); err != nil || tok != json.Delim('{') {
		t.Fatalf("log line is not a JSON object: %s", line)
	}
	counts := map[string]int{}
	for dec.More() {
		key, err := dec.Token()
		if err != nil {
			t.Fatalf("decode key: %v", err)
		}
		counts[key.(string)]++
		var skip json.RawMessage
		if err := dec.Decode(&skip); err != nil {
			t.Fatalf("decode value: %v", err)
		}
	}
	return counts
}

// TestLogRecordsHaveUniqueKeys guards against fields that collide with the logger's
// service/version attributes (the account version is logged as account_version).
func TestLogRecordsHaveUniqueKeys(t *testing.T) {
	var buf bytes.Buffer
	cfg, err := LoadConfig(func(string) string { return "" })
	if err != nil {
		t.Fatal(err)
	}
	logger := NewLogger(&buf, cfg)
	repo := NewInMemoryAccountRepository()
	svc := NewLateFeeService(repo, DefaultLateFeePolicy(), fixedClock, logger)
	ctx := context.Background()
	if _, err := svc.UpsertAccount(ctx, UpsertAccountCommand{AccountID: "LOG1", Balance: 10000, Status: StatusCurrent}); err != nil {
		t.Fatal(err)
	}
	if _, err := svc.AssessAccount(ctx, AssessCommand{AccountID: "LOG1", DaysPastDue: 30}); err != nil {
		t.Fatal(err)
	}
	lines := bytes.Split(bytes.TrimSpace(buf.Bytes()), []byte("\n"))
	if len(lines) == 0 || len(lines[0]) == 0 {
		t.Fatal("expected at least one log record")
	}
	for _, line := range lines {
		for key, n := range topLevelKeyCounts(t, line) {
			if n > 1 {
				t.Errorf("key %q appears %d times in %s", key, n, line)
			}
		}
	}
	if !bytes.Contains(buf.Bytes(), []byte(`"account_version":2`)) {
		t.Errorf("assessment log should carry account_version 2: %s", buf.String())
	}
}
