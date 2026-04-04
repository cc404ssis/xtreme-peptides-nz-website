# CLAUDE CODE AD DASHBOARD — BY VIZNFR

**Source:** Notion export (PDF) — Originally gated content  
**Author:** VIZNFR (Founder of Vizznary, Vizn)  
**Category:** Claude Skills / Advertising / Automation  
**Tags:** #claude-code #advertising #meta-ads #nano-banana-2 #fal-ai #dashboard  
**Added:** 2026-04-04

---

## Overview

> "Brands pay agencies $500 per creative. This pipeline produces 100 and ships them for the cost of your subscription. Most agencies have no idea this exists yet."

A complete ad generation and management system using Claude Code + Nano Banana 2 + Fal AI to create, generate, and track Meta advertisements at scale.

---

## The Stack

| Tool | Purpose |
|------|---------|
| **Claude Code** | AI assistant for orchestration |
| **Nano Banana 2** | Image generation (cinematic quality, consistent output) |
| **Fal AI** | AI infrastructure for image generation |
| **Meta Ad Library** | Ad inspiration and competitor research |
| **Custom Dashboard** | "War Room" for tracking performance |

---

## Required Agent Skills

The system uses 4 SKILL.md files:
- `forge.md` — Ad creation/ideation
- `looper.md` — Batch processing
- `publisher.md` — Publishing/deployment
- `scraper.md` — Data extraction

---

## Step-by-Step Setup

### Step 1: Install Fal AI

Run in Claude Code:
```bash
npm install @fal-ai/client
```

### Step 2: Upload Your Site to Claude Code

Drop your site link into Claude Code for consistent product integration across all ads.

**Purpose:** Ensures every generated creative features your actual product with proper branding.

### Step 3: Generate Ads with Nano Banana 2

**What it does:**
- Handles image generation
- Cinematic quality, consistent output
- No plastic AI look
- Every frame is campaign ready
- 100 variations generated systematically

### Step 4: Build Your Dashboard ("War Room")

**Prompt to create the dashboard:**

```
Build a fully functional single-file HTML dashboard called a "War Room" 
for tracking Meta Ad Library performance.

Dark theme matching Claude's UI (#0d0d0f base, warm gold accents, 
IBM Plex Mono + Space Grotesk fonts).

No frameworks, no external dependencies except Google Fonts.

LAYOUT:
- Sticky header: logo, tab navigation (Overview / Campaigns / Creatives / Agents), 
  live badge with pulsing green dot, date/time, sync button
- Two-column layout: 240px sidebar + main content area
- Sidebar: agent cards, account health metrics, budget allocation bars, ad accounts
- Main: KPI row, filter chips, ad grid (3 columns), bottom row (chart + terminal log)
- Slide-in detail panel (380px) from right on ad card click

KPI ROW (5 cards):
Total Spend, Revenue, Impressions, Conversions, Active Ads
```

---

## Key Features

### Cost Efficiency
- Traditional agency: $500 per creative
- This pipeline: 100 creatives at subscription cost

### Quality
- Cinematic image quality via Nano Banana 2
- Consistent brand representation
- No "plastic AI" aesthetic

### Scale
- Systematic generation of 100+ variations
- Batch processing capabilities
- Integrated with Meta Ad Library

---

## Dashboard Design Specs

| Element | Specification |
|---------|---------------|
| **Theme** | Dark (#0d0d0f base) |
| **Accents** | Warm gold |
| **Fonts** | IBM Plex Mono, Space Grotesk |
| **Dependencies** | Google Fonts only |
| **Layout** | 240px sidebar + main content |
| **KPI Cards** | 5 metrics (Spend, Revenue, Impressions, Conversions, Active Ads) |
| **Detail Panel** | 380px slide-in from right |

---

## Related Resources

- **Get the Vizn Prompt Bot:** Mentioned as next step for building your own masterpiece
- **Website:** https://viznfr.com or similar (Vizznary/Vizn)

---

## Applications

### For Agencies
- Reduce creative production costs by 90%+
- Increase output volume 100x
- Maintain cinematic quality at scale

### For Brands
- In-house ad generation
- Rapid creative testing
- Meta Ad Library integration for competitive intelligence

### For Performance Marketers
- War Room dashboard for real-time tracking
- Systematic creative variation
- Direct integration with existing Meta ad accounts

---

## Technical Notes

- Single-file HTML dashboard (no build step required)
- Fal AI client for image generation infrastructure
- Nano Banana 2 for high-quality creative generation
- Claude Code for orchestration and system integration

---

*Extracted from Notion PDF export via Trinity Link-Drop Pipeline*  
*Content originally gated — extracted via user export*
