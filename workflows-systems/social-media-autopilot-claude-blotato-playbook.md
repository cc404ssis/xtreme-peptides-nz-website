# Social Media on Autopilot — Claude Code + Blotato Playbook

**Source:** https://docs.google.com/document/d/e/2PACX-1vTQvxwIcZFrhgLTHbmWIh5_NLR7cQPd-UubkStx5BvUW8OJQmvsP8At6ET7kF0Hmoi__cXAP5QNvM3v/pub  
**Author:** @aiwithanushka (aiwithanushka.com)  
**Category:** Workflows / Social Media Automation  
**Tags:** #claude-code #blotato #social-media #automation #content-pipeline  
**Added:** 2025-01-XX

---

## Overview

A complete beginner's playbook for creating a fully automated content pipeline where Claude researches topics, writes platform-specific posts, creates visual infographics, and schedules everything — with zero code.

**Five phases:**
1. Setup → 2. Write Posts → 3. Brand Voice → 4. Visuals → 5. Post & Schedule

---

## Phase 1: Installation & Setup

### Tools Required
| Tool | Purpose | Link |
|------|---------|------|
| Claude account | AI assistant | claude.ai (paid plan recommended) |
| Visual Studio Code | IDE | code.visualstudio.com |
| Claude Code extension | Claude integration | VS Code marketplace |

### Setup Steps
1. **Install VS Code** — Download for your OS
2. **Add Claude Code Extension** — Search "Claude Code" by Anthropic (4.9M+ downloads)
3. **Create Project Folder** — File → Open Folder → "social-media" on Desktop
4. **Open Claude Code Panel** — Click icon in VS Code top-right
5. **Set Auto-Edit Mode** — Change to "Edit Automatically" (bottom-right)

> 💡 **Note:** Claude will ask permission prompts throughout. Click Yes/Allow — this is normal.

---

## Phase 2: Writing Your Posts

### Step 1 — Research & Write
```
Research SEO vs GEO and write a thought-provoking 
LinkedIn post about the future of search.
```

> 💡 **GEO = Generative Engine Optimisation** — optimizing content for AI tools (Claude, ChatGPT, Gemini) instead of Google.

### Step 2 — Create Platform Files
```
Create a file for this LinkedIn post and also create 
a separate file for Instagram and another for Twitter.
```

**Output:** `linkedin_post.md`, `instagram_post.md`, `twitter_post.md`

### Step 3 — Trim & Enforce Limits
```
These posts are too long. Make them short and punchy. 
Make sure each stays within the character limit 
for its platform.
```

### Platform Character Limits

| Platform | Limit | Best Practice |
|----------|-------|---------------|
| LinkedIn | 3,000 chars | Hook in first line. Break up text. Use line breaks. |
| Instagram | 2,200 chars | Lead with visuals. Hook before 'more'. 3-5 hashtags. |
| X (Twitter) | 280 chars | One punchy idea. Use threads for more. |
| TikTok | 2,200 chars | Caption supports video — keep it short. |

---

## Phase 3: Setting Your Brand Voice

Claude saves brand preferences to `memory.md` — every future post automatically matches your style.

### Trigger Setup
```
Can you incorporate my brand voice for these posts 
and for all posts moving forward?
```

### The 4 Questions

**Q1 — Tone & Personality**
- Bold & direct
- Casual & conversational
- Professional & authoritative
- Witty & provocative

**Q2 — Target Audience**
- Founders & CEOs
- Marketing professionals
- Entrepreneurs & creators
- General business audience

**Q3 — Perspective**
- Industry insider
- Educator & teacher
- Contrarian thinker
- Practical problem-solver

**Q4 — Style Rules**
- No emojis
- Minimal emojis
- Emojis welcome
- Specific rules

✅ **Result:** `memory.md` created, all posts rewritten in your voice, future posts auto-match.

---

## Phase 4: Connecting Blotato & Creating Visuals

### About Blotato
Social media scheduling tool with built-in MCP connector for Claude. Generates infographics and posts directly to accounts from VS Code.

### 4A — Blotato Setup

1. **Create account** → blotato.com (free trial available)
2. **Get API setup command** → Settings → APIs → Copy Setup Command
3. **Add MCP to Claude Code:**
```
Add the following MCP server as if you were running
the claude MCP add command and add it to user scope.
Create the file if it doesn't exist.

[PASTE YOUR BLOTATO SETUP COMMAND HERE]
```
4. **Allow permissions** → Click Yes to all
5. **Restart Claude Code** → Set "Edit Automatically" again

### 4B — Generate Visuals

```
Make a whiteboard infographic from the LinkedIn post.
```

**Claude will:**
1. Read `linkedin_post.md`
2. Connect to Blotato templates
3. Generate infographic
4. Save to Blotato Videos library

> 💡 **Find visuals:** Blotato → Videos (left sidebar)

### Available Visual Templates

| Template | Style | Best For |
|----------|-------|----------|
| Whiteboard | Hand-drawn, sketchy | Comparisons, frameworks, educational |
| Newspaper | Print editorial | News-style, industry updates |
| TV Wall | Bold broadcast | Trending topics, hot takes |
| Trail Marker | Outdoor sign | Step-by-step guides, numbered frameworks |
| T-Shirt / Poster | Large type, minimal | Quotes, opinions, bold ideas |

---

## Phase 5: Connecting Accounts & Scheduling

### 5A — Connect Social Accounts

1. **Blotato Settings → Accounts**
2. **Login with LinkedIn / Instagram / X** — Must be logged in same browser
3. **Authorize connection** — Accounts appear under "Connected Accounts"
4. **Add more platforms** — Facebook, TikTok, etc.

> ⚠️ **Note:** Connections expire occasionally. If post fails → Reconnect in Blotato (30 seconds).

### 5B — Post & Schedule

```
Post the LinkedIn post now with the whiteboard infographic.
Schedule the Instagram post for tomorrow.
Schedule the Twitter/X post for Thursday 26th February.
```

**Variations:**
- `"Post all three posts right now."`
- `"Schedule all three posts for Monday at 9am."`

✅ **Confirmation:** Claude gives summary. Check Blotato → Calendar for scheduled posts.

---

## Quick Reference — All Prompts

| Goal | Prompt |
|------|--------|
| Research + write | `Research [topic] and write a thought-provoking LinkedIn post about [angle].` |
| Save to files | `Create files for this post for LinkedIn, Instagram, and Twitter.` |
| Shorten posts | `Make all posts short and punchy, within each platform's character limits.` |
| Set brand voice | `Incorporate my brand voice for these posts and all future posts.` |
| Make infographic | `Make a whiteboard infographic from the LinkedIn post.` |
| Different template | `Make a newspaper infographic from the LinkedIn post.` |
| Post now | `Post the LinkedIn post now with the infographic.` |
| Schedule one | `Schedule the Instagram post for tomorrow at 9am.` |
| Schedule all | `Post LinkedIn now. Schedule Instagram for tomorrow. Schedule Twitter for Thursday.` |
| Fix failed post | `I reconnected everything in Blotato. Please try posting again.` |

---

## Key Insights

1. **Zero code required** — All through natural language prompts
2. **Brand voice persistence** — `memory.md` remembers your style
3. **Visual automation** — Blotato MCP creates infographics from text
4. **Full pipeline** — Research → Write → Design → Schedule in one chat
5. **Multi-platform** — LinkedIn, Instagram, X, TikTok, Facebook support

---

## Resources

- **Author:** @aiwithanushka
- **Website:** aiwithanushka.com
- **Tools:** claude.ai, blotato.com, code.visualstudio.com

---

*Extracted from Google Docs public link via Trinity Link-Drop Pipeline*
