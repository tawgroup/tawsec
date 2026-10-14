---
name: red-xss
description: >
  Cross-site scripting testing on authorized targets — reflected, stored and
  DOM-based XSS. Context-aware payload construction (HTML body, attribute,
  JavaScript string, URL contexts), filter bypass basics, and safe impact
  proofing with alert/print instead of cookie theft.
when_to_use: >
  Use when the user wants to test for XSS on their own app or a lab:
  "test XSS", "cross-site scripting", "thử chèn script", "check my comment
  form", "stored XSS", "DOM XSS", "bypass CSP". Also when the user reports
  a weird popup or pasted a suspicious payload.
allowed-tools: Read, Grep, Bash(curl *), Bash(grep *), Bash(rg *), Bash(jq *), Bash(python3 *), Bash(node *)
---

# red-xss — cross-site scripting testing

You find where user input lands in a page unescaped, and prove JavaScript execution. XSS is not "the alert(1) bug" — it's the bug that lets an attacker run code as your user.

## ⛔ AUTHORIZATION GATE — READ FIRST

Confirm the target is a lab OR owned by the user / written permission. No context? **Stop and ask.**

**Impact discipline:** prove with `alert(document.domain)` or `print()` — harmless and unambiguous. Never steal real session cookies, never deploy keyloggers, never deface. On production you own, one harmless popup in a private test account is the proof.

## The mental model

XSS = attacker-controlled string reaches the browser as code instead of data. Three flavors:

- **Reflected**: payload in the request bounces back in the response (search boxes, error pages)
- **Stored**: payload is saved and served to others (comments, usernames, bios) — the dangerous one
- **DOM**: payload never leaves the browser; a JS sink (`innerHTML`, `eval`, `location.hash` → `innerHTML`) executes it

## Workflow

### 1. Find reflection points

Inject a unique canary like `xss7q9` into every input (params, forms, headers). Then grep the response for the canary. No reflection → move on. Reflected → identify the **context**:

| Where the canary lands | Context | Starter payload |
|---|---|---|
| Between tags: `<div>xss7q9</div>` | HTML body | `<img src=x onerror=alert(document.domain)>` |
| Inside an attribute: `<input value="xss7q9">` | Attribute | `" onfocus=alert(document.domain) autofocus x="` |
| Inside a JS string: `var q = 'xss7q9';` | JS string | `';alert(document.domain);//` |
| In a `href`/URL | URL | `javascript:alert(document.domain)` |

Context is everything. A payload for the wrong context does nothing — this is the #1 beginner mistake.

### 2. Test stored XSS separately

Submit canaries in anything persisted: comments, display names, profile fields, order notes, support tickets. Then **browse the app as a second (admin/test) account** and watch where they pop. Stored XSS hitting an admin panel = game over for the app.

### 3. Hunt DOM XSS in the JS itself

Grep the frontend code for dangerous sinks:

```bash
rg -n "innerHTML|outerHTML|document\.write|eval\(|dangerouslySetInnerHTML|location\.hash|location\.search" src/
```

Then trace backwards: does a source (`location.hash`, `location.search`, `postMessage`, `localStorage`) reach that sink unsanitized? In React, `dangerouslySetInnerHTML` with user data is a finding by name alone.

### 4. Bypass the naive filter (learning exercise)

Apps with one regex `s/<script>//` are everywhere. Escalate calmly:

- Case: `<ScRiPt>`, event handlers: `<img onerror=...>`, `<svg onload=...>`
- Nested: `<scr<script>ipt>` (filter removes inner, outer survives)
- Encoding: HTML entities, URL-encoding, double-encoding
- No angle brackets at all: in JS-string contexts you only need `'`

Each bypass that works = the filter is broken = finding. Note what the filter blocked vs missed.

### 5. Assess impact honestly

- HttpOnly session cookie? Then `document.cookie` won't have it — XSS is still serious (attacker can act as the user from inside the page), just not via cookie theft. Say so accurately.
- Reflected XSS on an error page nobody visits = MEDIUM. Stored XSS in comments on the main page = HIGH/CRITICAL.

## Output format

```
# XSS Test Report — TARGET

| # | Location | Type (reflected/stored/DOM) | Context | Payload that fired | Severity |

## Proof
(screenshot description / request→response with the payload in place)

## Root cause
(file:line — unescaped output, dangerouslySetInnerHTML, template literal into HTML)

## Fix
→ blue-code-review: context-aware output encoding, DOMPurify for rich text,
  remove innerHTML sinks; then blue-headers-cors: CSP as a second layer
```

## Learn more (free labs)

- PortSwigger Academy: [Cross-site scripting](https://portswigger.net/web-security/cross-site-scripting) — 30 labs covering every context
- [PayloadsAllTheThings — XSS](https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/XSS%20Injection) for payload reference
