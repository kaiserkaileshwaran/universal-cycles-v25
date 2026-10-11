"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ProductCard } from "@/components/products/product-card";
import { useProducts } from "@/contexts/products-context";

export default function SearchPage() {
  const { products } = useProducts();
  const [query, setQuery] = useState("");
  useEffect(() => {
    // Read the deep-link query after hydration to avoid a server/client mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery(new URLSearchParams(window.location.search).get("q") ?? "");
  }, []);
  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    return products.filter((product) => product.isActive && (!term || `${product.name} ${product.brand} ${product.description} ${product.categoryId}`.toLowerCase().includes(term)));
  }, [products, query]);

  return <div className="min-h-screen bg-background"><Navbar /><main className="container mx-auto min-h-[70vh] max-w-7xl px-4 pb-16 pt-28 md:px-8 lg:px-12">
    <div className="mx-auto mb-10 max-w-2xl text-center"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Product finder</p><h1 className="mt-2 text-3xl font-bold md:text-4xl">Search cycles and gear</h1>
      <label className="relative mt-6 block"><Search aria-hidden="true" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" /><input aria-label="Search products" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try a brand, model, or category" className="h-14 w-full rounded-2xl border border-border bg-card pl-12 pr-4 shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" /></label>
    </div>
    <div className="mb-4 text-sm text-muted-foreground">{results.length} product{results.length === 1 ? "" : "s"} found</div>
    {results.length ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">{results.map((product, index) => <ProductCard key={product.id} product={product} priority={index === 0} />)}</div> : <div className="rounded-2xl border border-dashed border-border py-16 text-center"><p className="font-semibold">No matching products</p><p className="mt-1 text-sm text-muted-foreground">Try another product name or brand.</p></div>}
  </main><Footer /></div>;
}
