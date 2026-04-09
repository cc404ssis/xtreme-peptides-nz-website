export default function Privacy() {
  return (
    <div className="min-h-screen pt-24 sm:pt-28 md:pt-36 pb-12 sm:pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-fade-in-up">
          <div className="section-label text-center mb-4">— Legal —</div>
          <h1 className="!text-3xl sm:!text-4xl text-center">Privacy <span className="text-accent">Policy</span></h1>
          <div className="section-rule" />
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-center mt-3" style={{ color: "var(--xp-grey-text)" }}>Last updated: April 2026</p>
        </div>

        <div className="space-y-8 mt-10">
          {[
            { title: "1. Information We Collect", content: "When you use our website or place an order, we may collect the following information:", list: ["Name and contact information (email address, phone number)", "Shipping and billing address", "Order history and product preferences", "IP address and browser type", "Account login credentials (if you create an account)"] },
            { title: "2. How We Use Your Information", content: "We use the collected information to:", list: ["Process and fulfill your orders", "Send order confirmations and shipping updates", "Respond to customer service inquiries", "Improve our website and services", "Comply with legal obligations"] },
            { title: "3. Data Protection & Security", content: "We implement appropriate security measures to protect your personal information. We use bank transfers only, which means we never handle or store your card details or financial information." },
            { title: "4. Third-Party Services", content: "All third-party service providers are contractually obligated to protect your information and use it only for the purposes we specify. They are prohibited from using your information for their own marketing purposes." },
            { title: "5. Cookies & Tracking Technologies", content: "Our website uses essential cookies for cart functionality and user preferences. We do not use third-party tracking or advertising cookies." },
            { title: "6. Your Privacy Rights", content: "You have the right to access, correct, or delete your personal information. Contact us at support@xtremepeptides.nz to exercise these rights." },
            { title: "7. Data Retention", content: "We retain your personal information only for as long as necessary to fulfill the purposes outlined in this policy and as required by law." },
            { title: "8. Children's Privacy", content: "Our website is not intended for individuals under 18 years of age. If you believe we have inadvertently collected information from a minor, please contact us immediately and we will take steps to delete such information." },
            { title: "9. Changes to This Policy", content: "We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date." },
            { title: "10. Contact Us", content: "If you have any questions about this Privacy Policy, your personal information, or how to exercise your privacy rights, please contact us:", email: "support@xtremepeptides.nz" },
          ].map((section) => (
            <section key={section.title}>
              <h2 className="!text-xl mb-3">{section.title}</h2>
              <p className="font-body text-sm" style={{ color: "var(--xp-grey-text)" }}>{section.content}</p>
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
