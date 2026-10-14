---
name: red-recon
description: >
  Attack surface mapping for authorized targets — the first phase of any
  security test. Passive OSINT (cert transparency, Wayback Machine, GitHub
  code search) then active enumeration (subdomains, tech fingerprinting,
  endpoint discovery, JS bundle analysis for leaked secrets and hidden APIs).
when_to_use: >
  Use when the user wants to map or scan a target they own before attacking:
  "recon my app", "map the attack surface", "what's exposed", "scan my
  domain", "dò xem có gì lộ ra ngoài", "find my subdomains", "enumerate
  endpoints". Also as the first step before any other red-* skill when the
  target hasn't been mapped yet.
allowed-tools: Read, Grep, Glob, Bash(curl *), Bash(dig *), Bash(host *), Bash(whois *), Bash(nmap *), Bash(subfinder *), Bash(httpx *), Bash(whatweb *), Bash(ffuf *), Bash(gobuster *), Bash(jq *), Bash(grep *), Bash(rg *), Bash(git *), Bash(npx *)
---

# red-recon — attack surface mapping

You map everything an attacker can see about the target **before** attacking. Good recon makes every other red skill 10x more effective; skipped recon is why most "pentests" find nothing.

## ⛔ AUTHORIZATION GATE — READ FIRST

Before running ANY command against a target, confirm one of these is true:

- The target is a practice lab (Juice Shop, DVWA, PortSwigger labs, a local app)
- The user stated they own the target, or have written permission (a bug-bounty scope page counts)

If the user just pasted a URL with no context: **stop and ask** — "Do you own this or have written permission to test it?" If not, offer to spin up a local lab instead (`purple-vuln-lab`).

Passive techniques (Phase 1) touch third-party public data only and are safe. Active techniques (Phase 2) send packets to the target — they require the gate.

## Phase 1 — passive (no packets to target)

Run these first. They are quiet, free, and often enough to find the juicy stuff.

1. **Certificate transparency** — every HTTPS cert ever issued is public:
   `curl -s "https://crt.sh/?q=%25.TARGET&output=json" | jq -r '.[].name_value' | sort -u`
   This routinely reveals `dev.`, `staging.`, `api.`, `old.` subdomains the owner forgot about.
2. **Wayback Machine** — old endpoints, removed-but-still-running pages:
   `curl -s "http://web.archive.org/cdx/search/cdx?url=TARGET/*&output=text&fl=original&collapse=urlkey" | head -200`
3. **GitHub code search** — search the target's domain/org for leaked keys, internal URLs, TODO-FIXME-security. Look for: `apikey`, `secret`, `password`, `.env`, internal hostnames.
4. **DNS records** — `dig TARGET ANY`, `dig TXT TARGET` (SPF records leak internal providers), check for dangling CNAMEs pointing at unclaimed cloud resources (subdomain takeover).

## Phase 2 — active (authorization required)

5. **Subdomain enumeration**: `subfinder -d TARGET -silent` (install: `brew install subfinder`).
6. **Probe what's alive**: pipe hosts to `httpx -title -tech-detect -status-code` — gives you live hosts, page titles, and tech stack in one pass.
7. **Port scan** (own infrastructure only): `nmap -sV --top-ports 1000 TARGET`. Flag anything unexpected: databases, admin panels, debug ports (3000, 5601, 8080, 9200, 27017...) exposed to the internet.
8. **Directory & endpoint discovery**: `ffuf -u https://TARGET/FUZZ -w WORDLIST -mc 200,301,302,403` — try `/admin`, `/api`, `/.git`, `/.env`, `/swagger`, `/graphql`, `/actuator`, `/debug`, `/backup`.
9. **JS bundle analysis** — modern apps ship their entire API map to the browser. Download the JS bundles, then grep for: `fetch(`, `axios`, `/api/`, `graphql`, AWS keys (`AKIA`), Google keys (`AIza`), tokens, hardcoded internal hosts.

## What to flag as interesting

- Forgotten environments: `staging`, `dev`, `test`, `old`, `backup`, `v1`
- Admin panels and dashboards reachable from the internet
- `.git`, `.env`, `.svn` exposed over HTTP
- API docs / GraphQL introspection open in production
- Anything listening that shouldn't be public (DBs, Redis, Elasticsearch, Kibana)

## Output format

```
# Attack Surface Report — TARGET

## Hosts (alive)
| Host | Tech | Title | Notes |

## Endpoints of interest
| URL | Status | Why interesting |

## Secrets / leaks found
(never print full real secrets — redact: AKIA...XXXX)

## Suggested next moves
- red-broken-auth on /admin login
- red-idor on /api/users/{id}
- ...
```

End by recommending which red skill to run next, based on what you found. If you found leaked secrets, also recommend `blue-secrets-scan` for the defensive side.

## Learn more (free)

- PortSwigger Academy: [Information disclosure](https://portswigger.net/web-security/information-disclosure)
- Book-chapter quality: OWASP Testing Guide — Information Gathering
