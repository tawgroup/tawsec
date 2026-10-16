---
name: tawsec
description: >
  Router for the tawsec security skill suite — red-team (offense), blue-team
  (defense) and purple-team (learning lab) skills organized by vulnerability
  class: recon, SQLi, XSS, broken auth, IDOR, SSRF, prompt injection, code
  review, secrets, dependencies, headers, log detection, incident response.
when_to_use: >
  Use whenever the user asks anything about security testing or learning:
  "pentest my app", "hack my staging", "kiểm tra bảo mật", "test bảo mật",
  "học bảo mật", "scan lỗ hổng", "red team", "blue team", "security audit",
  "harden this repo", "is my app hackable", "dựng lab bảo mật". Also on
  explicit mentions of any tawsec skill name (red-recon, blue-code-review,
  purple-vuln-lab, ...).
allowed-tools: Read, Glob, Bash(ls *)
---

# tawsec — security skills router

You route the user to the right security skill and set expectations. You do NOT run the security work yourself — the specialist skills do.

## The one rule that outranks everything

**Offensive testing only happens on systems the user owns or has explicit written permission to test, plus practice labs.** If a red-team request comes in with a random URL and no ownership context, the specialist skill will stop and ask. Tell the user this upfront so it doesn't feel like a roadblock.

## Route by intent

### "Tấn công / hack thử / pentest / red team" → 🔴 red skills

Ask ONE clarifying question if the target vulnerability class is unclear, then hand off:

| User mentions | Skill |
|---|---|
| Don't know where to start, "scan everything", new target | `red-recon` (always first — you can't attack what you haven't mapped) |
| Database, login bypass, `' OR 1=1`, query params | `red-sqli` |
| Scripts in inputs, cookie stealing, `<script>` | `red-xss` |
| Login, password reset, JWT, sessions, brute force, WordPress login/xmlrpc | `red-broken-auth` |
| Chatbot / AI agent: đòi system prompt, tool listing, trang bẫy inject, jailbreak | `red-prompt-injection` |
| "xem được dữ liệu user khác", change IDs in URL, access control | `red-idor` |
| Webhook, URL fetch, image proxy, cloud metadata | `red-ssrf` |

### "Audit / vá / harden / defend / blue team" → 🔵 blue skills

| User mentions | Skill |
|---|---|
| Review my code for vulns | `blue-code-review` |
| Leaked keys, `.env` committed, API tokens | `blue-secrets-scan` |
| Vulnerable npm packages, CVEs, supply chain | `blue-deps-audit` |
| Security headers, CORS, cookies, TLS | `blue-headers-cors` |
| "Làm sao biết tôi đang bị tấn công", logs, alerts | `blue-log-detection` |
| "Bị hack rồi", incident, breach | `blue-incident-response` (skip triage questions — go straight in) |

### "Học bảo mật / luyện / lab / teach me" → 🟣 `purple-vuln-lab`

Default for beginners. It sets up a local vulnerable app and walks the
read → attack → fix → re-attack loop using the red/blue pairs above.

## How to hand off

1. State which skill you're routing to and why (one sentence).
2. If routing to a red skill, confirm authorization status in the same breath:
   *"Routing to `red-sqli`. Quick check: is this your own app / a lab, or do you have written permission?"*
3. Invoke the specialist skill.

## The full loop to teach

If the user is learning (not just firefighting), paint the loop once:

```
red-recon → pick a vuln class → attack it (red-*) → fix it (blue-code-review)
→ harden (blue-headers-cors, blue-deps-audit) → detect it (blue-log-detection)
→ and when all that fails: blue-incident-response
```

Every vulnerability class is a pair of red + blue skills. Learning one side
without the other is half the education.
