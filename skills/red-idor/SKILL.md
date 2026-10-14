---
name: red-idor
description: >
  Broken access control and IDOR testing on authorized targets — horizontal
  and vertical privilege escalation by flipping object IDs, forced browsing
  to admin functions, HTTP method and API version tricks, and missing
  function-level authorization.
when_to_use: >
  Use when the user wants to test access control on their own app or a lab:
  "test IDOR", "broken access control", "xem được data user khác không",
  "đổi ID trên URL", "horizontal privilege escalation", "can users see each
  other's orders", "forced browsing", "missing authorization check". Also
  whenever an API returns objects by ID — IDs are invitations.
allowed-tools: Read, Grep, Bash(curl *), Bash(jq *), Bash(grep *), Bash(seq *), Bash(python3 *)
---

# red-idor — broken access control / IDOR testing

OWASP #1 for a reason. The question you answer over and over: **"the server checked WHO I am — but did it check WHAT I'm allowed to touch?"**

## ⛔ AUTHORIZATION GATE — READ FIRST

Confirm lab OR owned target / written permission. No context? **Stop and ask.**

**Impact discipline:** test with TWO accounts you control (attacker A, victim B). Access B's data with A's token = proof. Never poke at real third-party users' data "to see if it works".

## The mental model

Authentication ≠ authorization. Every object reference (`/orders/123`, `?doc=456`, `{"user_id": 789}`) needs a per-request ownership/permission check on the server. Developers remember the login check and forget the object check.

## Workflow

### 1. Set up the experiment properly

Create/get **two test accounts** (A and B). Log in as both, save both tokens/cookies. As B, create some private data (an order, a document, a profile field). Note every ID that appears anywhere: URLs, response bodies, hidden form fields, JS variables.

### 2. Flip the IDs (horizontal escalation)

Replay A's requests but with B's IDs:

```bash
# As user A (A's token), ask for B's stuff
curl -H "Authorization: Bearer $TOKEN_A" https://TARGET/api/orders/$B_ORDER_ID
```

Where to flip:

- Path: `/api/users/1002` → `/api/users/1003`
- Query: `?account=1234` → `?account=1235`
- **Body/JSON** (most missed): `PUT /api/profile {"user_id": 1003, "role": "admin"}` — changing ID *in the body* on an endpoint that updates "me" = mass-assignment-flavored IDOR, often CRITICAL
- GUIDs aren't automatically safe: if B's GUID leaks anywhere (a shared link, a public comment, an email preview image), it's still IDOR. Note it, lower severity.

### 3. Vertical escalation (forced browsing)

As low-priv A, request admin functionality directly:

- `GET /admin`, `/api/admin/users`, `/api/internal/metrics`
- Guess from JS bundles: admin routes often ship in the frontend (back to `red-recon` bundle analysis)
- HTTP method tricks: `GET` blocked → try `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD` on the same path
- API versioning: `/api/v2/users` requires auth → does `/api/v1/users` still exist and skip the check?
- Parameter pollution: `role=user&role=admin`, `{"role": ["user", "admin"]}`

### 4. Multi-step flows — skip steps

If a flow is step1 → step2 → step3 (verify email → set password → done), try jumping straight to the last step. Flows that trust "you must have passed step 2" are everywhere.

### 5. Map the whole object graph

Don't stop at one endpoint. Orders contain `user_id`, `address_id`, `payment_id` — each nested ID is another IDOR candidate. Scraping sequentially (`/api/orders/1..10000`) shows whether enumeration is possible; run it gently (this doubles as a rate-limit check).

## Severity guidance

| Finding | Severity |
|---|---|
| Read another user's PII via ID flip | HIGH |
| Modify another user's data / role via body ID | CRITICAL |
| Admin function reachable by normal user | CRITICAL |
| GUID-based IDOR requiring a leak first | MEDIUM |
| Sequential IDs enumerable but low-sensitivity data | LOW–MEDIUM |

## Output format

```
# Access Control Report — TARGET

Test accounts: A (role X), B (role Y)

| # | Endpoint | Flip (what changed) | Result (A got B's what?) | Severity |

## The pattern
(list every endpoint missing per-object checks — one fix usually kills them all:
 a middleware/policy layer, not 40 scattered if-statements)

## Fix
→ blue-code-review: server-side ownership check per object access,
  deny-by-default, central authorization middleware, indirect reference maps
```

## Learn more (free labs)

- PortSwigger Academy: [Access control](https://portswigger.net/web-security/access-control) and [IDOR](https://portswigger.net/web-security/access-control/idor)
