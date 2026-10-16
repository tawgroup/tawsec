---
name: blue-headers-cors
description: >
  Web hardening audit — HTTP security headers (CSP, HSTS, X-Frame-Options,
  X-Content-Type-Options, Referrer-Policy, Permissions-Policy), cookie flags
  (Secure, HttpOnly, SameSite), CORS configuration review (reflected origins,
  credentials + wildcard sins), and a quick TLS sanity check. Defensive
  counterpart to red-xss and red-broken-auth.
when_to_use: >
  Use when the user wants to harden their web app: "security headers",
  "CORS check", "siết CORS", "harden my app", "CSP", "cookie flags",
  "check TLS", "audit my headers", "observatory score", "securityheaders.com
  gave me an F". Works on the user's own app by curl-ing it, or on code
  (nginx/Express/Next config) directly.
allowed-tools: Read, Grep, Glob, Bash(curl *), Bash(rg *), Bash(grep *), Bash(openssl *), Bash(nmap *), Bash(jq *)
---

# blue-headers-cors — web hardening audit

Headers and CORS are the cheapest defense-in-depth you can buy: a few lines of config that neutralize whole attack classes. You audit what the server actually sends, then fix it in config.

> No `rg` on the box? Every search below works with `grep -rn` — don't stall the audit installing tools.

## Workflow

### 1. See what the server really sends

```bash
curl -sI https://TARGET/ | grep -iE 'content-security|strict-transport|x-frame|x-content|referrer|permissions'
curl -sI -X OPTIONS https://TARGET/api -H "Origin: https://evil.example" -H "Access-Control-Request-Method: POST"
```

Test multiple routes — headers often differ between the frontend, `/api`, and error pages (error pages frequently lose ALL headers).

### 2. The header checklist

| Header | What good looks like | What it stops |
|---|---|---|
| `Content-Security-Policy` | `default-src 'self'` + specific directives, NO `unsafe-inline` in script-src (nonces/hashes instead) | XSS impact — the second layer when escaping fails (see `red-xss`) |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | SSL stripping |
| `X-Content-Type-Options` | `nosniff` | MIME confusion |
| `X-Frame-Options` / CSP `frame-ancestors` | `DENY` or specific origins | Clickjacking |
| `Referrer-Policy` | `strict-origin-when-cross-origin` or stricter | Token leakage via URL |
| `Permissions-Policy` | deny what you don't use (`camera=(), microphone=(), geolocation=()`) | Feature abuse |

Start CSP in report-only mode (`Content-Security-Policy-Report-Only`) on production, collect violations, then enforce. Enforcing blind breaks apps.

**Missing `X-Frame-Options`/`frame-ancestors`? Prove the clickjacking** with a local
PoC the stakeholder can click — a transparent iframe of the real site under a
decoy button:

```html
<!-- clickjacking-poc.html — open locally, then click "Win a prize" -->
<button style="position:fixed;top:50%;left:50%;z-index:10">Win a prize</button>
<iframe src="https://TARGET/settings/delete-account"
        style="opacity:0;position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9"></iframe>
```

Clicking the decoy lands on the real button underneath. That demo — plus "the
fix is one config line" — is what convinces people to ship
`X-Frame-Options: DENY` + `frame-ancestors 'none'`.

### 3. Cookie flags

```bash
curl -sI https://TARGET/login | grep -i 'set-cookie'
```

Every session cookie needs: `Secure` (HTTPS only) + `HttpOnly` (JS can't read → XSS can't steal it, the direct counter to `red-xss` cookie theft) + `SameSite=Lax` or `Strict` (CSRF resistance). Missing flags on session cookies = HIGH.

### 4. CORS — where the bodies are buried

The sins, in order of how often they appear:

1. **Reflecting any Origin**: send `Origin: https://evil.example`, get back `Access-Control-Allow-Origin: https://evil.example` + `Access-Control-Allow-Credentials: true` = any site can read your API as the logged-in user. CRITICAL.
2. **Wildcard + credentials** (browsers block it, but trying it signals misunderstanding) 
3. **Allowlist checked with `endsWith`**: `allowed.com` check passes `evilallowed.com` — substring/suffix matching on origins is broken
4. **`null` origin allowed**: sandboxed iframes produce `Origin: null` — treat as attacker-controlled
5. Preflight caching keeping a fixed CORS config exploitable long after deploy

Correct pattern: explicit origin allowlist (exact string match), credentials only on routes that need them, `Vary: Origin` set.

### 5. TLS quick check

```bash
echo | openssl s_client -connect TARGET:443 -servername TARGET 2>/dev/null | openssl x509 -noout -dates -issuer
nmap --script ssl-enum-ciphers -p 443 TARGET    # flag TLS 1.0/1.1, weak ciphers
```

### 6. Fix in config

Find where headers are set — nginx (`add_header`), Express (`helmet()`), Next.js (`headers()` in next.config), Cloudflare rules. Write the actual fix, not just the recommendation.

## Output format

```
# Hardening Report — TARGET

| Check | Status | Evidence (actual header value) | Severity | Fix |

## Score
headers: 4/7 present  •  cookies: 2/3 flags  •  CORS: misconfigured  •  TLS: ok

## Ready-to-apply config
(the nginx block / helmet config / next.config snippet)
```

## Language

Respond in the user's language; keep header names and config as-is.
