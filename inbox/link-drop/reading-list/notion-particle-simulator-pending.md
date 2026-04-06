# AI Particle Simulator Guide + Prompt Pack

**Source:** https://www.notion.so/AI-Particle-Simulator-Full-Guide-Prompt-Pack-331543f5288680ea9e6cdacf45372d68  
**Tool:** https://particles.casberry.in/  
**Category:** 3D Visualization / Creative Coding / WebGL  
**Status:** ✅ **Extracted** — Content saved to vault  
**Added:** 2025-01-XX  
**Extracted:** 2026-04-04

---

## Access Status

🔓 **Resolved** — Content extracted from PDF export and saved to vault.

---

## Full Content Available At

📄 **`workflows-systems/ai-particle-simulator-guide.md`**

---

## Summary

**Free browser-based tool** for turning text prompts into complex 3D particle simulations (20,000+ particles). Export production-ready React or Three.js code.

**Key Features:**
- 100% free, no signup required
- 20,000+ particle simulations at 60fps
- Export to React or Three.js
- Real-time UI controls for tweaking
- Complete prompt template for LLMs (Claude, ChatGPT, etc.)

**Performance Rules:**
- Zero garbage collection (function runs 20k times per frame)
- Math over logic (avoid branching)
- Reuse provided `target` and `color` objects
- No `new THREE.Vector3()` or `new THREE.Color()` in loops

**Security Constraints:**
- Forbidden: `document`, `window`, `fetch`, `eval`, `import`, `setTimeout`, etc.
- Must pass dry-run validation without errors

---

*Placeholder updated by Trinity Link-Drop Pipeline*  
*Full content extracted from PDF and committed to Git*
