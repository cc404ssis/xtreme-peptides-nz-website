import { FlaskConical, FileCheck, Truck, Package } from "lucide-react";

const badges = [
  { icon: FlaskConical, title: "HPLC Verified", description: "HPLC verified" },
  { icon: FileCheck, title: "Independent COAs", description: "Independent COAs" },
  { icon: Truck, title: "Fast Dispatch", description: "Fast local dispatch" },
  { icon: Package, title: "Plain Packaging", description: "Plain packaging" },
];

export default function TrustBar() {
  return (
    <section className="bg-navy-900/50 border-y border-cyan-400/10 py-5 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 stagger-children">
          {badges.map((badge) => (
            <div
              key={badge.title}
              className="flex items-center gap-2.5 sm:gap-3"
            >
              <div className="p-2 sm:p-2.5 rounded-lg bg-cyan-400/10 text-cyan-400 shrink-0">
                <badge.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <p className="text-silver-200 font-medium text-xs sm:text-sm">{badge.title}</p>
                <p className="text-silver-500 text-[10px] sm:text-xs hidden sm:block">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
