import { useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════
   Global Background System — Xtreme Peptides NZ
   Grid + stripes + red glow aura + vlines + corners
   Bottom corners hide when footer is visible.
   ═══════════════════════════════════════════════ */

export default function GlobalBackground() {
  const blRef = useRef<HTMLDivElement>(null);
  const brRef = useRef<HTMLDivElement>(null);

  // Hide bottom corners when footer is on screen
  useEffect(() => {
    let observer: IntersectionObserver | null = null;

    const setup = () => {
      const footer = document.querySelector("footer");
      if (!footer || !blRef.current || !brRef.current) {
        // Footer not yet in DOM — retry
        const retry = setTimeout(setup, 200);
        return () => clearTimeout(retry);
      }

      observer = new IntersectionObserver(
        ([entry]) => {
          const hidden = entry.isIntersecting;
          if (blRef.current) blRef.current.style.opacity = hidden ? "0" : "1";
          if (brRef.current) brRef.current.style.opacity = hidden ? "0" : "1";
        },
        { threshold: 0 }
      );
      observer.observe(footer);
    };

    const cleanup = setup();
    return () => {
      if (typeof cleanup === "function") cleanup();
      observer?.disconnect();
    };
  }, []);

  return (
    <>
      <style>{bgStyles}</style>
      {/* Base layer: grid + stripes + glow (z-index 0) */}
      <div className="gbg" aria-hidden="true">
        <div className="gbg-grid" />
        <div className="gbg-stripes" />
        <div className="gbg-glow gbg-glow--top" />
        <div className="gbg-glow gbg-glow--mid-left" />
        <div className="gbg-glow gbg-glow--mid-right" />
        <div className="gbg-glow gbg-glow--bot" />
        <div className="gbg-vline gbg-vline--left" />
        <div className="gbg-vline gbg-vline--right" />
      </div>
      {/* Corner brackets (z-index 2) */}
      <div className="gbg-corners" aria-hidden="true">
        <div className="gbg-corner gbg-corner--tl" />
        <div className="gbg-corner gbg-corner--tr" />
        <div ref={blRef} className="gbg-corner gbg-corner--bl" style={{ transition: "opacity 0.3s ease" }} />
        <div ref={brRef} className="gbg-corner gbg-corner--br" style={{ transition: "opacity 0.3s ease" }} />
      </div>
    </>
  );
}

const bgStyles = `
.gbg {
  position: fixed; inset: 0;
  z-index: 0;
  pointer-events: none;
  background: var(--xp-black);
}
.gbg-corners {
  position: fixed; inset: 0;
  z-index: 2;
  pointer-events: none;
}
.gbg-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 72px 72px;
}
.gbg-stripes {
  position: absolute; inset: 0;
  background-image: repeating-linear-gradient(
    -52deg,
    transparent, transparent 80px,
    rgba(255,255,255,0.008) 80px, rgba(255,255,255,0.008) 81px
  );
}
/* ── Red aura glows — spread across viewport ── */
.gbg-glow {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 1000px; height: 600px;
  background: radial-gradient(ellipse, rgba(200,0,0,0.22) 0%, transparent 65%);
  animation: bgGlowPulse 5s ease-in-out infinite;
}
.gbg-glow--top {
  top: -250px;
}
.gbg-glow--mid-left {
  top: 40%;
  left: 20%;
  transform: translate(-50%, -50%);
  width: 800px; height: 500px;
  opacity: 0.4;
  animation-delay: -1.8s;
}
.gbg-glow--mid-right {
  top: 55%;
  left: 80%;
  transform: translate(-50%, -50%);
  width: 800px; height: 500px;
  opacity: 0.35;
  animation-delay: -3.5s;
}
.gbg-glow--bot {
  bottom: -250px;
  top: auto;
  opacity: 0.5;
  animation-delay: -1.2s;
}
/* ── Vertical accent lines ── */
.gbg-vline {
  position: absolute;
  top: 100px; bottom: 80px;
  width: 1px;
  background: linear-gradient(180deg,
    transparent 0%,
    rgba(204,0,0,0.25) 25%,
    rgba(204,0,0,0.25) 75%,
    transparent 100%
  );
}
.gbg-vline--left  { left: 60px; }
.gbg-vline--right { right: 60px; }
/* ── Corner brackets ── */
.gbg-corner {
  position: absolute;
  width: 44px; height: 44px;
}
.gbg-corner--tl { top: 100px;  left: 40px;  border-top: 1px solid rgba(204,0,0,0.6); border-left: 1px solid rgba(204,0,0,0.6); }
.gbg-corner--tr { top: 100px;  right: 40px; border-top: 1px solid rgba(204,0,0,0.6); border-right: 1px solid rgba(204,0,0,0.6); }
.gbg-corner--bl { bottom: 40px; left: 40px;  border-bottom: 1px solid rgba(204,0,0,0.6); border-left: 1px solid rgba(204,0,0,0.6); }
.gbg-corner--br { bottom: 40px; right: 40px; border-bottom: 1px solid rgba(204,0,0,0.6); border-right: 1px solid rgba(204,0,0,0.6); }
`;
