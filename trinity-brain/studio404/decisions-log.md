# Studio404 - Decisions Log

## Format
```
## YYYY-MM-DD - Decision Title
**Status:** [PROPOSED | APPROVED | REJECTED | DEPRECATED]
**Deciders:** [who made/approved this]
**Context:** [why this decision was needed]

**Decision:** [what was decided]

**Rationale:** [why this option was chosen]

**Alternatives Considered:**
- [Option A] - rejected because...
- [Option B] - rejected because...

**Consequences:**
- [Expected outcome]
- [Trade-offs made]
```

---

## 2026-03-28 - Trinity Brain Vault Structure
**Status:** APPROVED
**Deciders:** ud55578, Claude, Kimi
**Context:** Agents were losing context between sessions, no persistent memory for decisions and architecture

**Decision:** Create Obsidian-compatible vault at `/root/.openclaw/workspace/trinity-brain/` with structure:
```
trinity-brain/
├── claude/          → Claude's technical knowledge
├── dr-mana/         → Strategic/oracle insights
├── kimi/            → Operations and coordination
├── studio404/       → Project documentation
└── sessions/        → Daily session notes
```

**Rationale:**
- Each agent needs their own space for domain knowledge
- Shared spaces (studio404) for cross-cutting concerns
- Session logs for audit trail
- Obsidian format allows human editing via Git

**Consequences:**
- Agents must check vault at session start
- Decisions must be logged immediately
- Git becomes source of truth for memory

---

*(Additional decisions to be logged here as they occur)*
