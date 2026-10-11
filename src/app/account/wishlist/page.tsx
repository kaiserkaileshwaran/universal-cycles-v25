"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useWishlist } from "@/contexts/wishlist-context";
import { ProductCard } from "@/components/products/product-card";
import { useProducts } from "@/contexts/products-context";

export default function WishlistPage() {
  const { wishlist } = useWishlist();
  const { products } = useProducts();
  const wishlisted = products.filter((product) => product.isActive && wishlist.includes(product.id));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 lg:pt-24">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 py-10 md:py-14">
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold">My Wishlist</h1>
            <p className="text-muted-foreground mt-2">Your saved favorites are waiting.</p>
          </div>

          {wishlisted.length === 0 ? (
            <div className="rounded-3xl border border-border bg-card p-10 text-center">
              <p className="text-xl font-semibold mb-3">Your wishlist is empty.</p>
              <p className="text-muted-foreground mb-6">Add some favorite cycles and gear to your wishlist to save them for later.</p>
              <Link href="/category/adult-cycles" className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {wishlisted.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
