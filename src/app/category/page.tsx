"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useCategories } from "@/contexts/categories-context";

export default function CategoryIndexPage() {
  const { categories: CATEGORIES } = useCategories();
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 lg:pt-24">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 py-10 md:py-14">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground mb-4">Explore categories</p>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">Shop by category</h1>
            <p className="mt-4 text-muted-foreground text-base md:text-lg">
              Browse premium bikes, accessories, and gear curated for every rider.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.45, ease: "easeOut" }}
                className="group rounded-[2rem] border border-border bg-card p-6 shadow-sm hover:shadow-xl transition-shadow"
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary text-3xl">
                  {category.id === "adult-cycles" ? "🚴" : category.id === "kids-bicycles" ? "🚲" :    "🧰"}
                </div>
                <h2 className="text-xl font-semibold mb-2">{category.name}</h2>
                <p className="text-sm text-muted-foreground mb-6">{category.description}</p>
                <Link
                  href={`/category/${category.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-foreground"
                >
                  Shop {category.name}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
