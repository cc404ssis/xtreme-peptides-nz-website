/* ═══════════════════════════════════════════════
   Global Background System — Xtreme Peptides NZ
   Persistent layer behind all page content.
   Grid + stripes + glow + vlines + corners
   ═══════════════════════════════════════════════ */

export default function GlobalBackground() {
  return (
    <>
      <style>{bgStyles}</style>
      {/* Base layer: grid + stripes + glow (behind content, z-index 0) */}
      <div className="gbg" aria-hidden="true">
        <div className="gbg-grid" />
        <div className="gbg-stripes" />
        <div className="gbg-glow gbg-glow--top" />
        <div className="gbg-glow gbg-glow--mid" />
        <div className="gbg-glow gbg-glow--bot" />
        <div className="gbg-vline gbg-vline--left" />
        <div className="gbg-vline gbg-vline--right" />
      </div>
      {/* Corner brackets: above content + footer (z-index 2) */}
      <div className="gbg-corners" aria-hidden="true">
        <div className="gbg-corner gbg-corner--tl" />
        <div className="gbg-corner gbg-corner--tr" />
        <div className="gbg-corner gbg-corner--bl" />
        <div className="gbg-corner gbg-corner--br" />
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
.gbg-glow {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 900px; height: 500px;
  background: radial-gradient(ellipse, rgba(200,0,0,0.18) 0%, transparent 68%);
  animation: bgGlowPulse 5s ease-in-out infinite;
}
.gbg-glow--top {
  top: -300px;
}
.gbg-glow--mid {
  top: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.5;
  animation-delay: -2.5s;
}
.gbg-glow--bot {
  bottom: -300px;
  top: auto;
  opacity: 0.6;
  animation-delay: -1.2s;
}
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
.gbg-corner {
  position: absolute;
  width: 44px; height: 44px;
}
.gbg-corner--tl { top: 100px;  left: 40px;  border-top: 1px solid rgba(204,0,0,0.6); border-left: 1px solid rgba(204,0,0,0.6); }
.gbg-corner--tr { top: 100px;  right: 40px; border-top: 1px solid rgba(204,0,0,0.6); border-right: 1px solid rgba(204,0,0,0.6); }
.gbg-corner--bl { bottom: 40px; left: 40px;  border-bottom: 1px solid rgba(204,0,0,0.6); border-left: 1px solid rgba(204,0,0,0.6); }
.gbg-corner--br { bottom: 40px; right: 40px; border-bottom: 1px solid rgba(204,0,0,0.6); border-right: 1px solid rgba(204,0,0,0.6); }
`;
