"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const FAQS = [
  {
    q: "How long does shipping take?",
    a: "Standard shipping typically takes 3-5 business days within the continental US. Expedited shipping is available at checkout for 1-2 day delivery."
  },
  {
    q: "Do you ship internationally?",
    a: "Yes, we ship to over 50 countries worldwide. International shipping rates and times vary depending on the destination."
  },
  {
    q: "What is your return policy?",
    a: "We offer a 30-day return policy for unused items in their original packaging. Bicycles must be unridden and accessories must have tags attached."
  },
  {
    q: "Do the bicycles come fully assembled?",
    a: "Bicycles are shipped 85% assembled. You will need to attach the front wheel, pedals, handlebars, and seat. We include all necessary tools and detailed instructions."
  },
  {
    q: "Are the accessories safe for all ages?",
    a: "Yes, all our accessories meet or exceed international safety standards (ASTM, EN71). Age recommendations are listed on every product page."
  },
  {
    q: "How do I claim my warranty?",
    a: "Please visit our Warranty page or contact support@universalcycles.com with your order number and photos of the issue to initiate a claim."
  }
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 lg:pt-32 pb-16 md:pb-24">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12 lg:mb-20"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Frequently Asked Questions</h1>
            <p className="text-xl text-muted-foreground">Find answers to common questions about our products, shipping, and returns.</p>
          </motion.div>

          <div className="space-y-6">
            {FAQS.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 md:p-8 rounded-3xl bg-card border border-border"
              >
                <h3 className="text-xl font-bold mb-3 text-foreground">{faq.q}</h3>
                <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
