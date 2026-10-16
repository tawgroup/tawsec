# tawsec

## 1.0.1

### Patch Changes

- Feed real-field findings back into the suite (from an authorized passive check of a live WordPress site) plus the `rg` fallback promised during the first agribeacon audit:

  - **red-broken-auth**: new section on WordPress XML-RPC `system.multicall` brute-force amplification — one HTTP request carrying N auth attempts (5 proved live, 200–500 realistic), plus `wp-json/wp/v2/users` username-listing check.
  - **blue-headers-cors**: click-local clickjacking PoC (transparent iframe under a decoy button) to prove a missing `X-Frame-Options`/`frame-ancestors` to stakeholders.
  - **9 skills**: added a one-line fallback note — when `rg` is missing, use `grep -rn` instead of stalling to install tools (gap found the hard way when `blue-secrets-scan` declared `rg` as an allowed tool on a box without it).
  - **tawsec router**: route "WordPress login/xmlrpc" questions to `red-broken-auth`.

## 1.0.0

### Major Changes

- Initial release: 14 agent skills for learning and practicing web security, organized by vulnerability class.
  - 🔴 Red team (offense, authorized targets only): `red-recon`, `red-sqli`, `red-xss`, `red-broken-auth`, `red-idor`, `red-ssrf`
  - 🔵 Blue team (defense): `blue-code-review`, `blue-secrets-scan`, `blue-deps-audit`, `blue-headers-cors`, `blue-log-detection`, `blue-incident-response`
  - 🟣 Purple team (learning loop): `purple-vuln-lab`
  - 🧭 Router: `tawsec`
  - 8-week learning roadmap (EN + VN) in `docs/`, Vietnamese security glossary in `docs/vi/TU-DIEN.md`
  - Every red skill ships with a built-in authorization gate; see `SECURITY.md`
