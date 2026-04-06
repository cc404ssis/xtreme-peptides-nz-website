# 🔗 Link Drop — Automated Analysis Workflow (UPDATED)

## Purpose
Central information hub for the server. Drop any URL here and I'll extract, analyze, categorize, store, and **auto-commit to Git** so your vault stays synced.

---

## Supported Content Types

| Platform | What I Extract | Stored As |
|----------|----------------|-----------|
| **Instagram** | Post caption, carousel slides (all), comments, engagement metrics, visual style analysis | `trinity-brain/📥 LINKS/` or project-specific |
| **YouTube** | Title, description, transcript, thumbnail analysis, comments sentiment | `trinity-brain/📥 LINKS/` |
| **News/Articles** | Full text, key quotes, source credibility, relevant tags | `trinity-brain/📥 LINKS/reading-list/` |
| **Competitor Sites** | Landing page copy, CTAs, visual hierarchy, messaging strategy | `trinity-brain/📁 PROJECTS/[project]/reference/` |
| **Research Papers** | Abstract, methodology, key findings, citation | `trinity-brain/📚 KNOWLEDGE/` |
| **Twitter/X** | Thread content, engagement, sentiment analysis | `trinity-brain/📥 LINKS/_quick-dump.md` |
| **TikTok** | Caption, transcript, hashtags, comments | `trinity-brain/📥 LINKS/` |

---

## Workflow (Automatic)

### 1. Drop a Link
Paste any URL with optional context like:
- "For NII video research"
- "Check this competitor"
- "AI tool for UGENC"

### 2. Auto-Extraction
- I fetch the content
- Extract text, images, engagement data
- Analyze and categorize

### 3. File & Commit (AUTOMATIC)
✅ **Files saved to workspace**  
✅ **Auto-committed to Git**  
✅ **Pushed to GitHub**  
✅ **Available in Obsidian immediately**

**No action required from you.**

---

## Instagram Carousel Specifics

When you drop an Instagram carousel link:
- ✅ Navigate through every slide
- ✅ Capture text content from each image
- ✅ Extract engagement metrics
- ✅ Analyze comment sentiment
- ✅ Save screenshots of key slides
- ✅ **Auto-commit to Git**

**Limitations:**
- Private accounts = limited/no access
- Login walls may block some content
- Stories/Reels require different extraction method

---

## Organization Structure

```
workspace/
├── trinity-brain/
│   ├── 📥 LINKS/
│   │   ├── _quick-dump.md          # Uncategorized (temp)
│   │   ├── ai-tools/
│   │   ├── reading-list/
│   │   └── github-repos/
│   ├── 📁 PROJECTS/
│   │   ├── active/
│   │   │   ├── [project-name]/
│   │   │   │   ├── brief.md
│   │   │   │   ├── reference/      # Competitor inspiration
│   │   │   │   └── research/       # Articles, data
│   │   └── archive/
│   ├── 📚 KNOWLEDGE/
│   └── 🔌 AGENTS/
├── claude-skills/                   # Skill frameworks
├── workflows-systems/               # Workflow patterns
└── reading-list/                    # General reading
```

---

## Tagging System

Auto-tagged with:
- **Relevance:** High / Medium / Low
- **Project:** NII / Faceless / UGENC-SSIS / SIE / General
- **Type:** Competitor / Inspiration / Research / Tool / Trend
- **Action:** Review / Implement / Archive / Share

---

## Response Format

Every analysis includes:
1. **Quick summary** — What this is, why it matters
2. **Key takeaways** — Bullet points of value
3. **Sentiment/Comments** — What people are saying
4. **Stored location** — Exact file path
5. **Git confirmation** — Commit hash

---

## What Works Best

| Format | Best Approach |
|--------|---------------|
| **Blog posts / Articles** | Drop the URL |
| **Instagram / TikTok** | Drop the URL (I extract everything) |
| **YouTube** | Drop the URL (transcripts available) |
| **Twitter/X threads** | Drop the URL |
| **Gated / Login-required** | Screenshot + drop URL for reference |
| **Notion** | Screenshot key sections (gated content) |

---

## Troubleshooting

**"I don't see it in Obsidian"**
→ Check if Obsidian sync is running
→ Files are committed within seconds of analysis

**"The content was gated"**
→ I'll create a placeholder file
→ Screenshot the content and upload here
→ I'll extract and update

**"Wrong category"**
→ Tell me the correct category
→ I'll move and recommit

---

## Drop Links Here

Just paste URLs. I'll handle extraction, analysis, filing, and Git sync automatically.

**Your vault stays updated without asking.**
