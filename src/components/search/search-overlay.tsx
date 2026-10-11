"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { useProducts } from "@/contexts/products-context";

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

const TRENDING_SEARCHES = ["Mountain Bike", "Electric Cycle", "Kids Bicycle", "Helmet", "U-Lock"];

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const { products } = useProducts();

  const results = useMemo(() => {
    if (query.length < 2) return [];

    const lower = query.toLowerCase();
    return products
      .filter(
        (p) =>
          p.isActive &&
          p.name.toLowerCase().includes(lower) ||
          p.description.toLowerCase().includes(lower) ||
          p.tags?.some((t) => t.toLowerCase().includes(lower))
      )
      .slice(0, 6);
  }, [products, query]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed inset-x-4 top-[10%] md:inset-x-0 md:mx-auto md:top-[12vh] w-auto md:w-full max-w-2xl h-fit max-h-[80vh] z-50 bg-background/70 dark:bg-background/60 backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-2xl overflow-hidden flex flex-col border border-white/20 dark:border-white/10"
          >
            {/* Search Input */}
            <div className="flex items-center gap-4 p-4 md:p-6 border-b border-border/40 dark:border-white/10">
              <Search size={22} className="text-primary shrink-0" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for cycles, accessories, gear..."
                className="flex-1 text-base md:text-lg bg-transparent outline-none placeholder:text-muted-foreground"
              />
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto custom-scrollbar">
              {/* Trending Searches */}
              {query.length === 0 && (
                <div className="p-4 md:p-6">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Trending Searches
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {TRENDING_SEARCHES.map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="px-4 py-2 bg-muted rounded-full text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Results */}
              {results.length > 0 && (
                <div className="p-4 md:p-6">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Results for &quot;{query}&quot;
                  </p>
                  <div className="space-y-2">
                    {results.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        onClick={onClose}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-colors group"
                      >
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                          <Image
                            src={product.thumbnail}
                            alt={product.name}
                            fill
                            sizes="60px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{product.brand}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-primary text-sm">
                            {formatPrice(product.salePrice ?? product.price)}
                          </p>
                          {product.salePrice && (
                            <p className="text-xs text-muted-foreground line-through">
                              {formatPrice(product.price)}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>

                  <Link
                    href={`/search?q=${encodeURIComponent(query)}`}
                    onClick={onClose}
                    className="block text-center mt-4 text-sm text-primary font-semibold hover:underline"
                  >
                    View all results for &quot;{query}&quot; →
                  </Link>
                </div>
              )}

              {/* No Results */}
              {query.length >= 2 && results.length === 0 && (
                <div className="p-6 text-center">
                  <p className="text-muted-foreground">No results found for &quot;{query}&quot;</p>
                  <p className="text-sm text-muted-foreground mt-1">Try a different keyword or browse our categories.</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
