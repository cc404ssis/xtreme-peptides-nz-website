export default function Terms() {
  return (
    <div className="min-h-screen pt-24 sm:pt-28 md:pt-36 pb-12 sm:pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-fade-in-up">
          <div className="section-label text-center mb-4">— Legal —</div>
          <h1 className="!text-3xl sm:!text-4xl text-center">Terms & <span className="text-accent">Conditions</span></h1>
          <div className="section-rule" />
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-center mt-3" style={{ color: "var(--xp-grey-text)" }}>Last updated: April 2026</p>
        </div>

        <div className="space-y-8 mt-10">
          {[
            { title: "1. Acceptance of Terms", content: "By accessing and using the XTREME PEPTIDES NZ website, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use this website or purchase any products." },
            { title: "2. Age Restriction", content: "You must be 18 years of age or older to use this website and purchase products. By using our website, you confirm that you meet this age requirement." },
            { title: "3. Research Use Only — CRITICAL", content: "ALL PRODUCTS ARE FOR RESEARCH PURPOSES ONLY. By purchasing from XTREME PEPTIDES NZ, you acknowledge and agree that:", list: ["Products are intended exclusively for legitimate laboratory research", "Products are not for human consumption, veterinary use, or therapeutic application", "You are a qualified researcher or represent a research institution", "You will comply with all applicable laws and regulations"] },
            { title: "4. Product Information & Accuracy", content: "We make every effort to display accurate product information. However, we do not warrant that product descriptions, pricing, or other content is complete, reliable, or error-free." },
            { title: "5. Ordering & Payment", content: "All orders are subject to product availability and acceptance. We reserve the right to refuse any order for any reason, including but not limited to suspected misuse, violation of these terms, or shipping restrictions to your location.\n\nWe accept bank transfers only. Payment details are provided upon order confirmation." },
            { title: "6. Shipping & Delivery", content: "All orders are shipped in discrete packaging without external markings indicating contents. Temperature-sensitive products are shipped with appropriate cold-chain packaging." },
            { title: "7. Returns & Refunds", content: "IMPORTANT: Due to the nature of research chemicals, we have specific return policies.\n\nFor damaged or incorrect orders, contact us within 48 hours of delivery with photos of the damaged items. We will replace damaged products or issue a refund at our discretion." },
            { title: "8. Limitation of Liability", content: "All products are sold for research purposes only. Purchaser assumes full responsibility for compliance with all applicable laws and regulations. XTREME PEPTIDES NZ is not responsible for misuse of products." },
            { title: "9. Indemnification", content: "You agree to indemnify and hold XTREME PEPTIDES NZ harmless from any claims, damages, or expenses arising from your use of our products or violation of these terms." },
            { title: "10. Intellectual Property", content: "All content on this website, including but not limited to text, graphics, logos, images, and software, is the property of XTREME PEPTIDES NZ and is protected by copyright, trademark, and other intellectual property laws." },
            { title: "11. Governing Law", content: "These Terms & Conditions are governed by the laws of New Zealand." },
            { title: "12. Contact Us", content: "If you have any questions about these Terms & Conditions, please contact us:", email: "support@xtremepeptides.nz" },
          ].map((section) => (
            <section key={section.title}>
              <h2 className="!text-xl mb-3">{section.title}</h2>
              <p className="font-body text-sm whitespace-pre-line" style={{ color: "var(--xp-grey-text)" }}>{section.content}</p>
              {section.list && (
                <ul className="list-disc ml-6 space-y-1 mt-2">
                  {section.list.map((item) => (
                    <li key={item} className="font-body text-sm" style={{ color: "var(--xp-grey-text)" }}>{item}</li>
                  ))}
                </ul>
              )}
              {section.email && (
                <p className="font-body text-sm mt-2" style={{ color: "var(--xp-grey-text)" }}>
                  Email: <a href={`mailto:${section.email}`}>{section.email}</a>
                </p>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
