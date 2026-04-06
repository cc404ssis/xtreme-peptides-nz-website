# 5 Levels of Claude Code — Framework by Mattman

**Source:** https://resources.leadgenman.com/5lvls  
**Author:** Mattman (@leadgenman)  
**Category:** Claude Code Mastery / Skill Development  
**Extracted:** 2025-01-XX

---

## The Framework

A progressive maturity model for using Claude Code, from simple one-off prompts to fully autonomous agent teams.

### Level 1: Prompt (1x)
**What it is:** Give Claude a one-off task. It asks clarifying questions and delivers exactly what you asked for.

**Characteristics:**
- Single-turn interaction
- Requires context setting each time
- Output depends on prompt quality

**When to use:**
- One-off tasks
- Exploring new workflows
- Quick research questions
- Ad-hoc analysis

**Example tasks:**
- "Write a Python script to scrape this website"
- "Explain this error message"
- "Draft an email to this client"

---

### Level 2: Skill (5x)
**What it is:** Define a reusable workflow in SKILL.md file. Claude executes the same way every time.

**Characteristics:**
- Documented standard operating procedure
- Consistent output regardless of who's using it
- Reduces prompting time to near-zero

**When to use:**
- Repetitive tasks
- Team consistency needs
- Workflows you do 3+ times
- Quality standardization

**Example Skills:**
- Content formatting templates
- Data processing pipelines
- Review checklists
- Standard report generation

---

### Level 3: Skill Chain (10x)
**What it is:** Multiple Skills run in sequence. Output of one becomes input of next.

**Characteristics:**
- Multi-step processes
- Chained dependencies
- Complex workflow automation

**When to use:**
- Multi-step processes
- Content pipelines (research → draft → edit → publish)
- Complex workflows
- Handoff between different task types

**Example Chains:**
- Research → Outline → Draft → Edit → Publish
- Data extraction → Cleaning → Analysis → Visualization
- Client intake → Research → Proposal → Contract

---

### Level 4: Agent (20x)
**What it is:** Claude runs autonomously in the background on large datasets. It handles errors, retries, and picks up where it left off.

**Characteristics:**
- Long-running operations
- Error handling and recovery
- Batch processing capability

**When to use:**
- Large datasets
- Long-running operations
- Background processing
- Error-prone tasks needing monitoring

**Example Agents:**
- Background content monitoring
- Large-scale data processing
- Continuous quality checking
- Automated reporting

---

### Level 5: Agent Team (50x+)
**What it is:** Multiple Agents work in parallel, each handling a different part of the operation. Coordinated multi-agent system.

**Characteristics:**
- Parallel processing
- Coordinated operations
- True autonomous operation

**When to use:**
- Real-time monitoring alongside main work
- Scale operations
- Parallel processing needs
- Complex multi-domain tasks

**Example Teams:**
- Content research agent + Writer agent + Editor agent + Publisher agent
- Sales monitoring + Support triage + Operations coordination
- Multi-platform content distribution

---

## Quick Reference Table

| Level | Name | Multiplier | Best For |
|-------|------|------------|----------|
| 1 | Prompt | 1x | One-off tasks, exploration |
| 2 | Skill | 5x | Repetitive tasks, consistency |
| 3 | Skill Chain | 10x | Multi-step processes |
| 4 | Agent | 20x | Large datasets, background ops |
| 5 | Agent Team | 50x+ | Scale, real-time, complex systems |

---

## SIE/NII Application

### Content Creation Pipeline
```
Level 1: "Write a script about X" (one-off)
Level 2: Script-writing SKILL.md (consistent format)
Level 3: Research → Script → Review chain
Level 4: Background agent monitoring trends → auto-generating scripts
Level 5: Multi-agent team: Researcher + Writer + Editor + Thumbnail Designer
```

### UGENC-SSIS Development
```
Level 1: "Help me debug this code" (ad-hoc)
Level 2: Code review SKILL.md (standardized checks)
Level 3: Test → Review → Deploy chain
Level 4: Background agent monitoring codebase
Level 5: Multi-agent team: Security + Performance + Testing + Deployment
```

---

## Key Principles

1. **Progressive advancement:** Master Level 1 before Level 2, etc.
2. **Documentation is the bridge:** SKILL.md files unlock higher levels
3. **Error handling scales:** Higher levels require robust failure recovery
4. **Coordination complexity:** Team level requires clear agent boundaries

---

## Next Steps

**Getting Started:**
1. Start at Level 1 — document what works
2. Build Level 2 Skills for repeated workflows
3. Chain Skills when you see sequential patterns
4. Promote to Agent when tasks run long/need monitoring
5. Scale to Team when parallelization creates value

---

*Source: Lead Gen Man (leadgenman.com)*
