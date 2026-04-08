export default function Privacy() {
  return (
    <div className="min-h-screen pt-24 sm:pt-28 md:pt-36 pb-12 sm:pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-fade-in-up">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-silver-200 mb-2">Privacy Policy</h1>
          <p className="text-silver-500 text-sm mb-10">Last updated: April 2026</p>
        </div>

        <div className="prose prose-invert max-w-none text-silver-400 space-y-8">
          <section>
            <h2 className="text-silver-200 font-display text-xl font-bold mb-3">1. Information We Collect</h2>
            <p>When you use our website or place an order, we may collect the following information:</p>
            <ul className="list-disc ml-6 space-y-1 mt-2">
              <li>Name and contact information (email address, phone number)</li>
              <li>Shipping and billing address</li>
              <li>Order history and product preferences</li>
              <li>IP address and browser type</li>
              <li>Account login credentials (if you create an account)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-silver-200 font-display text-xl font-bold mb-3">2. How We Use Your Information</h2>
            <p>We use the collected information to:</p>
            <ul className="list-disc ml-6 space-y-1 mt-2">
              <li>Process and fulfill your orders</li>
              <li>Send order confirmations and shipping updates</li>
              <li>Respond to customer service inquiries</li>
              <li>Improve our website and services</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-silver-200 font-display text-xl font-bold mb-3">3. Data Protection & Security</h2>
            <p>We implement appropriate security measures to protect your personal information. We use bank transfers only, which means we never handle or store your card details or financial information.</p>
          </section>

          <section>
            <h2 className="text-silver-200 font-display text-xl font-bold mb-3">4. Third-Party Services</h2>
            <p>All third-party service providers are contractually obligated to protect your information and use it only for the purposes we specify. They are prohibited from using your information for their own marketing purposes.</p>
          </section>

          <section>
            <h2 className="text-silver-200 font-display text-xl font-bold mb-3">5. Cookies & Tracking Technologies</h2>
            <p>Our website uses essential cookies for cart functionality and user preferences. We do not use third-party tracking or advertising cookies.</p>
          </section>

          <section>
            <h2 className="text-silver-200 font-display text-xl font-bold mb-3">6. Your Privacy Rights</h2>
            <p>You have the right to access, correct, or delete your personal information. Contact us at support@xtremepeptides.nz to exercise these rights.</p>
          </section>

          <section>
            <h2 className="text-silver-200 font-display text-xl font-bold mb-3">7. Data Retention</h2>
            <p>We retain your personal information only for as long as necessary to fulfill the purposes outlined in this policy and as required by law.</p>
          </section>

          <section>
            <h2 className="text-silver-200 font-display text-xl font-bold mb-3">8. Children's Privacy</h2>
            <p>Our website is not intended for individuals under 18 years of age. If you believe we have inadvertently collected information from a minor, please contact us immediately and we will take steps to delete such information.</p>
          </section>

          <section>
            <h2 className="text-silver-200 font-display text-xl font-bold mb-3">9. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date.</p>
          </section>

          <section>
            <h2 className="text-silver-200 font-display text-xl font-bold mb-3">10. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, your personal information, or how to exercise your privacy rights, please contact us:</p>
            <p className="mt-2">Email: <a href="mailto:support@xtremepeptides.nz" className="text-cyan-400">support@xtremepeptides.nz</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
