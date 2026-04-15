import { useState, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";
import type { FaqSection } from "@/data/faq";

export default function FAQ() {
  const [sections, setSections] = useState<FaqSection[]>([]);
  const [activeSection, setActiveSection] = useState("general");
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/faq")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: FaqSection[]) => setSections(data))
      .catch(() => {});
  }, []);

  const currentSection = sections.find((s) => s.id === activeSection);

  const filteredItems = search
    ? sections.flatMap((s) =>
        s.items.filter(
          (item) =>
            item.question.toLowerCase().includes(search.toLowerCase()) ||
            item.answer.toLowerCase().includes(search.toLowerCase())
        )
      )
    : currentSection?.items || [];

  return (
    <div className="min-h-screen pt-24 sm:pt-28 md:pt-36 pb-12 sm:pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="section-header mb-10 animate-fade-in-up">
          <div className="section-label">— Support —</div>
          <h1 className="!text-3xl sm:!text-4xl">
            Frequently Asked <span className="text-accent">Questions</span>
          </h1>
          <div className="section-rule" />
          <p className="font-heading font-300 text-sm sm:text-base max-w-2xl mx-auto mt-4" style={{ color: "var(--xp-grey-text)" }}>
            Find answers to common questions about ordering, shipping, products, payment, legal compliance, and storage requirements.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--xp-grey-text)" }} />
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="xp-input pl-9 w-full"
          />
        </div>

        {!search && sections.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => { setActiveSection(s.id); setOpenQuestion(null); }}
                className="font-heading text-xs tracking-[0.1em] uppercase px-4 py-2 transition-colors"
                style={{
                  border: activeSection === s.id ? "1px solid var(--xp-red)" : "1px solid var(--xp-border)",
                  color: activeSection === s.id ? "var(--xp-white)" : "var(--xp-grey-text)",
                  background: activeSection === s.id ? "var(--xp-red-dim)" : "transparent",
                }}
              >
                {s.name}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-2">
          {filteredItems.map((item, i) => {
            const key = `${activeSection}-${i}`;
            const isOpen = openQuestion === key;
            return (
              <div key={key} className="card-dark overflow-hidden" style={{ border: "1px solid var(--xp-border)" }}>
                <button
                  onClick={() => setOpenQuestion(isOpen ? null : key)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left gap-4"
                >
                  <span className="font-heading text-sm sm:text-base tracking-[0.03em]" style={{ color: "var(--xp-white)" }}>
                    {item.question}
                  </span>
                  <ChevronDown
                    size={18}
                    className="shrink-0 transition-transform"
                    style={{ color: "var(--xp-red)", transform: isOpen ? "rotate(180deg)" : "none" }}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                    <p className="font-body text-sm whitespace-pre-line" style={{ color: "var(--xp-grey-text)" }}>
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
          {filteredItems.length === 0 && sections.length > 0 && (
            <p className="font-heading text-sm text-center py-8" style={{ color: "var(--xp-grey-text)" }}>
              No results found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
