---
name: blue-code-review
description: >
  Defensive secure code review — grep-driven hunt for injection sinks (SQL,
  command, XSS), missing authentication/authorization checks on routes, mass
  assignment, unsafe file upload, and dangerous deserialization. The blue
  mirror of the red-team vuln classes: finds in code what red skills find
  over HTTP.
when_to_use: >
  Use when the user wants their code reviewed for security issues:
  "review bảo mật", "secure code review", "check my code for
  vulnerabilities", "tìm lỗ hổng trong code", "audit this repo", "is this
  endpoint safe", "defensive review". Safe to run on any code the user can
  see — this skill never attacks anything, it only reads code.
allowed-tools: Read, Grep, Glob, Bash(rg *), Bash(grep *), Bash(jq *), Bash(ls *), Bash(cat *)
---

# blue-code-review — defensive secure code review

You review code the way an attacker reads it: trace user input from source to sink, and check every route for who it's willing to serve. Pure defense — no authorization gate needed, you only read the user's own code.

> No `rg` on the box? Every search below works with `grep -rn` — don't stall the review installing tools.

## The method: source → sink

A vulnerability is a path from attacker-controlled input (**source**: request params, body, headers, cookies, uploaded files) to a dangerous operation (**sink**: query, shell, HTML, file write, redirect) without validation or escaping. You hunt sinks first (easy to grep), then trace backwards to sources.

## The checklists

### 1. Injection sinks

```bash
rg -n 'query\(|execute\(|raw\(|findBySql|\$\{.*\}.*SELECT|concat.*WHERE' --type js --type ts
rg -n 'exec\(|execSync|spawn\(|system\(|shell_exec|passthru|popen' 
rg -n 'eval\(|new Function|setTimeout\([^)]*input|setInterval\([^)]*input'
rg -n 'innerHTML|outerHTML|document\.write|dangerouslySetInnerHTML'
```

For each hit: does user input reach it? Is it parameterized/escaped? String-concatenated SQL = finding. `exec()` with any request data = CRITICAL.

### 2. Auth coverage on routes

List every route definition (`router.get/post/put/delete`, Next.js route handlers, Flask/FastAPI decorators). For each one ask: is there an auth middleware/dependency? Build the matrix:

```
| Route | Method | Auth middleware? | Object-level check? | Verdict |
```

Missing auth on a mutating or data-returning route = HIGH. This is exactly what `red-broken-auth` and `red-idor` exploit — the fix-side of those findings lives here.

### 3. Object-level authorization

Even authenticated routes must check ownership. Look for handlers that take an ID (path/query/body) and fetch it without a `where userId = currentUser` style constraint. This is the `red-idor` fix: **deny by default, check per object**.

### 4. Mass assignment

```bash
rg -n 'create\(req\.body|update\(req\.body|new User\(req|\.\.\.req\.body|Model\.update.*body'
```

Passing the whole request body into the model lets attackers set `role: "admin"`, `isVerified: true`. Fix: pick allowed fields explicitly (allowlist DTO).

### 5. File upload

Check: extension allowlist (not denylist), MIME sniffing, size limit, random server-side filename, stored outside web root / served with `Content-Disposition: attachment`, image re-encoding. `filename` from the user used directly in a path = path traversal.

### 6. Secrets in code

Quick pass: `rg -n 'sk-[a-zA-Z0-9]|AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{35}|-----BEGIN|password\s*=\s*["'"'"'][^"'"'"']+'`. Real hits → hand off to `blue-secrets-scan` for the full treatment (history scan + rotation).

### 7. SSRF surface

`fetch(url)` / `axios.get(url)` where `url` comes from the request = the `red-ssrf` finding, seen from the code side. Check for allowlist + link-local blocking.

## Report format

```
# Secure Code Review — REPO

Scope: files/routes reviewed  •  Findings: N (C/H/M/L)

## CRITICAL
### 1. SQL injection in search
**File:** `src/routes/search.ts:14`
**Sink→Source:** `db.raw("SELECT * FROM p WHERE name LIKE '%" + q + "%'")` ← `req.query.q`
**Fix:** parameterized query: `db.raw("... LIKE ?", [`%${q}%`])`
**Verify:** re-run red-sqli probe `'` against /search — should return normal results, no error.

...

## ✅ Passed
(checks that ran clean — max 5 lines, each citing a real check)
```

For every finding, include a **Verify** line naming the red skill that would re-test it after the fix. That closes the red↔blue loop.

## Language

Respond in the user's language (Vietnamese in → Vietnamese report), keeping file paths, code and severity labels as-is.

## What this is NOT

Not taint analysis, not a full SAST replacement, not a pentest. It's a sharp pair of eyes plus grep. Disclaimer (adapt to user's language):

> Đây là review thủ công bằng heuristics — bắt các lỗi phổ biến, không đảm bảo tìm hết mọi lỗ hổng.
