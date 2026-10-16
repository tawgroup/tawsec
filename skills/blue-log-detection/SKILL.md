---
name: blue-log-detection
description: >
  Detection engineering for small teams — recognize attack patterns in web
  server and app logs (SQLi probes, XSS attempts, brute force, IDOR scraping,
  scanner traffic, path traversal), decide what security events to log,
  write simple alert rules, and wire basic active response (fail2ban, rate
  limiting).
when_to_use: >
  Use when the user asks how to know they're being attacked: "làm sao biết
  bị tấn công", "đọc log bảo mật", "detect attacks in logs", "suspicious
  traffic", "có ai đang scan tôi không", "set up alerts", "fail2ban",
  "someone is hammering my login", "analyze my nginx logs".
allowed-tools: Read, Grep, Glob, Bash(grep *), Bash(rg *), Bash(awk *), Bash(sort *), Bash(uniq *), Bash(tail *), Bash(head *), Bash(jq *), Bash(zcat *), Bash(cat *)
---

# blue-log-detection — detection from logs

Prevention fails. Detection is how you find out. You teach the user what attacks *look like* in logs, and turn "we have logs somewhere" into "we'd notice an attack within a day".

> No `rg` on the box? Every search below works with `grep -rn` — don't stall the analysis installing tools.

## The two jobs

1. **Read**: given existing logs, find the attacks already in them
2. **Instrument**: make sure the events that matter will be logged when it counts

## Job 1 — recognize attacks in existing logs

Grab web access logs (nginx/apache), app logs, auth logs. Then hunt:

| Attack | Log signature | Command sketch |
|---|---|---|
| SQLi probes | `'`, `UNION`, `SLEEP(`, `OR 1=1` in URLs (URL-encoded: `%27`, `%20`) | `grep -iE "(%27|'|%20union%20|sleep\()" access.log` |
| XSS probes | `<script>`, `onerror=`, `javascript:` in request lines | `grep -iE "(%3Cscript|<script|onerror)" access.log` |
| Path traversal | `../`, `..%2f`, `/etc/passwd` | `grep -E "(\.\./|%2e%2e|etc/passwd)" access.log` |
| Brute force | many 401/403 on `/login` from one IP | `awk '$9 ~ /40[13]/ {print $1}' access.log \| sort \| uniq -c \| sort -rn \| head` |
| IDOR scraping | one IP walking sequential IDs (`/users/1`, `/users/2`...) | group by IP+path pattern, count distinct IDs |
| Scanner traffic | UA: sqlmap, nikto, nuclei, masscan; weird paths `/.git`, `/.env`, `/wp-admin` on non-WordPress | `grep -iE "sqlmap|nikto|nuclei|masscan" access.log` |
| Shell access attempts | `cmd=`, `/bin/sh`, `wget http`, `curl http` in URLs | `grep -E "(cmd=|/bin/(ba)?sh|wget%20http)" access.log` |

Found real attack traffic? That's normal — the internet scans everyone, always. The skill is separating background noise from a *targeted, working* attack: same IP, escalating, getting 200s.

## Job 2 — instrument what matters

Most apps log requests but not *security events*. Make sure these are logged with user id + IP + timestamp:

- Login success **and failure** (and which username was tried)
- Password reset requested / completed
- Permission/role changes
- Authorization **denials** (403s with the object ID that was denied — this is how you catch `red-idor` scraping)
- API key creation, webhook config changes
- Payment/payout operations

Format: structured JSON if possible (`{"event":"login_failed","user":"...","ip":"..."}`) — grep-able today, SIEM-ready tomorrow.

## Alerting — start stupid-simple

- **Threshold alerts**: >10 failed logins per IP per 5 min; any login to a dormant admin account; any new API key created
- **Where**: a cron + grep + webhook to Discord/Slack beats no alerting by infinity. Graduate to a real stack (Loki, Datadog, whatever) later.
- **Canary tokens**: a fake AWS key in the repo / a hidden URL nobody should hit — if it fires, you have a visitor. (free: canarytokens.org)

## Active response

- `fail2ban` for SSH/login endpoints: N failures → temporary IP ban
- Rate limiting at the edge (nginx `limit_req`, Cloudflare rules)
- Block list for scanner UAs you don't care about — but remember UA blocking is cosmetics, not security

## Output format

```
# Log Detection Report — TARGET

Logs analyzed: nginx access (30 days), app auth log

## Attack traffic found
| Pattern | Hits | Top source IPs | Any success (2xx)? | Verdict (noise/targeted) |

## Instrumentation gaps
- [ ] auth denials not logged
- [ ] no user id in request logs
- ...

## Alerts to set up now
1. ...
```

## Cross-links

Every pattern here corresponds to a red skill (`red-sqli` probes → SQLi signature, `red-broken-auth` brute force → 401 bursts). Reading your own logs after running red skills against your own staging is the single best detection training there is.

## Language

Respond in the user's language; keep log excerpts and commands as-is.
