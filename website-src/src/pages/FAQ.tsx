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
        <div className="text-center mb-10 animate-fade-in-up">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-silver-200 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-silver-400">
            Find answers to common questions about ordering, shipping, products, payment, legal compliance, and storage requirements.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-silver-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search FAQ..."
            className="w-full pl-10 pr-4 py-2.5 bg-navy-800/80 border border-cyan-400/20 rounded-lg text-sm text-silver-200 placeholder-silver-500 focus:outline-none focus:border-cyan-400/50"
          />
        </div>

        {/* Category Tabs */}
        {!search && (
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {faqSections.map((section) => (
              <button
                key={section.id}
                onClick={() => { setActiveSection(section.id); setOpenQuestion(null); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeSection === section.id
                    ? "bg-cyan-400/10 text-cyan-400 border border-cyan-400/30"
                    : "bg-navy-800/50 text-silver-400 border border-cyan-400/10 hover:border-cyan-400/20"
                }`}
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
              <div
                key={key}
                className="card-dark overflow-hidden"
              >
                <button
                  onClick={() => setOpenQuestion(isOpen ? null : key)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="text-silver-200 font-medium pr-4">{item.question}</span>
                  <ChevronDown
                    size={18}
                    className={`text-silver-500 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  className="overflow-hidden transition-all duration-200 ease-in-out"
                  style={{
                    maxHeight: isOpen ? "500px" : "0px",
                    opacity: isOpen ? 1 : 0,
                  }}
                >
                  <div className="px-5 pb-5 text-silver-400 text-sm whitespace-pre-line">
                    {item.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <p className="text-center text-silver-500 py-8">No results found.</p>
        )}
      </div>
    </div>
  );
}
