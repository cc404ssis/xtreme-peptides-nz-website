# 📥 INBOX — Trinity Brain Input System

**Purpose:** Central intake for all raw inputs across 4 Discord channels.

---

## Channel Structure

| Channel | Folder | Purpose |
|---------|--------|---------|
| **#brain-dump** | `brain-dump/` | Quick thoughts, raw ideas, unfiltered notes |
| **#voice-memos** | `voice-memos/` | Audio transcriptions, voice-to-text processing |
| **#media-staging** | `media-staging/` | Images, videos, screenshots for processing |
| **#link-drop** | `link-drop/` | URLs, articles, competitor content, inspiration |

---

## Processing Workflow

```
Discord Channel → Extract/Transcribe/OCR → Categorize → Git Commit → Vault
```

All content auto-commits to Git without prompting.

---

## Folder Organization

### link-drop/
```
link-drop/
├── claude-skills/        # Technical frameworks, dashboards, skills
├── workflows-systems/    # Automation playbooks, tools
├── reading-list/         # Articles, pending extractions
└── reference/            # Channel guides, test results
```

### voice-memos/
```
voice-memos/
├── transcriptions/       # Raw transcribed audio
└── processed/            # Structured, categorized outputs
```

### brain-dump/
```
brain-dump/
├── raw/                  # Unprocessed dumps
└── structured/           # Organized into actionable items
```

### media-staging/
```
media-staging/
├── images/               # Screenshots, photos
├── videos/               # Video files
└── extracted/            # OCR results, frame grabs
```

---

## Channel Guides

- `link-drop/reference/link-drop-channel-guide.md`
- `voice-memos/reference/voice-memos-channel-guide.md`
- `brain-dump/reference/brain-dump-channel-guide.md`
- `media-staging/reference/media-staging-channel-guide.md`

**Master Guide:** `../reference/INBOX-channels-master-guide.md`

---

## Stats

| Channel | Files | Status |
|---------|-------|--------|
| link-drop | 11+ | Active |
| voice-memos | — | Ready |
| brain-dump | — | Ready |
| media-staging | — | Ready |

---

*Auto-organized: 2026-04-07*
