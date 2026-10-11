"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Package } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { useStoreSettings } from "@/contexts/store-settings-context";
import { formatPrice } from "@/lib/utils";

export default function ShippingPage() {
  const { shippingRates } = useCart();
  const { settings } = useStoreSettings();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 lg:pt-32 pb-16 md:pb-24">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-4xl space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Shipping & Returns</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Shipping options available in this storefront preview and how to contact the store about an order.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid gap-8"
          >
            <div className="bg-card border border-border p-8 rounded-3xl">
              <h3 className="text-2xl font-bold mb-4">Shipping options</h3>
              <p className="text-muted-foreground leading-relaxed">
                These are the rates configured for this browser. Standard shipping is {shippingRates.freeShippingMinimum === 0 ? "free on every order" : `₹${shippingRates.standardShippingFee.toLocaleString("en-IN")}, or free above ${formatPrice(shippingRates.freeShippingMinimum)}`}. Express shipping is {formatPrice(shippingRates.expressShippingFee)} and overnight shipping is {formatPrice(shippingRates.overnightShippingFee)}. Delivery dates and carrier tracking are not connected to a live fulfillment service.
              </p>
            </div>

            <div className="bg-card border border-border p-8 rounded-3xl">
              <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
                <Package size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Order status</h3>
              <p className="text-muted-foreground leading-relaxed">
                Orders placed in this preview are saved in the current browser. The store administrator can update order status and add a carrier reference, which then appears on the local tracking page.
              </p>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none text-foreground/80 space-y-6">
              <h2 className="text-3xl font-bold text-foreground">Returns</h2>
              <p>
                Return requests and refunds are not processed by this preview. Contact the store before relying on a return or exchange policy.
              </p>
              <p>
                For an order question, email <a className="text-primary underline" href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a> with the order number.
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
