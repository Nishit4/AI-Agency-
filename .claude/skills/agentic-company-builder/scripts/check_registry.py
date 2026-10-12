#!/usr/bin/env python3
"""
SmartOps registry check — keeps the agentic company's "org chart" consistent.

The same facts are repeated across the codebase: department names (Postgres
enum, TS union, dashboard list, runner files, API routes), agent names
(lib/claude.ts and the schema seed) and agent counts written in prose. This
script cross-checks them and reports drift.

Usage (from the repo root):
    python3 .claude/skills/agentic-company-builder/scripts/check_registry.py
    python3 .claude/skills/agentic-company-builder/scripts/check_registry.py --root /path/to/repo

Exit code 1 if there are ERRORs (real mismatches), 0 if only WARN/INFO.
Standard library only.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

NUMBER_WORDS = {
    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6, "seven": 7,
    "eight": 8, "nine": 9, "ten": 10, "eleven": 11, "twelve": 12, "thirteen": 13,
    "fourteen": 14, "fifteen": 15, "sixteen": 16, "seventeen": 17, "eighteen": 18,
    "nineteen": 19, "twenty": 20,
}

findings: list[tuple[str, str]] = []


def report(level: str, msg: str) -> None:
    findings.append((level, msg))


def read(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except FileNotFoundError:
        return ""


def find_app_dir(root: Path) -> Path:
    for candidate in (root / "smartops", root):
        if (candidate / "lib" / "claude.ts").exists():
            return candidate
    sys.exit(f"Could not find lib/claude.ts under {root} or {root / 'smartops'} — pass --root <repo root>.")


# ---------------------------------------------------------------- parsers

def parse_agents_ts(src: str) -> dict[str, str]:
    """name -> department from the AGENTS registry in lib/claude.ts."""
    block = src
    start = src.find("export const AGENTS")
    if start != -1:
        # Stop at the next top-level export after AGENTS.
        nxt = src.find("\nexport ", start + 1)
        block = src[start: nxt if nxt != -1 else len(src)]
    pairs = re.findall(r'name:\s*"([^"]+)"\s*,\s*department:\s*"([a-z_]+)"', block)
    return {name: dept for name, dept in pairs}


def parse_agents_seed(sql: str) -> dict[str, str]:
    m = re.search(r"insert\s+into\s+agents\s*\([^)]*\)\s*values(.*?)on\s+conflict", sql, re.S | re.I)
    if not m:
        return {}
    rows = re.findall(r"\(\s*'((?:[^']|'')+)'\s*,\s*'([a-z_]+)'\s*,", m.group(1))
    return {name.replace("''", "'"): dept for name, dept in rows}


def parse_department_enum(sql: str) -> set[str]:
    values: set[str] = set()
    m = re.search(r"create\s+type\s+department\s+as\s+enum\s*\(([^)]*)\)", sql, re.I)
    if m:
        values |= set(re.findall(r"'([a-z_]+)'", m.group(1)))
    values |= set(re.findall(r"alter\s+type\s+department\s+add\s+value\s+(?:if\s+not\s+exists\s+)?'([a-z_]+)'", sql, re.I))
    return values


def parse_department_type(src: str) -> set[str]:
    m = re.search(r"export\s+type\s+Department\s*=\s*([^;]+);", src)
    return set(re.findall(r'"([a-z_]+)"', m.group(1))) if m else set()


def parse_dashboard_departments(src: str) -> set[str]:
    return set(re.findall(r'\{\s*key:\s*"([a-z_]+)"', src))


def parse_executor_cases(src: str) -> set[str]:
    start = src.find("async function executeApprovedAction")
    if start == -1:
        return set()
    end = src.find("\nasync function ", start + 1)
    body = src[start: end if end != -1 else len(src)]
    return set(re.findall(r'case\s+"([a-z_]+)"\s*:', body))


def invoked_agents(app: Path, agent_names: set[str]) -> tuple[set[str], bool]:
    """
    Returns (agents invoked by a constant name, whether any dynamic routing exists).
    Dynamic routing = callAgent/runDepartmentAgent called with something other
    than a known constant, e.g. a variable chosen per request.
    """
    invoked: set[str] = set()
    dynamic = False
    files = list((app / "lib").rglob("*.ts")) + list((app / "app").rglob("*.ts"))
    for f in files:
        if f.name == "claude.ts" and f.parent.name == "lib":
            continue
        src = read(f)
        consts = dict(re.findall(r'const\s+([A-Z_][A-Z0-9_]*)\s*=\s*"([^"]+)"', src))
        for call in re.findall(r"callAgent(?:WithActions)?\(\s*([^,\)]+)", src):
            arg = call.strip()
            if arg.startswith('"') and arg.endswith('"'):
                invoked.add(arg.strip('"'))
            elif arg in consts:
                invoked.add(consts[arg])
            else:
                dynamic = True
        if re.search(r"runDepartmentAgent\(", src) and "function runDepartmentAgent" not in src:
            # A shared runner is in use; if pickAgent/agent routing exists, specialists are reachable.
            if re.search(r"pickAgent\(|\.agent\b", src):
                dynamic = True
            # Any quoted agent name passed to the runner or as pickAgent's fallback lead.
            for name in re.findall(r'runDepartmentAgent\([^;]*?"([^"]+)"', src):
                invoked.add(name)
            for name in re.findall(r'pickAgent\([^)]*?,\s*"([^"]+)"\s*\)', src):
                invoked.add(name)
    return invoked & agent_names, dynamic


def count_claims(root: Path, app: Path) -> list[tuple[Path, int, int, str]]:
    """Find phrases like '16 AI agents' / 'four departments' in source and docs."""
    claims = []
    pattern = re.compile(
        r"\b(\d+|" + "|".join(NUMBER_WORDS) + r")\s+(?:specialized\s+|specialised\s+)?(?:AI\s+)?(agents|departments)\b",
        re.I,
    )
    exts = {".ts", ".tsx", ".sql", ".md"}
    for f in app.rglob("*"):
        if f.suffix not in exts or any(p in f.parts for p in ("node_modules", ".next", ".git")):
            continue
        for lineno, line in enumerate(read(f).splitlines(), 1):
            for m in pattern.finditer(line):
                raw = m.group(1).lower()
                n = int(raw) if raw.isdigit() else NUMBER_WORDS[raw]
                claims.append((f, lineno, n, m.group(2).lower()))
    return claims


# ---------------------------------------------------------------- checks

def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--root", default=".", help="repo root (default: current directory)")
    args = ap.parse_args()

    root = Path(args.root).resolve()
    app = find_app_dir(root)
    rel = lambda p: p.relative_to(root) if p.is_relative_to(root) else p  # noqa: E731

    claude_ts = read(app / "lib" / "claude.ts")
    schema_sql = read(app / "supabase" / "schema.sql")
    types_ts = read(app / "types" / "index.ts")
    agents_page = read(app / "app" / "dashboard" / "agents" / "page.tsx")
    approvals_route = read(app / "app" / "api" / "approvals" / "route.ts")

    ts_agents = parse_agents_ts(claude_ts)
    seed_agents = parse_agents_seed(schema_sql)
    enum_depts = parse_department_enum(schema_sql)
    type_depts = parse_department_type(types_ts)
    page_depts = parse_dashboard_departments(agents_page)
    executor_cases = parse_executor_cases(approvals_route)

    if not ts_agents:
        report("ERROR", "Could not parse any agents from lib/claude.ts AGENTS — has its shape changed?")

    # Departments agree everywhere.
    if enum_depts != type_depts:
        report("ERROR", f"Department enum (schema.sql) {sorted(enum_depts)} != Department type (types/index.ts) {sorted(type_depts)}")
    if page_depts and page_depts != type_depts:
        report("ERROR", f"Agents dashboard DEPARTMENTS {sorted(page_depts)} != Department type {sorted(type_depts)} — agents in missing departments won't be shown")

    for dept in sorted(type_depts):
        if not (app / "lib" / "agents" / f"{dept}.ts").exists():
            report("ERROR", f"No runner lib/agents/{dept}.ts for department '{dept}'")
        if not (app / "app" / "api" / "agents" / dept / "route.ts").exists():
            report("ERROR", f"No API route app/api/agents/{dept}/route.ts for department '{dept}'")
        if dept not in executor_cases:
            report("INFO", f"No executor case for '{dept}' in approvals route — approving its items only records the decision")

    # Agents agree between code and seed.
    for name in sorted(set(ts_agents) - set(seed_agents)):
        report("ERROR", f"Agent '{name}' is in lib/claude.ts but not seeded in schema.sql — it won't appear on the dashboard or track status")
    for name in sorted(set(seed_agents) - set(ts_agents)):
        report("ERROR", f"Agent '{name}' is seeded in schema.sql but missing from lib/claude.ts AGENTS — calls to it will throw 'Unknown agent'")
    for name in sorted(set(ts_agents) & set(seed_agents)):
        if ts_agents[name] != seed_agents[name]:
            report("ERROR", f"Agent '{name}' department mismatch: code={ts_agents[name]} seed={seed_agents[name]}")
    for name, dept in sorted(ts_agents.items()):
        if type_depts and dept not in type_depts:
            report("ERROR", f"Agent '{name}' uses unknown department '{dept}'")

    # Reachability: is every agent actually invoked by some code path?
    invoked, dynamic = invoked_agents(app, set(ts_agents))
    unreachable = sorted(set(ts_agents) - invoked)
    if unreachable and not dynamic:
        report("WARN", f"{len(unreachable)} of {len(ts_agents)} agents are defined but never invoked (no route reaches them): {', '.join(unreachable)}")
    elif unreachable:
        report("INFO", f"Dynamic routing detected; these agents have no dedicated entry point and rely on it: {', '.join(unreachable)}")

    # Prose counts.
    n_agents, n_depts = len(ts_agents), len(type_depts)
    for f, lineno, n, kind in count_claims(root, app):
        expected = n_agents if kind == "agents" else n_depts
        if n != expected:
            report("WARN", f"{rel(f)}:{lineno} says {n} {kind}, registry has {expected}")

    # Output.
    print(f"SmartOps registry — {n_agents} agents in {n_depts} departments ({', '.join(sorted(type_depts))})")
    by_dept: dict[str, list[str]] = {}
    for name, dept in ts_agents.items():
        by_dept.setdefault(dept, []).append(name)
    for dept in sorted(by_dept):
        marks = [f"{n}{'' if n in invoked else '*'}" for n in by_dept[dept]]
        print(f"  {dept:<11} {', '.join(marks)}")
    if unreachable:
        print("  (* = not invoked by any code path)")
    print()

    order = {"ERROR": 0, "WARN": 1, "INFO": 2}
    for level, msg in sorted(findings, key=lambda x: order[x[0]]):
        print(f"{level:<5} {msg}")
    errors = sum(1 for lvl, _ in findings if lvl == "ERROR")
    warns = sum(1 for lvl, _ in findings if lvl == "WARN")
    print(f"\n{errors} error(s), {warns} warning(s)")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
