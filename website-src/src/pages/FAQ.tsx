import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { faqSections } from "@/data/faq";

export default function FAQ() {
  const [activeSection, setActiveSection] = useState("general");
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const currentSection = faqSections.find((s) => s.id === activeSection);

  const filteredItems = search
    ? faqSections.flatMap((s) =>
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="SEARCH FAQ..."
            className="xp-input !pl-10"
          />
        </div>

        {/* Category Tabs */}
        {!search && (
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {faqSections.map((section) => (
              <button
                key={section.id}
                onClick={() => { setActiveSection(section.id); setOpenQuestion(null); }}
                className="px-4 py-2 font-mono text-xs tracking-[0.15em] uppercase whitespace-nowrap transition-colors cursor-pointer"
                style={{
                  background: activeSection === section.id ? "var(--xp-red-dim)" : "transparent",
                  color: activeSection === section.id ? "var(--xp-red)" : "var(--xp-grey-text)",
                  border: activeSection === section.id ? "1px solid var(--xp-border-red)" : "1px solid var(--xp-border)",
                }}
              >
                {section.name}
              </button>
            ))}
          </div>
        )}

        {/* Questions */}
        <div className="space-y-3 stagger-children">
          {filteredItems.map((item, i) => {
            const key = `${item.question}-${i}`;
            const isOpen = openQuestion === key;
            return (
              <div key={key} className="card-dark overflow-hidden">
                <button
                  onClick={() => setOpenQuestion(isOpen ? null : key)}
                  className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
                  style={{ background: "transparent", border: "none" }}
                >
                  <span className="font-heading text-sm tracking-[0.04em] pr-4" style={{ color: "var(--xp-white)" }}>{item.question}</span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    style={{ color: "var(--xp-grey-text)" }}
                  />
                </button>
                <div
                  className="overflow-hidden transition-all duration-200 ease-in-out"
                  style={{ maxHeight: isOpen ? "500px" : "0px", opacity: isOpen ? 1 : 0 }}
                >
                  <div className="px-5 pb-5 font-body text-sm whitespace-pre-line" style={{ color: "var(--xp-grey-text)" }}>
                    {item.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <p className="text-center py-8 font-heading text-sm" style={{ color: "var(--xp-grey-text)" }}>No results found.</p>
        )}
      </div>
    </div>
  );
}
