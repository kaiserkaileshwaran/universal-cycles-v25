"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Mail, Phone, MapPin } from "lucide-react";
import { useMarketing } from "@/contexts/marketing-context";
import { useStoreSettings } from "@/contexts/store-settings-context";

export default function ContactPage() {
  const { sendMessage } = useMarketing();
  const { settings } = useStoreSettings();
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    sendMessage({ firstName: String(fields.get("firstName") ?? "").trim(), lastName: String(fields.get("lastName") ?? "").trim(), email: String(fields.get("email") ?? "").trim(), message: String(fields.get("message") ?? "").trim() });
    event.currentTarget.reset();
    setSubmitted(true);
  };
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 lg:pt-32 pb-16 md:pb-24">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Get in Touch</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Have a question about a product, your order, or just want to say hi? We are here to help.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold mb-8">Send us a message</h2>
              {submitted && <p role="status" className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">Your message is saved on this browser. Store staff can view it in Admin → Messages.</p>}
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">First Name</label>
                    <input name="firstName" type="text" required maxLength={80} className="w-full p-3 rounded-xl border border-border bg-background outline-none focus:border-primary" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Last Name</label>
                    <input name="lastName" type="text" required maxLength={80} className="w-full p-3 rounded-xl border border-border bg-background outline-none focus:border-primary" placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <input name="email" type="email" required maxLength={254} className="w-full p-3 rounded-xl border border-border bg-background outline-none focus:border-primary" placeholder="john@example.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <textarea name="message" rows={5} required maxLength={5000} className="w-full p-3 rounded-xl border border-border bg-background outline-none focus:border-primary resize-none" placeholder="How can we help?" />
                </div>
                <button type="submit" className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold shadow-md hover:bg-primary/90 transition-colors">
                  Send Message
                </button>
              </form>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-border rounded-3xl p-8 lg:p-12 space-y-12"
            >
              <div>
                <h3 className="text-xl font-bold mb-6">Contact Information</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Store Address</p>
                      <p className="text-muted-foreground mt-1">Erode, Tamil Nadu, India</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Phone size={24} />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Phone</p>
                      <p className="text-muted-foreground mt-1">9876543210<br/>Mon-Fri, 9am - 6pm IST</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Mail size={24} />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Email</p>
                      <a href={`mailto:${settings.contactEmail}`} className="text-muted-foreground mt-1 hover:text-primary">{settings.contactEmail}</a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
