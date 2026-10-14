# tawsec learning roadmap — 8 weeks from zero to testing your own app

> Vietnamese version: [docs/vi/LO-TRINH.md](vi/LO-TRINH.md)

**Goal:** after 8 weeks you can responsibly security-test your own web app — find the common classes, fix them, detect attempts, and know what to do when one lands.

**Time budget:** ~3-4 hours/week. One vuln class per week. The loop every week: read → attack in lab → fix → re-attack → log.

**Tools:** Docker, curl, your browser's devtools. Everything else installs along the way.

## Week 0 — Lab setup & first blood

- [ ] `purple-vuln-lab`: Docker + Juice Shop running, `LAB-LOG.md` created
- [ ] Solve one challenge by following your nose (hint: the scoreboard is hidden)
- [ ] Read: what red/blue/purple teams mean (the README of this repo)

## Week 1 — Recon & information disclosure

- [ ] `red-recon` against your own domain: crt.sh, Wayback, GitHub code search, JS bundle grep
- [ ] Juice Shop: find the scoreboard, find the `/ftp` folder
- [ ] PortSwigger: Information disclosure labs (apprentice)
- [ ] **Own-app check:** run `red-recon` on your real project. Anything exposed you forgot about?

## Week 2 — Hardening basics (blue week)

- [ ] `blue-headers-cors` against your app: headers, cookie flags, CORS, TLS
- [ ] `blue-secrets-scan` on your repos: gitleaks over full history
- [ ] Set up the gitleaks pre-commit hook + GitHub push protection
- [ ] Write your CSP in report-only mode

## Week 3 — Injection (SQL & NoSQL)

- [ ] PortSwigger SQLi labs 1-5 (error → UNION → blind)
- [ ] Juice Shop: login bypass, then the NoSQL coupon challenge
- [ ] `blue-code-review` your own repo with checklist #1 (injection sinks)
- [ ] Fix + re-attack anything found

## Week 4 — XSS

- [ ] PortSwigger XSS labs: reflected, stored, DOM (one each)
- [ ] Juice Shop: search-box XSS, stored XSS in reviews
- [ ] `blue-code-review` checklist: `innerHTML`/`dangerouslySetInnerHTML` sinks in your code
- [ ] Turn your CSP from report-only to enforced

## Week 5 — Authentication & sessions

- [ ] PortSwigger auth labs: enumeration, brute-force protection, password reset
- [ ] `red-broken-auth` against Juice Shop: crack the JWT secret, reset Jim's password
- [ ] Audit your own auth: error messages, rate limits, reset tokens, JWT verification
- [ ] `blue-log-detection`: make sure failed logins are logged; set one alert

## Week 6 — Access control / IDOR

- [ ] PortSwigger access control labs (all apprentice + practitioner)
- [ ] Juice Shop: view another user's basket, admin section via forced browsing
- [ ] `red-idor` on YOUR app with two test accounts — the most valuable exercise in this whole roadmap
- [ ] Fix with central authorization middleware, not scattered ifs

## Week 7 — SSRF & supply chain

- [ ] PortSwigger SSRF labs
- [ ] `blue-deps-audit` on your repos: CVEs, typosquat check, Dependabot config, CI gate
- [ ] Check your own features that fetch URLs (webhooks, image proxies)
- [ ] Egress: can your app servers reach 169.254.169.254? Should they?

## Week 8 — Graduation: full pass on your own app

- [ ] `red-recon` → pick 2 vuln classes → attack → `blue-code-review` → fix → re-attack
- [ ] `blue-log-detection`: read your logs from the week — find your own attacks in them
- [ ] Write a one-page report: findings, severity, fixes, residual risk
- [ ] Bookmark `blue-incident-response` — hopefully you never need it, now you have it

## After the roadmap

- PortSwigger Academy practitioner/expert labs per topic — free forever
- HackerOne CTF / HackTheBox starting points — still legal, still labs
- Read real bug-bounty writeups (HackerOne Hacktivity) and ask: "would MY app survive this?"
- When you're comfortable: pick a bug bounty program whose scope you like and read its policy twice before touching anything
