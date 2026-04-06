# ✅ Action Items — Channel Guide

## Purpose
Quick task capture and action item tracking. Drop tasks here for immediate triage, assignment, and tracking across the Trinity system.

## How to Use This Channel
Just drop tasks naturally:
- "@Kimi Remind me to review the NII script tomorrow"
- "Task: Fix the broken link on the landing page"
- "Action item: Schedule meeting with the design team"

## What I Do With Action Items
- Extract the task and context
- Assign to appropriate agent or project
- Set priority and deadline if specified
- Create tracking entry in project files
- Git commit + push

## Auto-Processing

### Task Detection
I recognize action items from:
- Explicit keywords: "task:", "action item:", "todo:", "remind me"
- @mentions with actionable requests
- Voice memo transcriptions with task language

### Assignment Rules
| Task Type | Assigned To | Location |
|-----------|-------------|----------|
| Code/Technical | kimi-claw | Project tasks.md |
| Strategy/Architecture | claude | Project brief.md |
| Health/Wellness | dr-mana | Personal wellness/ |
| Urgent/Time-sensitive | Immediate ping | Channel notification |

### Priority Detection
- **🔴 Urgent:** "ASAP", "urgent", "now", "broken", "down"
- **🟡 Normal:** Default priority
- **🟢 Low:** "when you have time", "someday", "eventually"

### Deadline Detection
- "by tomorrow" → +1 day
- "by Friday" → Next Friday
- "in 3 days" → +3 days
- Specific dates → Parsed and tracked

## Format
```yaml
---
tags: [action-item, auto-extracted]
project: [detected-project]
assigned_to: [agent-or-person]
priority: 🔴 Urgent / 🟡 Normal / 🟢 Low
deadline: YYYY-MM-DD
source: discord/action-items
added: YYYY-MM-DD HH:MM
by: [username]
---

# Action Item: [Brief title]

## Task
[Full task description]

## Context
[Where this came from, why it matters]

## Acceptance Criteria
- [ ] Specific outcome 1
- [ ] Specific outcome 2

## Related
- Project: [[📁 PROJECTS/active/[project]/brief]]
- Linked from: [source message/thread]

## Status Log
- 🟡 [date] Created → [assigned_to]
- 🟡 [date] In progress
- ✅ [date] Completed
```

## Storage Locations
```
trinity-brain/
├── 📁 PROJECTS/
│   └── active/
│       └── [project-name]/
│           └── tasks.md          # Project-specific tasks
└── 🧠 SYSTEM/
    └── action-items-log.md       # Cross-project action tracking
```

## Workflow (Automatic)
1. **Action item dropped** → Detect and parse
2. **Analyze** → Priority, deadline, assignee
3. **Route** → Appropriate project/agent
4. **Write** → Markdown file in project tasks
5. **Commit** → Auto-git-commit + push
6. **Track** → Added to action items log

## Reminders
- Tasks with deadlines trigger reminders via cron
- Urgent tasks get immediate notification
- Weekly digest of open action items

## Examples
**Example 1: Simple Task**
> "Fix the broken image on the homepage"
→ Priority: 🟡 Normal → Assigned: kimi-claw → Project: website

**Example 2: Urgent with Deadline**
> "URGENT: Server is down, need to restart by 5pm"
→ Priority: 🔴 Urgent → Immediate ping → Assigned: kimi-claw

**Example 3: Deferred Task**
> "Someday: Redesign the logo when we have budget"
→ Priority: 🟢 Low → Added to backlog → No deadline

---

**Drop tasks here. They get tracked, assigned, and committed automatically.**
