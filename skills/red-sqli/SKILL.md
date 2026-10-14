---
name: red-sqli
description: >
  SQL and NoSQL injection testing on authorized targets — find injectable
  parameters by hand (error-based, boolean-based, time-based, UNION-based),
  then confirm impact with sqlmap. Covers classic SQL and MongoDB/NoSQL
  operator injection common in Node.js apps.
when_to_use: >
  Use when the user wants to test for injection on their own app or a lab:
  "test SQLi", "SQL injection", "thử bypass login", "check my search box",
  "is this parameter injectable", "NoSQL injection", "Mongo injection",
  "chạy sqlmap". Trigger on error messages like "SQL syntax" the user pasted.
allowed-tools: Read, Grep, Bash(curl *), Bash(sqlmap *), Bash(jq *), Bash(grep *), Bash(python3 *)
---

# red-sqli — SQL / NoSQL injection testing

You find injectable parameters and prove impact with the least invasive payload possible. Manual first — sqlmap is the confirmation tool, not the discovery tool.

## ⛔ AUTHORIZATION GATE — READ FIRST

Before ANY testing, confirm: the target is a lab (Juice Shop, DVWA, PortSwigger) OR the user owns it / has written permission. No context? **Stop and ask.**

**Impact discipline:** prove injection with `version()`, `current_user`, or a deliberate delay — never `DROP`, never dump real user tables, never write. Read-only proofs only.

## The mental model

Injection = user input becomes part of a command. Your job: find where input reaches a query unescaped. Every parameter is a suspect: query params, POST bodies, JSON fields, headers (`User-Agent`, `X-Forwarded-For`), cookies.

## Workflow

### 1. Find the suspects

Pick parameters that likely hit a database: `id`, `search`, `q`, `filter`, `sort`, `category`, login forms, anything numeric in a path (`/product/3`).

### 2. Probe by hand (this is where you learn)

Baseline first: send a normal request, note status/size/time. Then per parameter:

| Payload | What you're watching for |
|---|---|
| `'` `"` `\` | SQL error in response ("syntax error", "unterminated quote", "ORA-", "mysql") → **error-based** |
| `' AND '1'='1` vs `' AND '1'='2` | Response differs (content/size) → **boolean-based blind** |
| `' AND SLEEP(3)-- -` (MySQL) / `'; SELECT pg_sleep(3)-- -` (Postgres) | Response takes ~3s longer → **time-based blind** |
| `' ORDER BY 1-- -`, increment the number | Error at N tells you column count = N-1 → sets up UNION |
| `' UNION SELECT NULL,version()-- -` | DB version printed in the page → **full proof** |

Match the quote style to what breaks: if `'` does nothing, try `"`, or no quote at all (numeric params: `1 AND 1=1`).

### 3. NoSQL injection (Node.js + MongoDB — the vibe-code special)

If the stack is Express/Mongo, classic quotes won't work. Try:

- **Operator injection in JSON bodies**: `{"email": {"$ne": null}, "password": {"$ne": null}}` → logs in as the first user. Test on login forms.
- **Operator injection in query strings**: `email[$ne]=x&password[$ne]=x` (Express parses this into objects!)
- **Regex leaks**: `{"username": {"$regex": "^a"}}` — change the prefix, watch responses differ → enumerate usernames character by character.

### 4. Confirm with sqlmap (only after manual signal)

```bash
sqlmap -u "https://TARGET/item?id=3" --batch --banner --current-user --current-db
```

Flags that matter: `--banner` (version proof), `--current-user` (privilege proof). Do NOT add `--dump` against anything but a lab. For login forms: `sqlmap -r request.txt` with a captured request.

### 5. Assess the blast radius

- What DB user does the app connect as? (`current_user`) If it's root/DBA → CRITICAL.
- Error-based or blind? Blind is still exploitable, just slower.
- Stacked queries possible? (`;` + second statement) Rare but devastating.

## Output format

```
# Injection Test Report — TARGET

| # | Endpoint / param | Type (error/blind/UNION/NoSQL) | Proof (request→response) | Severity |

## Proof of concept
(the minimal curl that proves it — redact real data)

## Root cause in code
(if source available: file:line where the query is built by concatenation)

## Fix
→ route to blue-code-review: parameterized queries / prepared statements,
  input validation, least-privilege DB user, strip $ operators from user input (mongo-sanitize)
```

## Learn more (free labs — do these!)

- PortSwigger Academy: [SQL injection](https://portswigger.net/web-security/sql-injection) — 15+ labs, apprentice → expert
- Juice Shop: the login form and search box are your first victims
