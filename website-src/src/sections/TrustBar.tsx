import { FlaskConical, FileCheck, Truck, Package } from "lucide-react";

const badges = [
  { icon: FlaskConical, label: "HPLC Verified" },
  { icon: FileCheck, label: "Independent COAs" },
  { icon: Truck, label: "Fast Dispatch" },
  { icon: Package, label: "Plain Packaging" },
];

export default function TrustBar() {
  return (
    <section className="py-6 sm:py-10" style={{ borderTop: "1px solid var(--xp-border)", borderBottom: "1px solid var(--xp-border)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 stagger-children">
          {badges.map((badge) => (
            <div key={badge.label} className="flex items-center gap-3">
              <div className="p-2 shrink-0" style={{ border: "1px solid var(--xp-border-red)" }}>
                <badge.icon size={18} style={{ color: "var(--xp-red)" }} />
              </div>
              <span className="font-mono text-[10px] sm:text-xs tracking-[0.2em] uppercase" style={{ color: "var(--xp-grey-text)" }}>
                {badge.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
