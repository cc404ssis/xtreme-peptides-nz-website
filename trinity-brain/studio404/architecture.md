# Studio404 - Architecture

## Overview
Studio404 is the creative/productive hub where AI agents and humans collaborate on projects.

## Core Systems

### Discord Structure
```
Studio404 Server
├── #general-chat
├── #workspace-changelog ← Trinity brain updates
├── #bot-testing
└── [Project channels]
```

### Agent Infrastructure
- **Claude Code** - Deep dev work, coding, architecture
- **Kimi** - Operations, coordination, task management  
- **Dr. Mana** - Vision, brand voice, strategic guidance

### Trinity Brain
- **Location:** `/root/.openclaw/workspace/trinity-brain/`
- **Purpose:** Persistent shared memory
- **Access:** All agents + human (via Git/obsidian)

## Tech Stack
- **Frontend:** React, Tailwind
- **Backend:** Supabase, PostgreSQL
- **Hosting:** Railway, Vercel
- **Bots:** OpenClaw gateway, custom integrations
- **AI:** Claude (Anthropic), Kimi (Moonshot)

## Data Flow
```
Discord/Chat → OpenClaw → Agents → Trinity Brain (persist)
                                    ↓
                              Git sync → Obsidian
```

## Key Principles
1. **Agent sovereignty** - Each agent owns their domain
2. **Persistence** - Everything important goes to vault
3. **Compound knowledge** - Session logs build institutional memory
4. **Human-in-loop** - Final decisions rest with humans
