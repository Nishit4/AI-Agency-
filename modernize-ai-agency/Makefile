# LegacyModern AI — repository verification (mirrors CLAUDE.md section 6).
SHELL := /bin/bash
.SHELLFLAGS := -eu -o pipefail -c

.PHONY: verify bridge harness service

verify: bridge harness service
	@echo "All checks passed."

bridge:
	cd mcp_bridge && npm ci && npm run typecheck && npm test

harness:
	cd templates && test -z "$$(gofmt -l .)" && go vet ./... && go test -v -cover ./...

service:
	cd templates/target_service_boilerplate && test -z "$$(gofmt -l .)" && go vet ./... && go test -race -v -cover ./...
