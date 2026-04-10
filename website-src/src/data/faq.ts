export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqSection {
  id: string;
  name: string;
  items: FaqItem[];
}

export const faqSections: FaqSection[] = [
  {
    id: "general",
    name: "General",
    items: [
      {
        question: "What payment methods do you accept?",
        answer: "We accept bank transfers only. After placing your order, you'll receive an order confirmation with our bank account details. Transfer the total amount using your online banking and include your order reference number (e.g., XP-12345).\nOnce we verify your payment (usually within 24 hours), your order will be processed and shipped.",
      },
      {
        question: "How long does shipping take?",
        answer: "Express Shipping - Business day overnight for $16. Rural Delivery - 1-2 business days for $22. All orders include tracked delivery across New Zealand.",
      },
      {
        question: "Do you offer international shipping?",
        answer: "Currently, we only ship within New Zealand due to customs regulations surrounding research chemicals. We are working on expanding to Australia and other markets in the future.",
      },
      {
        question: "Is the packaging discrete?",
        answer: "Yes, all orders are shipped in plain packaging without any branding or indication of contents. The return address shows only our company initials to ensure privacy. Your order will appear as a generic laboratory supply shipment.",
      },
      {
        question: "What are the shipping costs?",
        answer: "Express Shipping is $16 for all orders. Rural Delivery is $22. All shipping costs include tracking and signature required.",
      },
      {
        question: "Can I track my order?",
        answer: "Yes, all shipments include tracking. You will receive a tracking number via email once your order is dispatched. You can track your package through the courier website or contact us for assistance.",
      },
    ],
  },
  {
    id: "products",
    name: "Products",
    items: [
      {
        question: "What purity levels do your products have?",
        answer: "All our peptides are HPLC-tested with a minimum purity of 99.897%. Each batch is independently tested by third-party laboratories, and Certificates of Analysis (COAs) are available upon request. We maintain strict quality control standards.",
      },
      {
        question: "How should I store the products?",
        answer: "Unopened lyophilized peptides should be stored at -20\u00B0C (freezer) for maximum stability. Once reconstituted with bacteriostatic water, store at 2-8\u00B0C (refrigerator) and use within 30 days. Always protect from light and moisture.",
      },
      {
        question: "What is the shelf life of your products?",
        answer: "Lyophilized peptides have a shelf life of 24 months when stored properly at -20\u00B0C. Each product label includes a batch number and expiry date. Reconstituted peptides should be used within 30 days.",
      },
      {
        question: "Do you provide Certificates of Analysis?",
        answer: "Yes, batch-specific COAs are included with every shipment. COAs include HPLC purity data, mass spectrometry results, and batch information.",
      },
      {
        question: "What form do the products come in?",
        answer: "Most peptides are supplied as lyophilized (freeze-dried) powder in sterile vials. This form provides maximum stability during shipping and storage. Bacteriostatic water for reconstitution is sold separately.",
      },
      {
        question: "Are your products pharmaceutical grade?",
        answer: "Our products are research-grade compounds intended for laboratory research purposes. While we maintain pharmaceutical-level quality standards (99.8%+ purity), these products are not approved for human consumption or medical use.",
      },
    ],
  },
  {
    id: "payment",
    name: "Payment",
    items: [
      {
        question: "Is my payment information secure?",
        answer: "Yes. We use bank transfers only, which means we never handle or store your card details or financial information.\nWe take privacy seriously - your information is never shared with third parties and is used solely for order fulfillment.",
      },
      {
        question: "Will the charge appear discreetly on my statement?",
        answer: 'Yes, your bank transfer will appear as a payment to "Xtreme Peptides" or similar description. We recommend using your order number as the payment reference for easy tracking.',
      },
      {
        question: "Do you offer refunds?",
        answer: "Due to the nature of research chemicals, we cannot accept returns or offer refunds on opened products. Unopened products may be returned within 14 days of delivery if there is a quality issue. Quality issues are reviewed against your order record.",
      },
      {
        question: "Do you offer bulk pricing?",
        answer: "Volume discounts are available for orders over $500 — applied automatically at checkout where applicable.",
      },
    ],
  },
  {
    id: "legal-compliance",
    name: "Legal & Compliance",
    items: [
      {
        question: "Are these products legal in New Zealand?",
        answer: "Yes, research peptides are legal to purchase and possess in New Zealand for legitimate research purposes. Our products are sold explicitly for laboratory research only. Customers must be 18 years or older and agree to our Terms & Conditions.",
      },
      {
        question: "Do I need a license to purchase?",
        answer: "No special license is required to purchase research peptides in New Zealand. However, you must confirm you are 18+ and agree to use products only for lawful research purposes. We reserve the right to refuse service to any customer.",
      },
      {
        question: "What are the products intended for?",
        answer: "Our products are sold strictly for laboratory research purposes only. They are not intended for human consumption, veterinary use, or any application involving living subjects. By purchasing, you confirm you are a qualified researcher or represent a research institution.",
      },
      {
        question: "What happens if customs seizes my order?",
        answer: "As we only ship within New Zealand, customs issues do not apply. For any shipping issues within NZ, we will work with you and the courier to resolve the situation. Please ensure your delivery address is accurate and accessible.",
      },
      {
        question: "Do you report purchases to authorities?",
        answer: "We maintain customer confidentiality and do not report individual purchases to authorities. We comply with all applicable New Zealand laws and regulations. In the unlikely event of a legal inquiry, we would follow proper legal procedures.",
      },
    ],
  },
  {
    id: "storage-handling",
    name: "Storage & Handling",
    items: [
      {
        question: "How are products shipped to maintain stability?",
        answer: "Lyophilized peptides are shipped at ambient temperature and are stable during transit. For temperature-sensitive orders, we use insulated packaging with cold packs. All shipments include tracking and require signature upon delivery.",
      },
      {
        question: "What should I do if my product arrives damaged?",
        answer: "If your product arrives damaged, do not use it. Take photos of the damage. Damage claims must be raised within 48 hours of delivery via your order record. We will arrange a replacement or refund after reviewing the issue.",
      },
      {
        question: "Can I travel with these products?",
        answer: "We do not recommend traveling with research chemicals. Different jurisdictions have varying laws regarding these compounds. If you must travel, research the laws of your destination thoroughly and carry appropriate documentation.",
      },
      {
        question: "How do I properly dispose of expired products?",
        answer: "Expired or unwanted research chemicals should be disposed of according to your institution's chemical waste protocols or local hazardous waste regulations. Do not dispose of in regular trash or pour down drains. Contact your local council for guidance.",
      },
    ],
  },
];
