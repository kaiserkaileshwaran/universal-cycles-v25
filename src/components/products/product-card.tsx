"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Product } from "@/types";
import { formatPrice, getDiscountPercent } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { requestAuth } from "@/components/auth-modal";
import { useCart } from "@/contexts/cart-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  className?: string;
  layout?: "grid" | "list";
  priority?: boolean;
}

export function ProductCard({ product, className, layout = "grid", priority = false }: ProductCardProps) {
  const { addItem } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { user } = useAuth();
  const wishlisted = isWishlisted(product.id);
  const discountPct = product.salePrice ? getDiscountPercent(product.price, product.salePrice) : 0;

  if (layout === "list") {
    return (
      <motion.article
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "group relative flex min-h-44 w-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg",
          className
        )}
      >
        <Link
          href={`/products/${product.id}`}
          className="relative w-[38%] max-w-64 shrink-0 overflow-hidden bg-muted sm:w-56 md:w-64"
          aria-label={`View ${product.name}`}
        >
          <Image
            src={product.thumbnail}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 38vw, 256px"
            fetchPriority={priority ? "high" : "auto"}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3 flex flex-col gap-1">
            {discountPct > 0 && (
              <span className="rounded-full bg-destructive px-2 py-1 text-xs font-bold text-destructive-foreground">
                -{discountPct}%
              </span>
            )}
            {product.stock < 5 && product.stock > 0 && (
              <span className="rounded-full bg-orange-500 px-2 py-1 text-xs font-bold text-white">
                Low Stock
              </span>
            )}
            {product.stock === 0 && (
              <span className="rounded-full bg-muted-foreground px-2 py-1 text-xs font-bold text-background">
                Out of Stock
              </span>
            )}
          </div>
        </Link>

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 p-3 sm:p-5">
          <div className="min-w-0">
            <div className="mb-1 flex items-start justify-between gap-2">
              <p className="truncate text-xs text-muted-foreground">{product.brand}</p>
              <button
                type="button"
                onClick={() => { if (!user) return requestAuth("Sign in to save items", "Create an account or sign in to build your wishlist and save your favorite products for later."); toggleWishlist(product.id); }}
                className="-mr-1 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-red-500"
                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                aria-pressed={wishlisted}
              >
                <Heart size={18} className={wishlisted ? "fill-red-500 text-red-500" : ""} />
              </button>
            </div>
            <Link
              href={`/products/${product.id}`}
              className="line-clamp-2 font-semibold leading-snug transition-colors hover:text-primary sm:text-lg"
            >
              {product.name}
            </Link>
            <p className="mt-1 hidden line-clamp-2 text-sm text-muted-foreground sm:block">
              {product.description}
            </p>
            <div className="mt-2 flex items-center gap-1.5">
              <div className="flex" aria-label={`${product.rating} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    className={i < Math.floor(product.rating) ? "fill-amber-400 text-amber-400" : "text-muted"}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">({product.reviewsCount})</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-primary sm:text-lg">
                {formatPrice(product.salePrice ?? product.price)}
              </span>
              {product.salePrice && (
                <span className="text-xs text-muted-foreground line-through sm:text-sm">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => addItem(product)}
              disabled={product.stock === 0}
              aria-label={product.stock === 0 ? "Out of stock" : `Add ${product.name} to cart`}
              className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 sm:px-4 sm:text-sm"
            >
              <ShoppingCart size={15} />
              <span className="hidden sm:inline">{product.stock === 0 ? "Out of stock" : "Add"}</span>
            </button>
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group relative bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 hover:-translate-y-1",
        className
      )}
    >
      <div className="flex flex-col h-full">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted/30">
          <Link href={`/products/${product.id}`} className="absolute inset-0 z-0" aria-label={`View ${product.name}`}><span className="sr-only">View {product.name}</span></Link>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none" />
          <Image
            src={product.thumbnail}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            fetchPriority={priority ? "high" : "auto"}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {discountPct > 0 && (
              <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-full">
                -{discountPct}%
              </span>
            )}
            {product.stock < 5 && product.stock > 0 && (
              <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                Low Stock
              </span>
            )}
            {product.stock === 0 && (
              <span className="bg-muted-foreground text-background text-xs font-bold px-2 py-1 rounded-full">
                Out of Stock
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              if (!user) return requestAuth("Sign in to save items", "Create an account or sign in to build your wishlist and save your favorite products for later.");
              toggleWishlist(product.id);
            }}
            className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
            aria-label="Toggle wishlist"
          >
            <Heart
              size={16}
              className={wishlisted ? "fill-red-500 text-red-500" : "text-muted-foreground"}
            />
          </button>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            <Link href={`/products/${product.id}`} className="before:absolute before:inset-0 before:z-0">{product.name}</Link>
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={
                    i < Math.floor(product.rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted"
                  }
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({product.reviewsCount})</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary">
              {formatPrice(product.salePrice ?? product.price)}
            </span>
            {product.salePrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
