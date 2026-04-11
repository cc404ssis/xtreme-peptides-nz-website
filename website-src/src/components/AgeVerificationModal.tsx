import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════
   3-Layer Entry Gate — Xtreme Peptides NZ
   Layer 1: Fake 404 page (no branding)
   Layer 2: Transition wipe animation
   Layer 3: Branded age verification gate
   ═══════════════════════════════════════════════ */

type GatePhase =
  | "fake404"
  | "search"
  | "wipeIn"
  | "wipeOut"
  | "ageGate"
  | "ageExiting"
  | "denied"
  | "done";

const SECRET = "xtp2079";

function setHeadLink(rel: string, href: string) {
  let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!href) {
    if (link) link.remove();
    return;
  }
  if (!link) {
    link = document.createElement("link");
    link.rel = rel;
    if (rel === "icon") link.type = href.endsWith(".svg") ? "image/svg+xml" : "image/png";
    document.head.appendChild(link);
  }
  link.href = href;
}

export default function AgeVerificationModal() {
  const [phase, setPhase] = useState<GatePhase>(() => {
    try {
      return localStorage.getItem("xp_age_verified") === "true"
        ? "done"
        : "fake404";
    } catch {
      return "fake404";
    }
  });
  const [searchInput, setSearchInput] = useState("");
  const [agvAnimating, setAgvAnimating] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const infoBtnRef = useRef<HTMLButtonElement>(null);

  // ── Dynamic browser branding (title, favicon, theme-color) ──
  useEffect(() => {
    const branded = phase !== "fake404" && phase !== "search";
    document.title = branded ? "XTREME PEPTIDES NZ" : "404 \u2014 Page Not Found";
    setHeadLink("icon", branded ? "/favicon.svg" : "");
    setHeadLink("apple-touch-icon", branded ? "/apple-touch-icon.png" : "");
    const meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    if (meta) meta.content = branded ? "#000000" : "#f5f5f5";
  }, [phase]);

  // ── Idle reset: 5 minutes of no activity returns to fake 404 ──
  // Only active when user is past the gate (phase === 'done').
  // Uses a Date.now() timestamp + visibility/focus checks rather than
  // a bare setTimeout, because iOS Safari throttles timers when the
  // tab is backgrounded — so a screen-locked phone would never fire.
  useEffect(() => {
    if (phase !== "done") return;

    const IDLE_MS = 5 * 60 * 1000; // 5 minutes
    const ACTIVITY_KEY = "xp_last_activity";
    let timer: ReturnType<typeof setTimeout> | undefined;

    const triggerReset = () => {
      try {
        localStorage.removeItem("xp_age_verified");
        sessionStorage.removeItem(ACTIVITY_KEY);
      } catch {
        /* private mode */
      }
      // Hard reload — sends user back to fake 404 entry gate
      window.location.reload();
    };

    const stamp = () => {
      try {
        sessionStorage.setItem(ACTIVITY_KEY, String(Date.now()));
      } catch {
        /* private mode */
      }
    };

    const checkIdle = () => {
      try {
        const last = parseInt(sessionStorage.getItem(ACTIVITY_KEY) || "0", 10);
        if (last && Date.now() - last >= IDLE_MS) {
          triggerReset();
          return true;
        }
      } catch {
        /* private mode */
      }
      return false;
    };

    const armTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(triggerReset, IDLE_MS);
    };

    const onActivity = () => {
      stamp();
      armTimer();
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        // Tab regained focus — if we've been idle longer than the cap,
        // reset right now even if the setTimeout never fired.
        if (!checkIdle()) {
          stamp();
          armTimer();
        }
      }
    };

    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "wheel", "click"];
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onVisibility);

    // On first mount of the "done" phase, check whether a previous
    // session already burned the timer. This handles the SPA case where
    // the modal effect re-runs after a navigation.
    if (!checkIdle()) {
      stamp();
      armTimer();
    }

    return () => {
      if (timer) clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, onActivity));
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onVisibility);
    };
  }, [phase]);

  // ── Phase transition timers ──
  useEffect(() => {
    if (phase === "wipeIn") {
      const t = setTimeout(() => {
        setAgvAnimating(true);
        setPhase("wipeOut");
      }, 580);
      return () => clearTimeout(t);
    }
    if (phase === "wipeOut") {
      const t = setTimeout(() => setPhase("ageGate"), 850);
      return () => clearTimeout(t);
    }
    if (phase === "ageExiting") {
      const t = setTimeout(() => setPhase("done"), 550);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // ── Click-outside handler for search panel ──
  useEffect(() => {
    if (phase !== "search") return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        infoBtnRef.current &&
        !infoBtnRef.current.contains(target)
      ) {
        setPhase("fake404");
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [phase]);

  // ── Search submit ──
  // Anything that isn't the secret code (case-insensitive, trimmed)
  // opens a real Google search in a new tab — preserves the cover.
  const handleSearchSubmit = useCallback(() => {
    const trimmed = searchInput.trim();
    if (!trimmed) return;
    if (trimmed.toLowerCase() === SECRET) {
      setPhase("wipeIn");
    } else {
      window.open(
        `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`,
        "_blank"
      );
      setSearchInput("");
      setPhase("fake404");
    }
  }, [searchInput]);

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleSearchSubmit();
    },
    [handleSearchSubmit]
  );

  // ── Age gate handlers ──
  const handleEnter = () => {
    try {
      localStorage.setItem("xp_age_verified", "true");
    } catch {
      /* private browsing */
    }
    setPhase("ageExiting");
  };

  const handleExit = () => setPhase("denied");

  if (phase === "done") return null;

  const show404 = phase === "fake404" || phase === "search";
  const showWipe = phase === "wipeIn" || phase === "wipeOut";
  const showAgeGate =
    phase === "wipeOut" ||
    phase === "ageGate" ||
    phase === "ageExiting" ||
    phase === "denied";

  return (
    <>
      <style>{fake404Styles + wipeStyles + ageGateStyles}</style>

      {/* ════════ LAYER 1 — FAKE 404 ════════ */}
      {show404 && (
        <>
          <div className="e404-root">
            <div className="e404-wrap">
              <div className="e404-code">404</div>
              <div className="e404-bar" />
              <div className="e404-title">Page Not Found</div>
              <p className="e404-sub">
                The page you&rsquo;re looking for doesn&rsquo;t exist or has
                been moved.
                <br />
                Check the URL and try again.
              </p>
              <button
                className="e404-btn"
                onClick={() => window.history.back()}
              >
                Go Back
              </button>
              <div className="e404-footer">
                HTTP 404 &nbsp;&middot;&nbsp; Resource unavailable
              </div>
            </div>
          </div>

          {/* Info icon */}
          <button
            ref={infoBtnRef}
            className="e404-info"
            onClick={() =>
              setPhase(phase === "search" ? "fake404" : "search")
            }
            title="Search for help"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </button>

          {/* Search panel */}
          <div
            ref={panelRef}
            className={`e404-search-panel${phase === "search" ? " open" : ""}`}
          >
            <div className="e404-search-label">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#aaa"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Search this problem
            </div>
            <div className="e404-search-input-wrap">
              <span className="e404-search-gicon">
                <span className="g-blue">G</span>
                <span className="g-red">o</span>
                <span className="g-yellow">o</span>
                <span className="g-blue">g</span>
                <span className="g-green">l</span>
                <span className="g-red">e</span>
              </span>
              <input
                className="e404-search-input"
                type="text"
                placeholder="Describe your problem..."
                autoComplete="off"
                spellCheck={false}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                autoFocus={phase === "search"}
              />
              <button
                className="e404-search-submit"
                onClick={handleSearchSubmit}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
            <div className="e404-search-hint">
              Press Enter or click &rarr;
            </div>
          </div>
        </>
      )}

      {/* ════════ LAYER 2 — TRANSITION WIPE ════════ */}
      {showWipe && (
        <div
          className={`ewipe-panel ${
            phase === "wipeIn" ? "ewipe-panel--in" : "ewipe-panel--out"
          }`}
        />
      )}

      {/* ════════ LAYER 3 — AGE GATE ════════ */}
      {showAgeGate && (
        <div className={agvAnimating ? "agv-active" : ""}>
          {/* Layered background */}
          <div
            className="agv-bg"
            style={
              phase === "ageExiting"
                ? { transition: "opacity 0.5s ease", opacity: 0 }
                : undefined
            }
          >
            <div className="agv-bg-grid" />
            <div className="agv-bg-stripes" />
            <div className="agv-bg-glow" />
            <div className="agv-bg-scanline" />
            <div className="agv-bg-vline agv-bg-vline--left" />
            <div className="agv-bg-vline agv-bg-vline--right" />
            <div className="agv-corner agv-corner--tl" />
            <div className="agv-corner agv-corner--tr" />
            <div className="agv-corner agv-corner--bl" />
            <div className="agv-corner agv-corner--br" />
            <div className="agv-corner-label agv-corner-label--tl">XP-NZ</div>
            <div className="agv-corner-label agv-corner-label--tr">18+</div>
            <div className="agv-corner-label agv-corner-label--bl">
              Research Use Only
            </div>
            <div className="agv-corner-label agv-corner-label--br">Verify</div>
          </div>

          {/* Gate card */}
          <div
            className="agv-gate"
            style={
              phase === "ageExiting"
                ? {
                    transition: "opacity 0.5s ease, transform 0.5s ease",
                    opacity: 0,
                    transform: "scale(1.03)",
                  }
                : undefined
            }
          >
            <div className="agv-gate-card">
              <div className="agv-card-header">
                <div className="agv-logo-wrap">
                  <div className="agv-logo-pip" />
                  <div>
                    <div className="agv-logo-text">Xtreme Peptides</div>
                    <div className="agv-logo-sub">New Zealand</div>
                  </div>
                  <div className="agv-logo-pip" />
                </div>
              </div>

              <div className="agv-card-rule" />

              <div className="agv-card-body">
                <div className="agv-age-badge">Age Verification Required</div>

                <div className="agv-gate-headline">
                  You must be
                  <br />
                  <span className="agv-accent">18 or older</span>
                  <br />
                  to enter
                </div>

                <div className="agv-dot-row">
                  <div className="agv-dot-line" />
                  <div className="agv-dot" />
                  <div className="agv-dot" />
                  <div className="agv-dot" />
                  <div className="agv-dot-line" />
                </div>

                <p className="agv-gate-copy">
                  All products are sold strictly for laboratory research
                  purposes only. By entering you confirm your age and agree to
                  our terms of use.
                </p>

                <div className="agv-btn-group">
                  <button
                    className="agv-btn agv-btn-primary"
                    onClick={handleEnter}
                  >
                    I am 18+
                  </button>
                  <button
                    className="agv-btn agv-btn-secondary"
                    onClick={handleExit}
                  >
                    Under 18
                  </button>
                </div>

                <div className="agv-gate-note">
                  <strong>18+ Only.</strong> All products sold for laboratory
                  research use.
                  <br />
                  Not for human consumption. New Zealand.
                </div>
              </div>
            </div>
          </div>

          {/* Denied overlay */}
          <div
            className={`agv-exit-overlay${phase === "denied" ? " active" : ""}`}
          >
            <div className="agv-exit-headline">Access Restricted</div>
            <div className="agv-exit-sub">
              You must be 18 or older to access this site
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─────────────────────────────────────────────
   CSS — LAYER 1: FAKE 404 + SEARCH PANEL
   System fonts only. Zero branding.
   Prefix: e404-
   ───────────────────────────────────────────── */
const fake404Styles = `
.e404-root {
  position: fixed; inset: 0;
  background: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10020;
  transition: opacity 0.6s ease;
}
.e404-wrap {
  text-align: center;
  max-width: 520px;
  padding: 40px 24px;
}
.e404-code {
  font-size: 120px;
  font-weight: 900;
  color: #d0d0d0;
  line-height: 1;
  letter-spacing: -4px;
  margin-bottom: 8px;
  user-select: none;
}
.e404-bar {
  width: 48px; height: 3px;
  background: #d0d0d0;
  margin: 0 auto 20px;
  border-radius: 2px;
}
.e404-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}
.e404-sub {
  font-size: 14px;
  color: #888;
  line-height: 1.6;
  margin-bottom: 32px;
}
.e404-btn {
  display: inline-block;
  padding: 10px 24px;
  background: #e8e8e8;
  color: #555;
  font-size: 13px;
  border-radius: 4px;
  text-decoration: none;
  cursor: pointer;
  border: none;
  font-family: inherit;
  transition: background 0.15s;
}
.e404-btn:hover { background: #ddd; }
.e404-footer {
  margin-top: 48px;
  font-size: 11px;
  color: #bbb;
  letter-spacing: 0.05em;
}

/* Info icon button */
.e404-info {
  position: fixed;
  bottom: 24px; right: 24px;
  width: 36px; height: 36px;
  border-radius: 50%;
  background: #e8e8e8;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10030;
  transition: background 0.15s, transform 0.15s;
  color: #aaa;
}
.e404-info:hover { background: #ddd; transform: scale(1.08); }
.e404-info svg { pointer-events: none; }

/* Search panel */
.e404-search-panel {
  position: fixed;
  bottom: 72px; right: 24px;
  width: 320px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.15), 0 1px 4px rgba(0,0,0,0.08);
  padding: 16px;
  z-index: 10040;
  opacity: 0;
  transform: translateY(8px) scale(0.97);
  pointer-events: none;
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.e404-search-panel.open {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: all;
}
.e404-search-label {
  font-size: 11px;
  color: #888;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.e404-search-label svg { flex-shrink: 0; }
.e404-search-input-wrap {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 24px;
  padding: 8px 14px;
  gap: 8px;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.e404-search-input-wrap:focus-within {
  border-color: #4285f4;
  box-shadow: 0 0 0 3px rgba(66,133,244,0.12);
}
.e404-search-gicon {
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: -0.5px;
}
.g-blue   { color: #4285f4; }
.g-red    { color: #ea4335; }
.g-yellow { color: #fbbc05; }
.g-green  { color: #34a853; }
.e404-search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 13px;
  color: #333;
  background: transparent;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
.e404-search-input::placeholder { color: #bbb; }
.e404-search-submit {
  background: none; border: none;
  cursor: pointer; padding: 0;
  color: #aaa;
  display: flex; align-items: center;
  transition: color 0.15s;
}
.e404-search-submit:hover { color: #4285f4; }
.e404-search-hint {
  font-size: 10px;
  color: #ccc;
  margin-top: 10px;
  text-align: center;
}
`;

/* ─────────────────────────────────────────────
   CSS — LAYER 2: TRANSITION WIPE
   Prefix: ewipe-
   ───────────────────────────────────────────── */
const wipeStyles = `
.ewipe-panel {
  position: fixed; inset: 0;
  background: var(--xp-black, #000);
  z-index: 10100;
  pointer-events: none;
}
.ewipe-panel--in {
  transform: scaleY(0);
  transform-origin: bottom;
  animation: ewipeIn 0.55s cubic-bezier(0.76, 0, 0.24, 1) forwards;
}
.ewipe-panel--out {
  transform: scaleY(1);
  transform-origin: top;
  animation: ewipeOut 0.85s cubic-bezier(0.76, 0, 0.24, 1) forwards;
}
@keyframes ewipeIn  { from { transform: scaleY(0); } to { transform: scaleY(1); } }
@keyframes ewipeOut { from { transform: scaleY(1); } to { transform: scaleY(0); } }
`;

/* ─────────────────────────────────────────────
   CSS — LAYER 3: AGE GATE
   Animations are TRIGGER-BASED via .agv-active
   Prefix: agv-
   ───────────────────────────────────────────── */
const ageGateStyles = `
/* ── LAYERED BACKGROUND ── */
.agv-bg {
  position: fixed; inset: 0; z-index: 10000;
  background: var(--xp-black, #000);
}
.agv-bg-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 72px 72px;
  opacity: 0;
}
.agv-active .agv-bg-grid {
  animation: agvFadeIn 1.2s ease 0.8s forwards;
}
.agv-bg-stripes {
  position: absolute; inset: 0;
  background-image: repeating-linear-gradient(
    -52deg,
    transparent, transparent 80px,
    rgba(255,255,255,0.008) 80px, rgba(255,255,255,0.008) 81px
  );
}
.agv-bg-glow {
  position: absolute;
  top: -300px; left: 50%;
  transform: translateX(-50%);
  width: 900px; height: 500px;
  background: radial-gradient(ellipse, rgba(200,0,0,0.18) 0%, transparent 68%);
  opacity: 0;
}
.agv-active .agv-bg-glow {
  animation: agvGlowReveal 1.5s ease 1s forwards, agvGlowPulse 5s ease-in-out 2.5s infinite;
}
@keyframes agvGlowReveal { to { opacity: 1; } }
@keyframes agvGlowPulse {
  0%, 100% { transform: translateX(-50%) scale(1);   opacity: 0.7; }
  50%       { transform: translateX(-50%) scale(1.1); opacity: 1;   }
}
.agv-bg-scanline {
  position: absolute;
  top: 50%; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(204,0,0,0.5) 20%,
    rgba(255,30,30,0.85) 50%,
    rgba(204,0,0,0.5) 80%,
    transparent 100%
  );
  transform: translateY(-50%);
  opacity: 0;
}
.agv-active .agv-bg-scanline {
  animation: agvScanReveal 0.6s ease 1.4s forwards, agvScanPulse 4s ease-in-out 2s infinite;
}
@keyframes agvScanReveal { to { opacity: 1; } }
@keyframes agvScanPulse {
  0%, 100% { opacity: 0.25; }
  50%       { opacity: 0.65; }
}
.agv-bg-vline {
  position: absolute;
  top: 80px; bottom: 80px;
  width: 1px;
  background: linear-gradient(180deg,
    transparent 0%,
    rgba(204,0,0,0.25) 25%,
    rgba(204,0,0,0.25) 75%,
    transparent 100%
  );
  opacity: 0;
}
.agv-active .agv-bg-vline {
  animation: agvFadeIn 0.8s ease 1.2s forwards;
}
.agv-bg-vline--left  { left: 60px; }
.agv-bg-vline--right { right: 60px; }

/* Corner brackets */
.agv-corner {
  position: absolute;
  width: 44px; height: 44px;
  opacity: 0;
}
.agv-active .agv-corner {
  animation: agvFadeIn 0.7s ease 1.3s forwards;
}
.agv-corner--tl { top: 40px;  left: 40px;  border-top: 1px solid rgba(204,0,0,0.6); border-left: 1px solid rgba(204,0,0,0.6); }
.agv-corner--tr { top: 40px;  right: 40px; border-top: 1px solid rgba(204,0,0,0.6); border-right: 1px solid rgba(204,0,0,0.6); }
.agv-corner--bl { bottom: 40px; left: 40px;  border-bottom: 1px solid rgba(204,0,0,0.6); border-left: 1px solid rgba(204,0,0,0.6); }
.agv-corner--br { bottom: 40px; right: 40px; border-bottom: 1px solid rgba(204,0,0,0.6); border-right: 1px solid rgba(204,0,0,0.6); }

/* Corner data labels */
.agv-corner-label {
  position: absolute;
  font-family: 'Share Tech Mono', monospace;
  font-size: 9px;
  letter-spacing: 0.2em;
  color: rgba(204,0,0,0.4);
  text-transform: uppercase;
  opacity: 0;
}
.agv-active .agv-corner-label {
  animation: agvFadeIn 0.7s ease 1.6s forwards;
}
.agv-corner-label--tl { top: 52px; left: 52px; }
.agv-corner-label--tr { top: 52px; right: 52px; text-align: right; }
.agv-corner-label--bl { bottom: 52px; left: 52px; }
.agv-corner-label--br { bottom: 52px; right: 52px; text-align: right; }

@keyframes agvFadeIn { to { opacity: 1; } }

/* ── GATE CARD ── */
.agv-gate {
  position: fixed; inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10010;
  padding: 24px;
}
.agv-gate-card {
  width: 100%;
  max-width: 500px;
  background: rgba(9,9,9,0.96);
  border: 1px solid rgba(255,255,255,0.07);
  position: relative;
  overflow: hidden;
  opacity: 0;
  transform: translateY(28px) scale(0.97);
}
.agv-active .agv-gate-card {
  animation: agvCardReveal 0.9s cubic-bezier(0.16,1,0.3,1) 0.1s forwards;
}
@keyframes agvCardReveal {
  to { opacity: 1; transform: translateY(0) scale(1); }
}
/* Red top sweep */
.agv-gate-card::before {
  content: '';
  position: absolute;
  top: 0; left: -100%; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--xp-red, #cc0000), var(--xp-red-bright, #ff1a1a), var(--xp-red, #cc0000), transparent);
}
.agv-active .agv-gate-card::before {
  animation: agvSweepIn 1s ease 0.4s forwards;
}
@keyframes agvSweepIn { to { left: 0; } }
/* Bottom-right corner accent */
.agv-gate-card::after {
  content: '';
  position: absolute;
  bottom: 0; right: 0;
  width: 64px; height: 64px;
  border-bottom: 1px solid rgba(204,0,0,0.25);
  border-right: 1px solid rgba(204,0,0,0.25);
}

/* ── HEADER ── */
.agv-card-header {
  padding: 44px 48px 0;
  text-align: center;
  opacity: 0;
}
.agv-active .agv-card-header {
  animation: agvFadeUp 0.7s ease 0.3s forwards;
}
.agv-logo-wrap {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 32px;
}
.agv-logo-pip {
  width: 2px; height: 32px;
  background: var(--xp-red, #cc0000);
  opacity: 0;
}
.agv-active .agv-logo-pip {
  animation: agvFadeIn 0.5s ease 0.6s forwards;
}
.agv-logo-text {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 22px;
  letter-spacing: 0.22em;
  color: var(--xp-white, #fff);
  line-height: 1;
}
.agv-logo-sub {
  font-family: 'Share Tech Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.55em;
  color: rgba(204,0,0,0.7);
  text-transform: uppercase;
  margin-top: 2px;
}

/* Expanding rule */
.agv-card-rule {
  height: 1px;
  margin: 0 48px;
  background: linear-gradient(90deg, transparent, rgba(204,0,0,0.5), rgba(204,0,0,0.5), transparent);
  transform: scaleX(0);
  transform-origin: center;
}
.agv-active .agv-card-rule {
  animation: agvRuleExpand 0.8s ease 0.5s forwards;
}
@keyframes agvRuleExpand { to { transform: scaleX(1); } }

/* ── BODY ── */
.agv-card-body {
  padding: 36px 48px 44px;
  text-align: center;
}
.agv-age-badge {
  display: inline-block;
  font-family: 'Share Tech Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.35em;
  color: var(--xp-red, #cc0000);
  text-transform: uppercase;
  padding: 6px 14px;
  border: 1px solid rgba(204,0,0,0.3);
  margin-bottom: 24px;
  opacity: 0;
}
.agv-active .agv-age-badge {
  animation: agvFadeUp 0.6s ease 0.4s forwards;
}
.agv-gate-headline {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 58px;
  line-height: 0.92;
  letter-spacing: 0.02em;
  color: var(--xp-white, #fff);
  text-transform: uppercase;
  margin-bottom: 22px;
  opacity: 0;
}
.agv-active .agv-gate-headline {
  animation: agvFadeUp 0.7s ease 0.5s forwards;
}
.agv-accent { color: var(--xp-red, #cc0000); }

/* Dot divider */
.agv-dot-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 22px;
  opacity: 0;
}
.agv-active .agv-dot-row {
  animation: agvFadeUp 0.6s ease 0.6s forwards;
}
.agv-dot {
  width: 4px; height: 4px;
  border-radius: 50%;
  background: rgba(204,0,0,0.5);
}
.agv-dot:nth-child(3) { background: var(--xp-red, #cc0000); transform: scale(1.5); }
.agv-dot-line {
  flex: 1; max-width: 60px; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(204,0,0,0.3));
}
.agv-dot-line:last-child {
  background: linear-gradient(270deg, transparent, rgba(204,0,0,0.3));
}

.agv-gate-copy {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 15px;
  font-weight: 300;
  letter-spacing: 0.06em;
  color: var(--xp-grey-text, rgba(255,255,255,0.38));
  line-height: 1.65;
  margin-bottom: 36px;
  max-width: 320px;
  margin-left: auto;
  margin-right: auto;
  opacity: 0;
}
.agv-active .agv-gate-copy {
  animation: agvFadeUp 0.6s ease 0.65s forwards;
}

/* ── BUTTONS ── */
.agv-btn-group {
  display: flex;
  gap: 12px;
  margin-bottom: 28px;
  opacity: 0;
}
.agv-active .agv-btn-group {
  animation: agvFadeUp 0.7s ease 0.75s forwards;
}
.agv-btn {
  flex: 1;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 18px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  border: none;
  cursor: pointer;
  padding: 18px 20px;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}
.agv-btn-primary {
  background: var(--xp-red, #cc0000);
  color: var(--xp-white, #fff);
}
.agv-btn-primary:hover {
  background: var(--xp-red-bright, #ff1a1a);
  transform: translateY(-2px);
  box-shadow: 0 10px 36px rgba(204,0,0,0.45);
}
.agv-btn-secondary {
  background: transparent;
  color: rgba(255,255,255,0.4);
  border: 1px solid rgba(255,255,255,0.1);
}
.agv-btn-secondary:hover {
  border-color: rgba(255,255,255,0.25);
  color: var(--xp-white, #fff);
  background: rgba(255,255,255,0.04);
}

/* ── FOOTER NOTE ── */
.agv-gate-note {
  font-family: 'Share Tech Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.2em;
  color: rgba(255,255,255,0.18);
  text-transform: uppercase;
  line-height: 1.9;
  opacity: 0;
}
.agv-active .agv-gate-note {
  animation: agvFadeIn 0.7s ease 1s forwards;
}
.agv-gate-note strong { color: rgba(255,255,255,0.3); }

/* ── EXIT STATE ── */
.agv-exit-overlay {
  position: fixed; inset: 0;
  background: var(--xp-black, #000);
  z-index: 10300;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.5s ease;
}
.agv-exit-overlay.active { opacity: 1; pointer-events: all; }
.agv-exit-headline {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 32px;
  letter-spacing: 0.3em;
  color: rgba(255,255,255,0.25);
  text-transform: uppercase;
}
.agv-exit-sub {
  font-family: 'Share Tech Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.25em;
  color: rgba(204,0,0,0.4);
  text-transform: uppercase;
}

@keyframes agvFadeUp {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
`;
