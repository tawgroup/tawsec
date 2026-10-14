---
name: blue-secrets-scan
description: >
  Secret hygiene for repos — scan working tree AND git history with gitleaks
  or trufflehog, triage real vs false-positive hits, run the rotation
  playbook when a live secret leaks (rotate first, purge history second),
  and set up pre-commit hooks and CI scanning so it never happens again.
when_to_use: >
  Use when the user mentions leaked or committed secrets: "lộ API key",
  "commit nhầm .env", "secret in repo", "quét secret", "gitleaks",
  "pushed my AWS key to GitHub", "API key lộ trên GitHub", "rotate key",
  "check repo for secrets". Also as a pre-commit/pre-push hygiene step.
allowed-tools: Read, Grep, Glob, Bash(gitleaks *), Bash(trufflehog *), Bash(git *), Bash(rg *), Bash(grep *), Bash(ls *), Bash(brew *)
---

# blue-secrets-scan — secret hygiene

Leaked secrets are the most common way side projects and startups actually get breached — not zero-days, just a key in a public repo and a bot that finds it in 30 seconds. Your job: find them, rotate them, keep them out forever.

## Workflow

### 1. Scan the working tree AND the history

A deleted secret is still in git history — scanning only the current tree misses the point.

```bash
# install once: brew install gitleaks
gitleaks detect --source . --verbose --redact
# deeper, includes verified-live checks for some providers:
trufflehog git file://. --only-verified
```

Always `--redact` in output: never print full secrets into chat/logs.

### 2. Triage each hit

| Signal | Meaning |
|---|---|
| High-entropy string matching a known pattern (AKIA..., sk-..., ghp_...) | Almost certainly real |
| `example`, `dummy`, `test`, `changeme`, `.env.example` | Likely false positive — but check |
| Found only in old commits | Still live until rotated! |
| `trufflehog --only-verified` hit | Confirmed LIVE credential — drop everything |

### 3. The rotation playbook (when a real secret leaked)

Drill this order — most people get it backwards:

1. **ROTATE/REVOKE FIRST.** Purging git history does nothing while the key still works. Assume any secret that touched a public repo (even for 1 minute, even in a private repo that was ever public, even to "just one collaborator") is compromised. Revoke at the provider: AWS IAM, GitHub tokens, OpenAI, Stripe...
2. **Check for abuse**: provider logs (AWS CloudTrail, GitHub audit log) for usage of that key around the exposure window.
3. **Then** purge history: `git filter-repo --invert-paths --path .env` or BFG, force-push, and understand forks/clones still have it (another reason rotation is the real fix).
4. Replace with env var / secret manager; add `.env` to `.gitignore`.

### 4. Prevention so it never recurs

- **Pre-commit hook**: `gitleaks protect --staged` via pre-commit framework — blocks the commit before the secret enters history
- **CI scan**: gitleaks action on every PR
- **GitHub push protection**: enable in repo settings (free, catches known patterns at push time)
- **`.env.example` pattern**: commit the template with empty values, never the real `.env`
- Long-term: secrets manager (Doppler, Vault, AWS SM, 1Password CLI) instead of files

## Output format

```
# Secret Scan — REPO

Scanned: working tree + full history (N commits)
Findings: N confirmed / M likely-false-positive

## Confirmed (redacted)
| Secret (redacted) | Provider | Location | In history? | Status |

## 🚨 Rotation checklist
- [ ] Revoke <secret> at <provider>   ← DO THIS FIRST
- [ ] Check provider logs for abuse
- [ ] Purge from git history
- [ ] Add to .gitignore / move to secret manager
- [ ] Add gitleaks pre-commit hook

## False positives (and why)
```

## Cross-links

Attackers find these keys with `red-recon` Phase 1 (GitHub code search + JS bundle grep) — worth telling the user that's literally how the bots work, just at internet scale.

## Language

Respond in the user's language; keep tool names, commands and redacted patterns as-is.
