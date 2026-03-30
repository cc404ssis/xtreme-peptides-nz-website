# 🧠 SIE Core — Channel Guide

## Purpose
Sovereign Intelligence Engine (SIE) project headquarters. Core discussions, architecture decisions, research, and development for the personally-owned AI infrastructure project.

## What is SIE?
SIE = Sovereign Intelligence Engine  
A personally-owned intelligence engine — distinct from "open source" — emphasizing personal sovereignty and ownership over corporate-controlled AI paradigms.

**Related Components:**
- Studio404 (creative infrastructure)
- SSIS (Sovereign Systems)
- MSIS (Multi-agent Systems)
- UGENC-SSIS (Unified Generation + Sovereign Systems)

## How to Use This Channel
- **Architecture discussions** → Deep technical conversations
- **Research drops** → Papers, articles, findings relevant to SIE
- **Decision logs** → Important calls that need documentation
- **Code/design reviews** → Review SIE components
- **Link sharing** → Resources for SIE development

## What I Do With SIE Content
- Archive architecture decisions to 🧠 SYSTEM/DECISIONS.md
- Save research to 📚 KNOWLEDGE/ with SIE tags
- Extract code snippets to appropriate project folders
- Track decisions and their rationale
- Git commit + push everything

## Auto-Categorization

### Content Types
| Type | Detected By | Stored In |
|------|-------------|-----------|
| Architecture decision | "decide", "architecture", "design" | 🧠 SYSTEM/DECISIONS.md |
| Research paper | PDF links, arxiv, papers | 📚 KNOWLEDGE/research/ |
| Code snippet | Code blocks, GitHub links | 🔌 AGENTS/claude/sketches/ |
| Tool/resource | App links, API docs | 📥 LINKS/ai-tools/ |
| Competitor intel | "competitor", "alternative" | 📁 PROJECTS/active/sie-core/reference/ |

### SIE Keywords (Auto-tag)
- "sovereign", "sie", "ssis", "msis", "ugenc"
- "personal ai", "owned intelligence"
- "sovereignty", "self-hosted", "local ai"

## Format

### For Decisions
```yaml
---
tags: [sie, decision, architecture]
project: sie-core
decision_date: YYYY-MM-DD
status: proposed | accepted | rejected | superseded
source: discord/sie-core
added: YYYY-MM-DD HH:MM
by: [username]
---

# Decision: [Title]

## Context
[What led to this decision]

## Decision
[What we decided]

## Rationale
[Why this decision]

## Alternatives Considered
- [Option A]: [Why rejected]
- [Option B]: [Why rejected]

## Consequences
### Positive
- [Benefit 1]
- [Benefit 2]

### Negative / Risks
- [Risk 1]
- [Risk 2]

## Related
- Links: [relevant links]
- Depends on: [previous decisions]
- Supersedes: [older decisions]
```

### For Research
```yaml
---
tags: [sie, research, ai-architecture]
project: sie-core
source_type: paper | article | video | tool
relevance: high | medium | low
source: discord/sie-core
added: YYYY-MM-DD HH:MM
by: [username]
---

# [Title of Research/Resource]

**Source:** [URL or citation]
**Type:** [paper/article/tool]
**Relevance:** [high/medium/low]

## Summary
[Key findings in 2-3 sentences]

## Key Insights
- [Insight 1]
- [Insight 2]

## Applications to SIE
[How this applies to our project]

## Action Items
- [ ] Review in detail
- [ ] Discuss with team
- [ ] Implement / Integrate
- [ ] Archive for reference
```

## Storage Locations
```
trinity-brain/
├── 📁 PROJECTS/
│   └── active/
│       └── sie-core/                 # (create as needed)
│           ├── brief.md
│           ├── architecture/
│           ├── research/
│           └── reference/
├── 🧠 SYSTEM/
│   └── DECISIONS.md                  # All major decisions
├── 📚 KNOWLEDGE/
│   └── sie/                          # SIE-specific knowledge
└── 🔌 AGENTS/
    └── claude/
        └── sketches/                 # Code experiments
```

## Workflow (Automatic)
1. **Content dropped** → Detect type and relevance
2. **Analyze** → Extract decisions, research, code
3. **Route** → Appropriate location in vault
4. **Write** → Structured markdown
5. **Commit** → Auto-git-commit + push
6. **Cross-reference** → Link to related content

## Project Status Integration
Active SIE tasks tracked in:
- 🧠 SYSTEM/PRIORITIES.md (high-level)
- 📁 PROJECTS/active/sie-core/tasks.md (detailed)

## Examples
**Example 1: Architecture Decision**
> "Decision: We're going with ElizaOS for the agent framework instead of building custom. Rationale: Faster MVP, community support."
→ Extracted to DECISIONS.md with full context

**Example 2: Research Drop**
> "This paper on local LLM routing is relevant: https://arxiv.org/..."
→ Saved to KNOWLEDGE/research/ with summary

**Example 3: Code Snippet**
> "Here's the config pattern I'm thinking for the agent mesh: [code block]"
→ Saved to 🔌 AGENTS/claude/sketches/

---

**SIE HQ. Drop architecture thoughts, research, and decisions here. Everything gets structured and committed.**
