# Security Policy

tawsec is a **security education** project. The red-team skills exist so you can
test **your own systems** and **legal practice labs** — nothing else.

## Rules of engagement (for users of these skills)

1. **Only test what you own or have explicit, written permission to test.**
   "Written" means a signed contract, a bug-bounty scope page, or an email from
   the owner — not "they probably wouldn't mind".
2. Bug bounty? Read the scope. Out-of-scope testing is unauthorized testing.
3. Found a real vulnerability on an authorized target? Prove it with the
   **minimum possible impact** (read-only proofs), then report it. Never
   exfiltrate real user data to "prove impact".
4. Found a vulnerability in someone else's product by accident? Follow
   **responsible disclosure**: report privately, give them time to fix, never
   publish details before a fix, never demand money.

Illegal use of these skills is entirely on you. The authors accept no liability.

## Reporting a vulnerability in THIS repo

If you find a security problem in the tawsec skills themselves (e.g. a skill
that instructs an agent to do something dangerous without confirmation):

- Open a **private** report via GitHub Security Advisories:
  https://github.com/tawgroup/tawsec/security/advisories/new
- Do NOT open a public issue for exploitable details.

We aim to respond within 7 days.

## What we will NOT accept in PRs

- Exploit code written for a specific real third-party target
- Stolen credentials, leaked data, or "live" targets as examples
- Skills that remove the authorization gate from red-team skills
