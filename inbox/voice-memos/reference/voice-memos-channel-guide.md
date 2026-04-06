# 🎙️ Voice Memos — Channel Guide

## Purpose
Capture thoughts, ideas, and voice notes for the Trinity Brain. Audio input transcribed and stored as structured thoughts.

## How to Use This Channel
1. **Record a voice memo** in Discord
2. **Drop it here** — no @mention needed
3. **Auto-processed:** Transcribed → Saved to vault → Git committed

## What I Do With Voice Memos
- Transcribe audio to text (faster-whisper, local)
- Extract key points and action items
- Timestamp and categorize
- Save to `📥 THOUGHTS/`
- Git commit + push

## Format
```yaml
---
tags: [voice-memo, auto-transcribed]
project: [detected-project]
source: discord/voice-memos
added: YYYY-MM-DD HH:MM
by: [username]
audio_duration: [seconds]
language: [detected-language]
---

# Thought: [Auto-generated title]

## Raw Thought (Transcribed)
> [Transcribed text]

## Context
- **Audio Duration:** [X] seconds
- **Detected Language:** [language] ([confidence]% confidence)
- **Original File:** [filename]

## System Notes
[Any processing notes]

## Action Items
- [ ] Auto-extracted tasks

## Notes
[Space for follow-up notes]
```

## Categories
- Ideas → Flag for IDEAS/ review
- Tasks → Extract action items
- Questions → Route to appropriate agent
- General → Archived in THOUGHTS/

## Storage Location
```
trinity-brain/
└── 📥 THOUGHTS/
    └── YYYY-MM-DD_[auto-title].md
```

## Workflow (Automatic)
1. **Voice memo received** → Download audio
2. **Transcribe** → OGG → WAV → Text
3. **Analyze** → Extract tags, projects, action items
4. **Write** → Markdown file in 📥 THOUGHTS/
5. **Commit** → Auto-git-commit + push
6. **Available** → In Obsidian within seconds

## Privacy
- Audio processed locally (faster-whisper)
- Never leaves the machine
- Original audio deleted after transcription

## Examples
**Example 1: Simple Thought**
> "Idea: We should add dark mode to the website"
→ Saved to THOUGHTS/ with tag [feature-idea]

**Example 2: Task + Context**
> "Remind me to review the NII script tomorrow. The hook needs work."
→ Saved to THOUGHTS/ + Action item added + Tagged [nii-project]

**Example 3: Question**
> "What's the best way to handle webhook retries in n8n?"
→ Saved to THOUGHTS/ + Routed to kimi-claw for technical answer

---

**Drop voice memos here. They become structured thoughts automatically.**
