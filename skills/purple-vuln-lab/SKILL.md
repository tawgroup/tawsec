---
name: purple-vuln-lab
description: >
  The learning loop — set up a local deliberately-vulnerable app (OWASP Juice
  Shop, DVWA, or PortSwigger labs), then climb the difficulty ladder per
  vulnerability class: read the mental model, attack it with the matching
  red-* skill, fix it with the matching blue-* skill, re-attack to verify the
  fix. Tracks progress in a local lab log.
when_to_use: >
  Use whenever the user wants to LEARN or practice security hands-on: "học
  bảo mật", "teach me security", "dựng lab", "set up a hacking lab",
  "practice pentest", "luyện hack", "I want to learn pentesting", "start the
  security curriculum", "tuần này học gì", "lab tiếp theo". This is the
  default entry point for beginners — route here when intent is learning
  rather than testing a real app.
allowed-tools: Read, Write, Grep, Glob, Bash(docker *), Bash(curl *), Bash(ls *), Bash(cat *), Bash(brew *)
---

# purple-vuln-lab — the security learning loop

Red skills teach attack, blue skills teach defense, and this skill makes the two into a habit. The loop is the lesson: **read → attack → fix → re-attack**. You are the study buddy and lab assistant.

## The one rule that still applies

Labs only. The whole point of the lab is that everything here is legal because it's your own deliberately-broken app. If the user drifts toward a real target, the red skills' authorization gate applies.

## Setup (first run)

1. Check Docker: `docker --version`. Missing → point to Docker Desktop install (mac: `brew install --cask docker`).
2. Start OWASP Juice Shop (recommended default — modern Node/Angular stack, 100+ challenges, scoreboard):

```bash
docker run -d --name juice-shop -p 3000:3000 bkimminich/juice-shop
# verify
curl -s http://localhost:3000 | head -5
```

3. Alternatives if the user asks:
   - **DVWA** (`docker run -d -p 8080:80 vulnerables/web-dvwa`) — old-school PHP, great for SQLi basics
   - **PortSwigger Web Security Academy** — no install, free hosted labs, the best per-topic depth; use alongside local labs
4. Create the lab log `LAB-LOG.md` in the current directory if it doesn't exist:

```markdown
# Lab Log

| Date | Vuln class | Lab/challenge | Attacked with | Result | Fixed? | Re-attack verified? |
|---|---|---|---|---|---|---|
```

If a log exists, read it and resume where they left off.

## The loop (per vulnerability class)

Guide ONE class at a time. Don't dump the whole curriculum.

### Step 1 — Read (10 min)

Explain the mental model in the user's language, 5 sentences max, then point at ONE PortSwigger Academy topic page to read. Resist over-explaining — the lab teaches better than you do.

### Step 2 — Attack (the fun part)

Invoke the matching red skill against `http://localhost:3000`:

| Class | Red skill | Juice Shop starting challenge |
|---|---|---|
| Recon | `red-recon` | Find the scoreboard page (it's hidden) |
| SQLi | `red-sqli` | Login as admin: `' OR 1=1-- -` on the login form |
| XSS | `red-xss` | Reflected XSS in search; then stored XSS in a review |
| Broken auth | `red-broken-auth` | Reset Jim's password via the security question; crack the weak JWT secret |
| IDOR | `red-idor` | View another user's basket: change the basket id |
| SSRF | `red-ssrf` | (Juice Shop is thin on SSRF — use PortSwigger's SSRF labs instead) |

Celebrate solved challenges. The Juice Shop scoreboard (`/#/score-board`) gives a dopamine hit — use it.

### Step 3 — Fix (the part nobody does, so it's the differentiator)

Attacking a lab is easy mode; fixing one is where understanding lands. Two ways:

- **On a copy of the vulnerable code**: Juice Shop is open source — `git clone` it, find the vulnerable line (the blue-code-review checklists find it fast), fix it
- **On the user's own project**: "does YOUR app have this class of bug?" — run the matching blue skill on their real codebase. This is the bridge from lab to real life.

### Step 4 — Re-attack to verify

Re-run the exact attack from Step 2 against the fixed code. It must fail. A fix that isn't re-tested is a hope, not a fix.

### Step 5 — Log it

Append to `LAB-LOG.md`, including one sentence in the user's own words: *"the bug existed because ___"*. If they can't write that sentence, they're not done — go back to Step 1.

## Difficulty ladder

Keep momentum by always naming the next rung:

1. **Guided** (weeks 1-2): you walk each step with them, full hints
2. **Semi-guided** (weeks 3-5): you name the challenge, they attack alone; hints on request
3. **Solo + review** (weeks 6+): they attack, write the report, you review the report like a senior would — was the proof minimal? severity honest? fix verified?
4. **Graduation**: run the full loop against their own side project, end to end

## Session flow

- Start of session: read `LAB-LOG.md`, suggest the next rung
- End of session: update the log, name the next rung in one line ("next: stored XSS in reviews")
- Stuck >20 min: give a hint, not the answer. Hints escalate: nudge → direction → the PortSwigger lab solution page. Never straight to the payload.

## Language

Respond in the user's language. Vietnamese learners: keep technical terms in English (payload, sink, token) — they're the vocabulary of every tutorial and job interview — but explain in Vietnamese. `docs/vi/TU-DIEN.md` in this repo is the glossary.
