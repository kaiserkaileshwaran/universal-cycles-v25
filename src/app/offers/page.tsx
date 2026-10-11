"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Tag, Clock, Copy, Check } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ProductCard } from "@/components/products/product-card";
import { useProducts } from "@/contexts/products-context";

const COUPONS = [
  { code: "WELCOME10", desc: "10% off orders above ₹5,000", min: "₹5,000" },
  { code: "CYCLE20", desc: "₹2,000 off orders above ₹20,000", min: "₹20,000" },
  { code: "SAVE50", desc: "₹5,000 off orders above ₹50,000", min: "₹50,000" },
  { code: "FREESHIP", desc: "Free standard shipping", min: "No minimum" },
  { code: "WHEEL25", desc: "25% off eligible order", min: "No minimum" },
  { code: "FIVE5", desc: "₹500 off eligible order", min: "No minimum" },
];

const BANNERS = [
  {
    title: "End of Season Sale",
    subtitle: "Compare live sale prices on selected cycles",
    cta: "Shop Cycles",
    href: "/category/adult-cycles",
    bg: "from-primary to-primary/80",
  },
  {
    title: "Kids Fiesta",
    subtitle: "Browse bikes for growing riders",
    cta: "Shop Kids Bikes",
    href: "/category/kids-bicycles",
    bg: "from-amber-500 to-orange-600",
  },
  {
    title: "Accessory Sale",
    subtitle: "Explore helmets, locks, lights, and riding essentials",
    cta: "Shop accessories",
    href: "/category/accessories",
    bg: "from-purple-600 to-indigo-600",
  },
];

export default function OffersPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { products } = useProducts();
  const saleProducts = products.filter((p) => p.isActive && p.salePrice);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 lg:pt-24">
        {/* Hero */}
        <div className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground py-16 text-center px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Tag size={40} className="text-accent mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-3">Deals & Offers</h1>
            <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto">
              Current sale prices and checkout coupon codes — all in one place.
            </p>
          </motion.div>
        </div>

        <div className="container mx-auto px-4 md:px-8 lg:px-12 py-12 space-y-16">
          {/* Deal Banners */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BANNERS.map((banner, i) => (
              <motion.div
                key={banner.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={banner.href}>
                  <div className={`relative bg-gradient-to-br ${banner.bg} text-white rounded-2xl p-8 h-48 flex flex-col justify-end overflow-hidden group`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-8 -translate-y-8" />
                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full -translate-x-6 translate-y-6" />
                    <div className="relative z-10">
                      <h3 className="text-xl font-bold">{banner.title}</h3>
                      <p className="text-sm text-white/80 mt-1 mb-3">{banner.subtitle}</p>
                      <span className="inline-flex items-center gap-1 bg-white text-primary px-4 py-1.5 rounded-full text-sm font-bold group-hover:scale-105 transition-transform">
                        {banner.cta} →
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Coupon Codes */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Coupon Codes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {COUPONS.map((coupon, i) => (
                <motion.div
                  key={coupon.code}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="border-2 border-dashed border-primary/40 rounded-2xl p-5 bg-primary/5 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-lg text-primary">{coupon.code}</span>
                    <button
                      onClick={() => copyCode(coupon.code)}
                      className="p-1.5 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                    >
                      {copiedCode === coupon.code ? <Check size={16} className="text-green-600" /> : <Copy size={16} className="text-primary" />}
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground">{coupon.desc}</p>
                  <div className="mt-auto space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock size={12} /> Available coupon
                    </div>
                    <p className="text-xs text-muted-foreground">Min. order: {coupon.min}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sale Products */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-6">On Sale Now 🔥</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {saleProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Spin CTA */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-400 to-orange-500 p-12 text-center text-white">
            <div className="absolute inset-0 opacity-10 text-9xl flex items-center justify-center">🎰</div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">Try Your Luck!</h2>
              <p className="text-white/80 text-lg mb-6">Take your daily spin for a chance at coupon discounts, shipping perks, and reward points.</p>
              <Link
                href="/spin-wheel"
                className="inline-block bg-white text-amber-600 px-10 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl"
              >
                🎡 Spin Now — It&apos;s Free!
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
