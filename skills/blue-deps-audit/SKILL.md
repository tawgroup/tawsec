---
name: blue-deps-audit
description: >
  Dependency and supply-chain security — audit npm/pip/go dependencies for
  known CVEs with native audit tools and osv-scanner, spot typosquatting and
  dependency-confusion risks, review lockfiles, and set up CI gating plus
  automated update bots (Dependabot/Renovate).
when_to_use: >
  Use when the user asks about vulnerable packages or supply chain:
  "npm audit", "dependency vulnerabilities", "CVE trong package", "audit
  dependencies", "quét thư viện", "is this package safe", "typosquat",
  "lockfile review", "supply chain attack", "set up dependabot".
allowed-tools: Read, Grep, Glob, Bash(npm *), Bash(pnpm *), Bash(yarn *), Bash(pip *), Bash(go *), Bash(osv-scanner *), Bash(jq *), Bash(cat *), Bash(ls *)
---

# blue-deps-audit — dependency & supply-chain security

Your app is 90% other people's code. You answer two questions: **"do my dependencies have known CVEs?"** and **"are my dependencies even what I think they are?"**

## Workflow

### 1. Known-CVE audit (the easy 80%)

```bash
npm audit --json | jq '.metadata.vulnerabilities'     # or pnpm audit / yarn audit
pip audit 2>/dev/null || pip-audit                    # python
govulncheck ./...                                     # go
osv-scanner -r .                                      # cross-ecosystem, lockfile-aware
```

Triage rules — not every "critical" is critical for YOU:

- Does the vulnerable code path get used? (CVE in a dev-only/test package ≠ CVE in your request handler)
- Is there a fix version? `npm audit fix` for safe bumps; breaking bumps get scheduled, not ignored
- No fix available? Check for workarounds in the advisory, consider replacing the package

### 2. Is this package legit? (typosquat / confusion check)

For anything recently added or obscure:

- **Name similarity**: `lodash` vs `lodahs` vs `lodash-utils` — one letter off is a classic attack
- **Stats sanity**: weekly downloads, last publish date, maintainer count. A brand-new package with 50 downloads inside a big app = investigate
- **Dependency confusion**: does the app use internal-looking package names (`@company-internal-x`) that ALSO exist on the public registry? Public one wins by default in some configs = attacker code in your build. Fix: scoped names + registry pinning.
- **Install scripts**: `rg -n '"preinstall"|"postinstall"' package.json` on dependencies that have them — install scripts run arbitrary code on every install

### 3. Lockfile hygiene

- Lockfile committed? (apps: yes always)
- `npm ci` (not `npm install`) in CI — respects the lockfile exactly
- Review lockfile diffs in PRs: a tiny code change with 400 lockfile lines changed = look closer

### 4. Make it continuous (the actual point)

One-time audits decay in a week. Set up:

- **Dependabot** (`.github/dependabot.yml`) or **Renovate** — auto-PRs for security updates
- **CI gate**: `npm audit --audit-level=high` failing the build (start with `high`, tighten later; failing on everything trains people to ignore it)
- Pin GitHub Actions to full SHAs, not `@v3` tags — actions are dependencies too

## Output format

```
# Dependency Audit — REPO

Ecosystem: npm (1,204 deps, 38 direct)  •  Lockfile: ✅ committed

## Known CVEs
| Package | Severity | CVE | Used in prod path? | Fix version | Action |

## Package trust
| Package | Concern | Verdict |

## Setup gaps
- [ ] Dependabot config missing
- [ ] CI not gating on audit
- [ ] Actions pinned to tags, not SHAs

## Recommended this week
(2-3 concrete actions, ordered)
```

## Language

Respond in the user's language; keep package names, CVE IDs and commands as-is.
