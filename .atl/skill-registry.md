# Skill Registry — greenbin-back

Generated: 2026-05-07

## User Skills

| Skill | Trigger Context |
|-------|----------------|
| branch-pr | When creating a pull request, opening a PR, or preparing changes for review |
| chained-pr | When a PR would exceed 400 changed lines; planning chained/stacked PRs |
| cognitive-doc-design | When writing guides, READMEs, RFCs, onboarding docs, architecture docs |
| comment-writer | When drafting PR feedback, review comments, maintainer replies, GitHub comments |
| issue-creation | When creating a GitHub issue, reporting a bug, or requesting a feature |
| judgment-day | When user says "judgment day", "dual review", "doble review", "juzgar", "que lo juzguen" |
| skill-creator | When user asks to create a new skill or document patterns for AI |
| work-unit-commits | When implementing a change, preparing commits, splitting PRs |

## Skill Paths

| Skill | Path |
|-------|------|
| branch-pr | ~/.claude/skills/branch-pr/SKILL.md |
| chained-pr | ~/.claude/skills/chained-pr/SKILL.md |
| cognitive-doc-design | ~/.claude/skills/cognitive-doc-design/SKILL.md |
| comment-writer | ~/.claude/skills/comment-writer/SKILL.md |
| issue-creation | ~/.claude/skills/issue-creation/SKILL.md |
| judgment-day | ~/.claude/skills/judgment-day/SKILL.md |
| skill-creator | ~/.claude/skills/skill-creator/SKILL.md |
| work-unit-commits | ~/.claude/skills/work-unit-commits/SKILL.md |

## Project Conventions

No project-level CLAUDE.md or AGENTS.md found. Global ~/.claude/CLAUDE.md applies.

## Compact Rules

### branch-pr
- Follow the issue-first enforcement system: every PR must reference a GitHub issue
- Use `gh pr create` with structured body (Summary, Test plan)
- PR title: under 70 characters, imperative mood

### work-unit-commits
- Commits are deliverable work units: tests and docs go beside the code they verify
- Never batch by file type (e.g., "all types", "all tests") — batch by feature/unit
- Use conventional commits format

### issue-creation
- Every significant change starts with a GitHub issue
- Use `gh issue create` with structured body

### judgment-day
- Launch two independent blind judge sub-agents simultaneously
- Synthesize findings, apply fixes, re-judge until both pass or escalate after 2 iterations
