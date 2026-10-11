"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, SlidersHorizontal, Grid3X3, List, X, ArrowUpDown, ChevronDown } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ProductCard } from "@/components/products/product-card";
import { SORT_OPTIONS } from "@/constants";
import { useBrands } from "@/contexts/brands-context";
import { useCategories } from "@/contexts/categories-context";
import { Product } from "@/types";
import { cn } from "@/lib/utils";
import { useProducts } from "@/contexts/products-context";

type ViewMode = "grid" | "list";

export default function CategoryPage() {
  const { categories: CATEGORIES } = useCategories();
  const { brands } = useBrands();
  const params = useParams();
  const slug = params?.slug as string;
  const { products: catalogProducts } = useProducts();

  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);

  const category = CATEGORIES.find((c) => c.slug === slug || c.subcategories.find((s) => s.slug === slug));

  let products = catalogProducts.filter((product) => product.isActive) as Product[];

  // Filter by category or subcategory
  if (category && slug && slug !== "all") {
    const matchedSub = category.subcategories.find(s => s.slug === slug);
    if (matchedSub) {
      products = products.filter(p => p.subcategoryId === matchedSub.id);
    } else {
      products = products.filter(p => p.categoryId === category.id);
    }
  }

  // Filter by brand
  if (selectedBrands.length > 0) {
    products = products.filter((p) => selectedBrands.includes(p.brand));
  }

  // Filter by price
  products = products.filter((p) => {
    const price = p.salePrice ?? p.price;
    return price >= priceRange[0] && price <= priceRange[1];
  });

  if (onSaleOnly) products = products.filter((p) => !!p.salePrice);
  if (inStockOnly) products = products.filter((p) => p.stock > 0);

  // Sort
  if (sortBy === "price-asc") {
    products = [...products].sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
  } else if (sortBy === "price-desc") {
    products = [...products].sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
  } else if (sortBy === "rating") {
    products = [...products].sort((a, b) => b.rating - a.rating);
  } else if (sortBy === "newest") {
    products = [...products].sort((a, b) => b.createdAt - a.createdAt);
  }

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const FilterSidebarContent = (
    <div className="space-y-6 p-1">
      {/* Brands */}
      <div className="border border-border rounded-2xl p-5 bg-card">
        <h3 className="font-semibold mb-4">Brand</h3>
        <div className="space-y-2">
          {brands.slice(0, 8).map((brand) => (
            <label key={brand.id} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand.name)}
                onChange={() => toggleBrand(brand.name)}
                className="rounded border-border accent-primary"
              />
              <span className="text-sm group-hover:text-primary transition-colors">
                {brand.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="border border-border rounded-2xl p-5 bg-card">
        <h3 className="font-semibold mb-4">Price Range</h3>
        <div className="space-y-3">
          <input
            type="range"
            min={0}
            max={500000}
            step={1000}
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>₹{priceRange[0].toLocaleString("en-IN")}</span>
            <span>₹{priceRange[1].toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="border border-border rounded-2xl p-5 bg-card">
        <h3 className="font-semibold mb-4">Quick Filters</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={onSaleOnly}
              onChange={(e) => setOnSaleOnly(e.target.checked)}
              className="rounded border-border accent-primary"
            />
            <span className="text-sm">On Sale</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="rounded border-border accent-primary"
            />
            <span className="text-sm">In Stock Only</span>
          </label>
        </div>
      </div>

      {/* Clear Filters */}
      {(selectedBrands.length > 0 || onSaleOnly || inStockOnly) && (
        <button
          onClick={() => {
            setSelectedBrands([]);
            setOnSaleOnly(false);
            setInStockOnly(false);
            setPriceRange([0, 500000]);
          }}
          className="w-full text-sm text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 justify-center py-2"
        >
          <X size={14} /> Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Breadcrumb */}
      <div className="pt-20 lg:pt-24 border-b">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight size={14} />
            <span className="text-foreground font-medium capitalize">
              {category?.name ?? slug.replace(/-/g, " ")}
            </span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold capitalize">
            {category?.name ?? slug.replace(/-/g, " ")}
          </h1>
          {category?.description && (
            <p className="text-muted-foreground mt-2">{category.description}</p>
          )}
          <p className="text-sm text-muted-foreground mt-1">{products.length} products found</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 space-y-6">
              {FilterSidebarContent}
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="mb-6 flex flex-wrap items-center gap-3">
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setFiltersOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium shadow-sm transition-colors hover:border-primary/40 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
              >
                <SlidersHorizontal size={16} />
                Filters
                {(selectedBrands.length > 0 || onSaleOnly || inStockOnly) && (
                  <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {selectedBrands.length + (onSaleOnly ? 1 : 0) + (inStockOnly ? 1 : 0)}
                  </span>
                )}
              </button>

              <div className="flex w-full min-w-0 items-center gap-2 sm:ml-auto sm:w-auto sm:gap-3">
                {/* Sort */}
                <div className="relative min-w-0 flex-1 sm:w-56 sm:flex-none">
                  <ArrowUpDown
                    size={16}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-primary"
                  />
                  <select
                    id="product-sort"
                    aria-label="Sort products"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="h-11 w-full appearance-none rounded-xl border border-border bg-card pl-10 pr-10 text-sm font-medium shadow-sm transition-colors hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    aria-hidden="true"
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                </div>

                {/* View Toggle */}
                <div className="flex h-11 shrink-0 rounded-xl border border-border bg-card p-1 shadow-sm">
                  <button
                    onClick={() => setViewMode("grid")}
                    aria-label="Show products as a grid"
                    aria-pressed={viewMode === "grid"}
                    className={cn(
                      "flex w-9 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      viewMode === "grid" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Grid3X3 size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    aria-label="Show products as a list"
                    aria-pressed={viewMode === "list"}
                    className={cn(
                      "flex w-9 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      viewMode === "list" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Products */}
            {products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-4xl mb-4">🔍</p>
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground">Try adjusting your filters.</p>
              </div>
            ) : (
              <div
                className={cn(
                  "gap-6",
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                    : "flex flex-col"
                )}
              >
                {products.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <ProductCard product={product} layout={viewMode} priority={i === 0} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFiltersOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-background shadow-2xl flex flex-col lg:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-bold">Filters</h2>
                <button onClick={() => setFiltersOpen(false)} className="p-2 hover:bg-muted rounded-full">
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 flex-1 overflow-y-auto">
                {FilterSidebarContent}
              </div>
              <div className="p-4 border-t bg-background">
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium shadow-md"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
