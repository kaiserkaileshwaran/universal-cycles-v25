"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import Image from "next/image";
import { useStoreSettings } from "@/contexts/store-settings-context";

export default function AboutPage() {
  const { settings } = useStoreSettings();
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 lg:pt-32 pb-16 md:pb-24">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Our Story</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {settings.description}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative aspect-video rounded-3xl overflow-hidden mb-16"
          >
            <Image
              src="/background-landscape.png"
              alt={`${settings.storeName} cycling collection`}
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
            />
          </motion.div>

          <div className="prose prose-lg dark:prose-invert max-w-none space-y-8 text-foreground/80">
            <p className="text-xl leading-relaxed">
              {settings.storeName} brings bicycles and cycling essentials together in one place. Explore the catalog, compare product details, and choose equipment that fits your next ride.
            </p>
            <p className="text-lg">
              The catalog includes bikes and accessories across several categories. Product pages show current pricing, stock information, specifications, and any listed warranty details.
            </p>
            
            <div className="grid md:grid-cols-2 gap-12 py-8">
              <div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Our Mission</h3>
                <p>Make it easier to find the right bike or cycling accessory for your route, budget, and riding style.</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Our Vision</h3>
                <p>Offer a clear, useful shopping experience for riders, from browsing products through checking an order saved in the store preview.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
