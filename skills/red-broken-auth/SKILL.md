---
name: red-broken-auth
description: >
  Authentication and session testing on authorized targets — username
  enumeration, rate-limit and brute-force checks, password reset token flaws,
  JWT attacks (alg confusion, weak secrets, unverified claims), session
  management issues, and MFA bypass basics.
when_to_use: >
  Use when the user wants to attack their own auth system or a lab:
  "test my login", "hack the login form", "JWT attack", "crack my JWT
  secret", "test password reset", "brute force test", "thử brute force",
  "bypass login", "MFA bypass", "session fixation". Also when the user
  pastes a JWT and asks what can be done with it.
allowed-tools: Read, Grep, Bash(curl *), Bash(jq *), Bash(python3 *), Bash(hashcat *), Bash(john *), Bash(jwt_tool *), Bash(ffuf *), Bash(grep *), Bash(base64 *)
---

# red-broken-auth — authentication & session attacks

Auth is where web apps go to die. You test each link in the chain: identify → authenticate → token → session → reset → MFA.

## ⛔ AUTHORIZATION GATE — READ FIRST

Confirm lab OR owned target / written permission. No context? **Stop and ask.** Brute-forcing is loud — on anything but your own staging or a lab, expect lockouts and alerts. Use small, targeted wordlists, never internet-scale credential dumps.

**Impact discipline:** prove access to YOUR OWN test accounts only. If you land in someone else's account, stop, report, don't look around.

## Workflow

### 1. Username enumeration (the quiet win)

Compare responses for valid vs invalid usernames:

- Login error messages: "user not found" vs "wrong password" = enumeration
- **Timing**: valid user → password gets hashed → slower response. Measure 10+ times, average it: `curl -w "%{time_total}"`
- Password reset / registration: "email already registered" = enumeration

If responses differ in ANY way (body, status, timing, headers), that's a finding.

### 2. Rate limiting & brute-force resistance

- Fire 20 rapid bad logins at a test account: `for i in $(seq 20); do curl ...; done`
- Watch for: lockout, CAPTCHA, 429, IP throttle. **None after 20 tries = finding.**
- Check bypasses: rotating `X-Forwarded-For`, changing user-agent, password-spraying (1 password × N users — dodges per-account lockout).

### 3. Password reset — the crown jewels

Request a reset for your own test account and dissect the token:

- **Entropy**: is the token short, numeric, sequential, or timestamp-based? Collect 3+ tokens and diff them.
- **Reuse**: does the token work twice? After password change?
- **Expiry**: valid for hours? Days?
- **Host header poisoning**: request reset with `Host: evil.example` or `X-Forwarded-Host: evil.example` — if the reset email's link uses the injected host, the token leaks to the attacker's domain. This one is CRITICAL when it works.
- Does the reset flow leak whether the email exists? (back to enumeration)

### 4. JWT attacks

Grab a token, then:

```bash
# Decode (no verification needed to READ it)
cut -d. -f2 <<< "$TOKEN" | base64 -d 2>/dev/null | jq
# Full attack suite
jwt_tool "$TOKEN" -M at
```

Test in order:

1. **Does the server verify the signature at all?** Change `user_id` in the payload, re-encode with the same signature → if accepted, CRITICAL.
2. **alg=none**: re-encode header as `{"alg":"none"}`, empty signature → accepted? CRITICAL.
3. **Weak secret**: `hashcat -a 0 -m 16500 "$TOKEN" wordlist.txt` — `secret`, `password`, `123456`, the app name... If it cracks, you can mint admin tokens. CRITICAL.
4. **Algorithm confusion** (RS256→HS256): sign with the PUBLIC key as HMAC secret. Needs the pub key (often at `/.well-known/jwks.json`).
5. **kid injection**: if the header has `kid`, try path traversal or SQLi through it.

### 5. Session management

- Session cookie flags: missing `HttpOnly` (XSS can steal), missing `Secure`, `SameSite=None` (CSRF-able)
- Does the session ID rotate after login? (no rotation = session fixation)
- Does logout actually kill the server-side session? Reuse the cookie after logout.
- Are JWTs long-lived with no revocation? Logout that only deletes the client copy = token still valid.

### 6. MFA

- Can you skip the MFA step by navigating directly to the post-MFA URL?
- Response manipulation: server returns `{"mfa": "failed"}` — try flipping to `success` (works more than it should on badly built apps)
- Rate limit on the 6-digit code? 10^6 guesses is nothing without throttling.

## Output format

```
# Auth Test Report — TARGET

| # | Weakness | Where | Proof | Severity |

## Chain of doom
(often: enumeration → no rate limit → weak reset token = full account takeover.
 Describe how the findings combine — combos are the real story.)

## Fix
→ blue-code-review for: constant-time responses, generic error messages,
  rate limiting, strong reset tokens (CSPRNG, 1-time, <1h), JWT best practices
  (verify always, allowlist alg, strong secret, short expiry + refresh rotation)
```

## Learn more (free labs)

- PortSwigger Academy: [Authentication](https://portswigger.net/web-security/authentication) and [JWT attacks](https://portswigger.net/web-security/jwt)
