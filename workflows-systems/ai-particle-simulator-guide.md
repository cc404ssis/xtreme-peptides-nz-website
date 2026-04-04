# AI Particle Simulator — Full Guide + Prompt Pack

**Tool:** https://particles.casberry.in/  
**Cost:** 100% Free  
**Signup:** None required  
**Platform:** Browser-based  
**Category:** 3D Visualization / Creative Coding / WebGL  
**Added:** 2026-04-04

---

## What It Does

Turn text prompts into complex 3D particle simulations. Export production-ready React or Three.js code in seconds.

**Output:** 20,000+ particle simulations  
**Export formats:** React or Three.js  
**Requirements:** No shader knowledge, no WebGL experience, no installs

---

## How It Works

1. **Open** the tool (browser-based)
2. **Type** a prompt describing the particle system you want
3. **Watch** it generate a live 20,000+ particle simulation
4. **Tweak** using auto-generated real-time controls
5. **Export** the code (React or Three.js) — drop into your project

---

## The Prompt (Build It Yourself)

Paste this into Claude, ChatGPT, or any LLM — then add your creative idea at the bottom where it says `[INSERT YOUR CREATIVE IDEA HERE]`.

### Full Prompt

```
Act as a Creative Computational Artist & High-Performance WebGL Shader Expert.

**YOUR GOAL:**
Write a single, highly optimized JavaScript function body that defines the movement 
behavior and visual appearance of particles in a massive 3D particle swarm simulation 
(20,000+ units).

**CONTEXT & API VARIABLES (Read-Only unless specified):**
1. `i` (Integer): Index of the current particle (0 to count-1).
2. `count` (Integer): Total number of particles.
3. `target` (THREE.Vector3): **WRITE-ONLY**. You MUST update this vector object 
   (`target.set(x,y,z)`) to position the particle.
4. `color` (THREE.Color): **WRITE-ONLY**. You MUST update this color object 
   (`color.setHSL(...)` or `color.set(...)`) to paint the particle.
5. `time` (Float): Global simulation time in seconds. Use this for animation.
6. `THREE`: The full Three.js library access.

**HELPER FUNCTIONS (Interactive UI):**
- `addControl(id, label, min, max, initialValue)`: Creates a real-time slider in the UI. 
  Returns the current float value.
  *Example:* `const speed = addControl("speed", "Rotation Speed", 0, 5, 1.0);`
  
- `setInfo(title, description)`: Updates the HUD. **Call ONLY when `i === 0`**.

- `annotate(id, positionVector, labelText)`: Adds a floating 3D label. 
  **Call ONLY when `i === 0`**.
  *Example:* `annotate("center", new THREE.Vector3(0,0,0), "Singularity");`

**CRITICAL PERFORMANCE RULES (STRICT COMPLIANCE REQUIRED):**

1. **ZERO GARBAGE COLLECTION:** This function runs 20,000 times *per frame* (60fps).
   - **NEVER** use `new THREE.Vector3()` or `new THREE.Color()` inside the loop 
     (except for one-off annotations).
   - **NEVER** allocate arrays or objects inside the loop.
   - Reuse the provided `target` and `color` objects.

2. **MATH OVER LOGIC:** Avoid heavy branching (`if/else`) inside the loop. 
   Use math functions (`Math.sin`, `Math.cos`, `Math.abs`) for shaping.

3. **OUTPUT ONLY:** Do not return any value. Just mutate `target` and `color`.

4. **STABILITY LOCK:** All coordinates and color values MUST be finite, real numbers. 
   **NEVER** set values to `NaN`, `Infinity`, or `undefined`. 
   Ensure your mathematical formulas (e.g. divisions) have safety guards against zero.

5. **ENVIRONMENT CONFLICTS:** Do not use variable names that conflict with the global 
   environment. **NEVER** redefine or use common global names like `SHADERS`, `THREE`, 
   `Math`, etc. inside your code.

**SECURITY & VALIDATION RULES (STRICT COMPLIANCE REQUIRED):**

Our simulator includes a multi-stage security and stability validator.

1. **FORBIDDEN PATTERNS:** Any code containing the following will be REJECTED:
   - `document`, `window`, `fetch`, `XMLHttpRequest`, `WebSocket`
   - `eval`, `Function(`, `import(`, `require(`, `process`
   - `__proto__`, `.prototype`, `globalThis`, `self`, `location`, `navigator`
   - `localStorage`, `sessionStorage`, `indexedDB`, `crypto`
   - `setTimeout`, `setInterval`, `alert()`, `confirm()`, `prompt()`

2. **STABILITY GATE:** The code must pass a dry-run execution without throwing 
   ANY runtime errors.

3. **CONCISE & CLEAN:** Avoid extremely long variable names or deeply nested structures. 
   Ensure the code is self-contained and does not use complex non-standard characters 
   in comments that might disrupt database storage.

4. **NO UNDECLARED VARIABLES:** All variables (like 'phi', 'theta', 'radius', etc.) 
   MUST be explicitly declared.

[INSERT YOUR CREATIVE IDEA HERE]
```

---

## Use Cases

### Creative Coding
- Generative art installations
- Interactive visual experiences
- Portfolio pieces for creative technologists

### Product Visualization
- Particle-based product reveals
- Abstract brand animations
- Website hero sections

### Prototyping
- Rapid shader/experience prototyping
- Client pitch visualizations
- Creative exploration without WebGL expertise

### Education
- Learning Three.js concepts
- Understanding particle systems
- WebGL performance optimization patterns

---

## Technical Architecture

| Component | Purpose |
|-----------|---------|
| **Three.js** | WebGL abstraction layer |
| **Custom Shader** | GPU-accelerated particle rendering |
| **UI Controls** | Real-time parameter adjustment |
| **Code Export** | React/Three.js component generation |
| **Validator** | Security & stability enforcement |

---

## Performance Considerations

The simulator runs **20,000 particles at 60fps** — this requires:
- Zero memory allocation in the render loop
- GPU-accelerated calculations
- Math-based conditional logic (no branching)
- Reused object references

---

## Export Options

### React Component
```jsx
// Generated component ready to drop into your project
import { ParticleSimulation } from './generated-particles';

function App() {
  return <ParticleSimulation />;
}
```

### Three.js Code
Raw Three.js code for custom integration or learning purposes.

---

## Creative Ideas to Try

- **Cosmic dust cloud** — swirling nebula with gravitational attraction
- **Data visualization** — particles representing live data points
- **Audio reactive** — particles responding to frequency analysis
- **Fluid simulation** — flowing liquid dynamics
- **Swarm behavior** — boids/flocking algorithms
- **Crystal formation** — geometric growth patterns
- **Fireworks display** — explosive particle bursts
- **Underwater ecosystem** — floating plankton and bubbles

---

## Related Resources

- **Three.js Documentation:** https://threejs.org/
- **WebGL Fundamentals:** https://webglfundamentals.org/
- **Creative Coding:** OpenFrameworks, Processing, p5.js

---

*Extracted from Notion PDF export via Trinity Link-Drop Pipeline*  
*Original content: AI Particle Simulator — Full Guide + Prompt Pack*
