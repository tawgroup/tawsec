---
name: blue-incident-response
description: >
  Incident response runbook for small teams — what to do when you suspect a
  breach: verify and contain (isolate, rotate credentials, snapshot before
  wiping), eradicate, recover, communicate, and run the postmortem. Calm,
  ordered, copy-pasteable steps for the worst day.
when_to_use: >
  Use when the user suspects or confirms a security incident: "bị hack rồi",
  "we got breached", "someone is in my server", "data leaked", "AWS key
  abused", "hack rồi giờ sao", "incident response", "my site is defaced",
  "strange processes on my server", "I think my DB was dumped". This skill
  skips the usual triage questions — during an incident, go straight to work.
allowed-tools: Read, Grep, Glob, Bash(last *), Bash(ps *), Bash(netstat *), Bash(lsof *), Bash(grep *), Bash(rg *), Bash(tail *), Bash(history *), Bash(ls *)
---

# blue-incident-response — "we got popped" runbook

No authorization gate, no triage interview. If the user says there's an incident, start working. Be the calm person in the room: ordered steps, nothing skipped, nothing panicky.

## Phase 0 — Ground rules (say these first)

1. **Don't wipe anything yet.** Your instinct says "reinstall now". Wrong — you need evidence first: how they got in, what they touched. A wiped box teaches you nothing and they re-enter through the same hole.
2. **Don't tip off the attacker** (don't post publicly, don't poke around loudly from the compromised account).
3. **Write down everything you do, with timestamps.** Future-you needs this timeline.
4. One person drives. If others are helping, they're hands, not drivers.

## Phase 1 — Verify & triage (15 min)

Is it real? Quick checks:

```bash
last -20                          # weird logins?
history | tail -50                # commands you don't recognize?
ps aux | grep -vE '^\S+ +(1|2) '  # odd processes (miners love showing up here)
lsof -i -P | grep ESTABLISHED     # unexpected outbound connections?
```

Cloud key abused? Check provider logs (CloudTrail / GitHub audit log / Stripe logs) for what the key did. **Classify**: leaked key / compromised server / compromised account / data breach — each has a different blast radius.

## Phase 2 — Contain (do fast, in order)

1. **Rotate credentials FIRST** — all of them, from a clean machine: cloud keys, DB passwords, JWT secrets, API tokens, session secrets (this kicks out everyone logged in — good). Priority: whatever was exposed.
2. **Isolate**: security group / firewall the box to allow only your IP, or take the app into maintenance mode. Don't power off (memory evidence) — network-isolate instead.
3. **Snapshot**: disk snapshot / `tar` the relevant dirs + dump logs somewhere safe BEFORE cleaning. `tar czf evidence-$(date +%s).tgz /var/log /etc /home 2>/dev/null`
4. **Block the bleeding**: disable the compromised account, revoke the leaked key (after capturing what it did), pull the malicious webhook/cron job you found.

## Phase 3 — Eradicate

- Find the entry point: web shell in uploads? vulnerable dependency? leaked key from `blue-secrets-scan` territory? If you can't find how they got in, assume they'll be back — rebuild from a known-good image/backup rather than cleaning.
- Patch the hole. Verify with the matching red skill (e.g. re-run `red-sqli` against the fixed endpoint).
- Check persistence: crontab (`crontab -l`, `/etc/cron*`), systemd units, SSH `authorized_keys` (all users), new user accounts, modified startup scripts.

## Phase 4 — Recover

- Restore from known-good backup/snapshot; redeploy from clean source
- Force password reset for affected users; invalidate all sessions (rotate session secret — again)
- Watch logs hard for 48-72h (this is where `blue-log-detection` pays rent): the attacker often returns through a second door
- If user data leaked: figure out WHO and WHAT, check your legal obligations (GDPR 72h, local law), prepare notification

## Phase 5 — Communicate

- **Internal**: what happened, what's done, what's next, ETA. Short and honest.
- **Users** (if data affected): what data, what you're doing, what they should do (reset password). No blame-shifting, no "sophisticated attack" cliché — say what happened.
- Template skeleton: *"On [date] we discovered [what]. [Data] was affected. We have [actions taken]. We recommend you [action]. We are sorry."*

## Phase 6 — Postmortem (within a week, blameless)

Timeline → root cause (the REAL one: not "dev committed a key" but "no pre-commit scanner + no secret manager") → 3-5 preventive actions, each with an owner → feed them into the blue skills: `blue-secrets-scan` hooks, `blue-deps-audit` CI gate, `blue-log-detection` alerts.

## Output

Keep a running `INCIDENT.md`: timeline, evidence locations, decisions, action items. Offer to generate the user-facing notification and the postmortem doc when the fire is out.

## Language

Respond in the user's language. During an active incident: short messages, one phase at a time, confirm each step done before moving on.
