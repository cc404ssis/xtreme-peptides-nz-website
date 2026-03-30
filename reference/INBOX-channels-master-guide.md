# 📥 INBOX Channels — Master Guide

**Overview:** Four input channels for Trinity Brain. All content auto-processed, categorized, and committed to Git.

---

## The 4 INBOX Channels

| Channel | Emoji | Purpose | Output Location | Guide |
|---------|-------|---------|-----------------|-------|
| **#link-drop** | 🔗 | URLs, references, competitor content | `📥 LINKS/` | [[link-drop-channel-guide]] |
| **#voice-memos** | 🎙️ | Voice thoughts, ideas, audio notes | `📥 THOUGHTS/` | [[voice-memos-channel-guide]] |
| **#action-items** | ✅ | Tasks, reminders, action tracking | `📁 PROJECTS/[name]/tasks.md` | [[action-items-channel-guide]] |
| **#sie-core** | 🧠 | SIE project HQ, architecture, research | `📁 PROJECTS/active/sie-core/` | [[sie-core-channel-guide]] |

---

## Universal Workflow (All Channels)

### 1. Drop Content
Paste link, record voice, type task, or drop research — naturally.

### 2. Auto-Processing
- **Extract** → Parse content, detect type
- **Categorize** → Auto-route to correct folder
- **Structure** → Format as markdown with metadata
- **Enrich** → Add context, tags, cross-references

### 3. Auto-Git-Commit
✅ **Files saved** → Written to vault  
✅ **Git add** → Staged automatically  
✅ **Git commit** → Committed with descriptive message  
✅ **Git push** → Pushed to GitHub  
✅ **Obsidian sync** → Available in your vault immediately

**No manual intervention required.**

---

## Quick Reference

### 🔗 #link-drop
**Use for:** URLs, articles, GitHub repos, competitor sites, inspiration  
**Format:** `@Kimi https://example.com` (or just paste)  
**Auto-categories:**
- GitHub → `github-repos/`
- X/IG/TikTok → `_quick-dump.md`
- Claude/AI → `claude-skills/`
- Design → `design-creative/`
- Workflows → `workflows-systems/`

### 🎙️ #voice-memos  
**Use for:** Thoughts, ideas, brainstorming, voice notes  
**Format:** Record voice memo, drop in channel  
**Processing:** Audio → Transcribed (faster-whisper, local) → Structured thought  
**Privacy:** Audio never leaves the machine

### ✅ #action-items
**Use for:** Tasks, todos, reminders, deadlines  
**Format:** "Task: Fix the broken link" / "Remind me tomorrow to..."  
**Auto-detect:** Priority (urgent/normal/low), deadlines, assignees  
**Tracking:** Added to project tasks with status log

### 🧠 #sie-core
**Use for:** SIE architecture, research, decisions, code sketches  
**Format:** Discussions, links, decisions, code blocks  
**Auto-detect:** Architecture decisions → `DECISIONS.md`, Research → `KNOWLEDGE/`  
**Special:** Tracks rationale and consequences for major calls

---

## Git Sync Confirmation

Every piece of content:
1. Written to correct folder
2. Committed with context: `"Add analysis: [title] from #link-drop"`
3. Pushed to origin/main
4. Available in Obsidian on next open

**If content doesn't appear:** Check Obsidian Git plugin sync status.

---

## Channel Guides

Full documentation for each channel:
- [[link-drop-channel-guide]]
- [[voice-memos-channel-guide]]
- [[action-items-channel-guide]]
- [[sie-core-channel-guide]]

---

*All INBOX channels auto-commit to Git. Your vault is always synced.*
