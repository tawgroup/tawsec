# Contributing to tawsec

Skills are plain markdown. Adding one is a single `SKILL.md` file — no code changes.

## Naming convention

| Prefix | Team | Purpose |
|---|---|---|
| `red-*` | Offense | Test for one vulnerability class on **authorized** targets |
| `blue-*` | Defense | Detect, prevent or respond to a class of problems |
| `purple-*` | Learning | Guided practice loops combining red + blue |
| (none) | Router | `tawsec` is the only router skill |

One skill = one vulnerability class or one defensive job. Resist the urge to
make a "red-everything" mega-skill.

## SKILL.md rules

1. **Frontmatter** follows the vibesec format: `name`, `description`,
   `when_to_use`, `allowed-tools`. Write `description` + `when_to_use` in
   third person with concrete trigger phrases (English + Vietnamese welcome).
2. **Every red skill starts with the authorization gate.** Copy it verbatim
   from an existing red skill. This is not optional — PRs removing it are rejected.
3. **Manual before automated.** Teach the user to do it by hand (curl, browser
   devtools) before reaching for sqlmap/nuclei. This repo is for learning.
4. **Every finding points to evidence.** A request/response pair, a file and
   line, a log excerpt. No LLM-vibes findings.
5. **Cross-link the mirror skill.** Red skills link their blue counterpart
   ("how to fix") and vice versa ("how attackers find this").
6. Keep it under ~150 lines. Long reference material goes in a `references/`
   subfolder inside the skill.

## Local test

```bash
git clone https://github.com/tawgroup/tawsec
mkdir -p ~/.claude/skills
for s in tawsec red-* blue-* purple-*; do
  ln -sfn "$PWD/skills/$s" ~/.claude/skills/$s
done
```

Restart your agent, then type something the skill should trigger on.

## Learning notes

Vietnamese learning notes live in `docs/vi/`. If you add a skill, add a short
entry there too — the point of this repo is that the maintainer is learning
security while building it.
