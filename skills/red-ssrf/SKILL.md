---
name: red-ssrf
description: >
  Server-side request forgery testing on authorized targets — find URL-fetching
  features (webhooks, image proxies, PDF generators, URL previews), reach cloud
  metadata endpoints (169.254.169.254) and internal services, and bypass common
  URL allowlists (redirects, DNS tricks, alternate IP encodings).
when_to_use: >
  Use when the user wants to test SSRF on their own app or a lab:
  "test SSRF", "server-side request forgery", "my webhook feature fetches
  URLs", "image proxy", "URL preview feature", "cloud metadata", "169.254",
  "internal port scan qua server". Also when reviewing a feature that takes
  a URL as input.
allowed-tools: Read, Grep, Bash(curl *), Bash(jq *), Bash(python3 *), Bash(dig *), Bash(grep *)
---

# red-ssrf — server-side request forgery testing

SSRF turns your server into the attacker's proxy. The server sits inside your network, next to your metadata endpoint and internal services — and it will happily fetch any URL the attacker hands it, unless you stop it.

## ⛔ AUTHORIZATION GATE — READ FIRST

Confirm lab OR owned target / written permission. No context? **Stop and ask.**

**Impact discipline:** on cloud targets, prove metadata reachability by requesting the IAM role *name* only — never dump actual credentials, even from your own infra. One line proving reach is enough.

## The mental model

Any feature where the SERVER fetches a URL is a candidate: webhooks, "import from URL", image/thumbnail proxies, PDF generators, URL unfurl/preview in chat, RSS readers, health-check configurators, SSO/OIDC discovery. The attacker supplies the URL; the server has network position the attacker doesn't.

## Workflow

### 1. Find the fetchers

Grep the codebase and probe the app for URL-taking parameters:

```bash
rg -n "fetch\(|axios\.get|requests\.get|got\(|http\.get|urllib|curl_exec|file_get_contents\(" src/
```

Common parameter names: `url`, `uri`, `callback`, `webhook`, `image`, `src`, `feed`, `target`, `dest`, `redirect`.

### 2. Prove the fetch happens

Point the parameter at a listener you control — your own box (`nc -l 8080` + public tunnel) or a request-bin service you own. If a request arrives, the server fetches user URLs: SSRF surface confirmed. Note the `User-Agent` and source IP — it tells you what fetched (curl? headless Chrome? a Java HTTP client?).

### 3. Reach for the classics

Ordered by impact:

| Target | Why |
|---|---|
| `http://169.254.169.254/latest/meta-data/` (AWS), `http://metadata.google.internal` (GCP), `http://169.254.169.254/metadata/instance?api-version=2021-02-01` (Azure, needs `Metadata: true` header) | Cloud metadata → IAM role names → credentials. The killer finding. |
| `http://localhost:PORT/` for common internal ports (3000, 5432, 6379, 8080, 9200, 27017) | Internal admin panels, unauthenticated DBs/Redis/Elasticsearch listening on loopback |
| `http://internal-hostname/` from recon | Intranet apps that trust the internal network |
| `file:///etc/passwd` | Local file read, when scheme isn't restricted |

Detect blind SSRF by timing (internal port open = fast response; filtered = long timeout) and by response-size differences.

### 4. Bypass the allowlist (the fun part)

Apps that "check the URL" usually check it wrong. Try, in order:

- **Redirect bounce**: point at your own URL that 302s to `http://169.254.169.254/...` — many apps validate the first URL only
- **Credential confusion**: `http://allowed.com@169.254.169.254/` — the parser sees host `allowed.com`, the fetcher connects to the metadata IP
- **Alternate IP encodings**: `http://2852039166/` (decimal), `http://0xa9.0xfe.0xa9.0xfe/` (hex), `http://[::ffff:169.254.169.254]/` (IPv6-mapped)
- **DNS rebinding / nip.io style**: a domain that resolves to 169.254.169.254 passes a hostname check
- **Scheme games**: `gopher://`, `dict://`, `file://` when the scheme regex is weak

Each bypass that works = the validation approach is broken. Recommend network-level egress control instead.

### 5. Assess honestly

- Full metadata creds reachable = CRITICAL (game over for that cloud account if the role is broad)
- Internal port scan only, responses blind = MEDIUM
- Fetch confirmed but allowlist holds + egress locked down = LOW, note the defense works

## Output format

```
# SSRF Test Report — TARGET

| # | Feature/param | Fetch confirmed? | Reached (metadata/internal/file) | Bypass used | Severity |

## Proof
(request that made the server fetch + what came back — REDACT any credential material)

## Fix
→ blue-code-review: fetch from allowlisted domains resolved-and-pinned server-side,
  block link-local/RFC1918 at the HTTP client, require scheme https only,
  disable redirects or re-validate each hop
→ infra: IMDSv2 on AWS, egress firewall deny 169.254.169.254 for app subnets
```

## Learn more (free labs)

- PortSwigger Academy: [SSRF](https://portswigger.net/web-security/ssrf)
- Juice Shop: the "SSR" challenge and the redirect-allowlist challenge
