# tawsec

**🇬🇧 English** • [🇻🇳 Tiếng Việt](README.vi.md)

> Learn web security by doing: red-team skills that attack, blue-team skills that defend, and a purple lab that turns both into a study habit — organized by vulnerability class.

This repo is a set of [agent skills](https://github.com/tawgroup/vibesec#install) (Claude Code, Codex, Cursor, OpenCode…) built by someone **learning security while building the skills**. Each vulnerability class gets a pair of skills: one that shows you how attackers find it, one that shows you how defenders kill it.

```
You: "test my login form with red-broken-auth"
Agent: [checks authorization] → [attacks it manually with curl] → report

You: "ok now fix it"
Agent: [blue-code-review] → patches → re-runs the attack to verify
```

## The three teams

| Team | Color | What it means here |
|---|---|---|
| 🔴 **Red** | Offense | Skills that probe for one vulnerability class each: recon, SQLi, XSS, broken auth, IDOR, SSRF. |
| 🔵 **Blue** | Defense | Skills that review code, scan secrets, audit dependencies, harden headers, read logs, and handle incidents. |
| 🟣 **Purple** | Learning | The lab loop: attack a practice app with a red skill, fix it with a blue skill, re-attack to verify. This is where the learning happens. |

## ⛔ Before anything else

**Red skills are only for systems you own or have explicit written permission to test** — and for practice labs ([Juice Shop](https://owasp.org/www-project-juice-shop/), [DVWA](https://github.com/digininja/DVWA), [PortSwigger Web Security Academy](https://portswigger.net/web-security) — free and excellent). Every red skill has an authorization gate built in and will ask before touching a live target. See [SECURITY.md](SECURITY.md).

## Install

### Option 1: `npx skills` (recommended)

```bash
npx skills add tawgroup/tawsec
```

### Option 2: Claude Code plugin marketplace

```
/plugin marketplace add tawgroup/tawsec
/plugin install tawsec
```

### Option 3: Manual

```bash
git clone https://github.com/tawgroup/tawsec
mkdir -p ~/.claude/skills
for s in skills/*/; do ln -sfn "$PWD/$s" ~/.claude/skills/$(basename $s); done
```

Restart your agent. Then try: *"set up a security lab for me"*.

## The roster

### 🔴 Red team — find it before the bad guys do

| Skill | Vulnerability class | You'll learn to |
|---|---|---|
| `red-recon` | Attack surface | Map subdomains, tech stack, hidden endpoints, leaked JS secrets |
| `red-sqli` | SQL / NoSQL injection | Probe parameters by hand, then let sqlmap confirm |
| `red-xss` | Cross-site scripting | Find reflected/stored/DOM sinks, build context-aware payloads |
| `red-broken-auth` | Authentication | Enumerate users, abuse password reset, attack JWTs, test rate limits |
| `red-idor` | Broken access control | Flip object IDs, escalate horizontally and vertically |
| `red-ssrf` | Server-side request forgery | Abuse URL fetchers to reach cloud metadata and internal services |

### 🔵 Blue team — make it not exploitable

| Skill | Job | You'll learn to |
|---|---|---|
| `blue-code-review` | Secure code review | Grep for injection sinks, missing auth checks, mass assignment |
| `blue-secrets-scan` | Secret hygiene | Scan repos with gitleaks, rotate leaked keys, pre-commit hooks |
| `blue-deps-audit` | Supply chain | Audit dependencies, spot typosquats, gate CI on known CVEs |
| `blue-headers-cors` | Web hardening | CSP, HSTS, cookie flags, CORS audit, TLS check |
| `blue-log-detection` | Detection | Recognize attacks in logs, write alerts, tune fail2ban |
| `blue-incident-response` | Response | The "we got popped" runbook: contain → eradicate → recover |

### 🟣 Purple team — the study loop

| Skill | What it does |
|---|---|
| `purple-vuln-lab` | Spins up a local vulnerable app, walks you up the difficulty ladder: read → attack → fix → re-attack. Tracks your progress in a lab log. |

### 🧭 Router

| Skill | What it does |
|---|---|
| `tawsec` | Entry point. Describe what you want ("hack my staging", "harden this repo", "teach me security") and it routes you to the right skill. |

## The learning path

The skills double as a curriculum. **[docs/ROADMAP.md](docs/ROADMAP.md)** lays out an 8-week path from "never pentested anything" to "can responsibly test my own app", mapping each week to skills and free labs. Vietnamese notes live in **[docs/vi/](docs/vi/)**.

## What this is NOT

- Not a replacement for a professional pentest
- Not a collection of zero-days or weaponized exploits
- Not permission to test systems you don't own

The goal: **understand each vulnerability class well enough to find it, exploit it in a lab, fix it in code, and detect it in logs.** That loop is the whole game.

## Related

- [vibesec](https://github.com/tawgroup/vibesec) — pre-deploy security audit for vibe-coded apps (pairs well with `blue-code-review`)

## License

MIT. Fork it, learn from it, teach with it.
