import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-4"
      style={{ paddingTop: "80px" }}
    >
      <p
        className="font-mono text-[10px] tracking-[0.55em] uppercase mb-4"
        style={{ color: "rgba(204,0,0,0.7)" }}
      >
        HTTP 404
      </p>
      <h1
        className="font-display text-7xl sm:text-9xl tracking-[0.1em] mb-4"
        style={{ color: "var(--xp-white)" }}
      >
        404
      </h1>
      <div className="w-12 h-[2px] mb-6" style={{ background: "var(--xp-red)" }} />
      <p
        className="font-heading text-base tracking-[0.08em] uppercase mb-10"
        style={{ color: "rgba(255,255,255,0.4)" }}
      >
        Page Not Found
      </p>
      <p
        className="font-mono text-sm mb-10 max-w-xs"
        style={{ color: "rgba(255,255,255,0.25)" }}
      >
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="font-heading text-sm tracking-[0.12em] uppercase px-8 py-3 transition-colors"
        style={{
          border: "1px solid var(--xp-red)",
          color: "var(--xp-white)",
          background: "transparent",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--xp-red)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        Go Back Home
      </Link>
    </div>
  );
}
