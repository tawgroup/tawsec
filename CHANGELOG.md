# tawsec

## 1.0.0

### Major Changes

- Initial release: 14 agent skills for learning and practicing web security, organized by vulnerability class.
  - 🔴 Red team (offense, authorized targets only): `red-recon`, `red-sqli`, `red-xss`, `red-broken-auth`, `red-idor`, `red-ssrf`
  - 🔵 Blue team (defense): `blue-code-review`, `blue-secrets-scan`, `blue-deps-audit`, `blue-headers-cors`, `blue-log-detection`, `blue-incident-response`
  - 🟣 Purple team (learning loop): `purple-vuln-lab`
  - 🧭 Router: `tawsec`
  - 8-week learning roadmap (EN + VN) in `docs/`, Vietnamese security glossary in `docs/vi/TU-DIEN.md`
  - Every red skill ships with a built-in authorization gate; see `SECURITY.md`
