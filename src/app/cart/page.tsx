"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Tag, ChevronRight, Truck } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useCart } from "@/contexts/cart-context";
import { formatPrice } from "@/lib/utils";
import { usePromotions } from "@/contexts/promotions-context";

export default function CartPage() {
  const { state, ready, removeItem, updateQuantity, applyCoupon, removeCoupon, subtotal, discount, shipping, total, shippingRates } = useCart();
  const { promotions } = usePromotions();
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const autoCouponHandled = useRef(false);
  const autoCouponCode = typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("coupon")?.trim().toUpperCase() ?? "";
  const autoCouponRule = promotions.find(p => p.code === autoCouponCode && p.isActive);

  useEffect(() => {
    if (!ready || autoCouponHandled.current) return;
    const code = autoCouponCode;
    if (!code) return;
    const rule = promotions.find(p => p.code === code && p.isActive);
    if (rule && subtotal >= rule.minimum) {
      autoCouponHandled.current = true;
      applyCoupon(code, 0);
    } else if (!rule) autoCouponHandled.current = true;
  }, [applyCoupon, autoCouponCode, ready, subtotal, promotions]);

  const handleApplyCoupon = (overrideCode?: string) => {
    const code = (overrideCode || couponInput).trim().toUpperCase();
    if (!code) return;

    const promo = promotions.find(p => p.code.toLowerCase() === code.toLowerCase() && p.isActive);
    if (promo && subtotal >= promo.minimum) {
      applyCoupon(code, 0); // Context recalculates discount
      setCouponSuccess(promo.kind === "shipping" ? "Free standard shipping applied." : "Coupon applied to your order.");
      setCouponError("");
    } else if (promo) {
      setCouponError(`Add ${formatPrice(promo.minimum - subtotal)} more to use ${code}.`);
      setCouponSuccess("");
    } else {
      setCouponError("That code isn’t valid. Check the available offers and try again.");
      setCouponSuccess("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 lg:pt-24">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight size={14} />
            <span className="text-foreground font-medium">Shopping Cart</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-8">
            Shopping Cart
            {state.items.length > 0 && (
              <span className="text-muted-foreground text-xl font-normal ml-3">
                ({state.items.length} {state.items.length === 1 ? "item" : "items"})
              </span>
            )}
          </h1>

          {state.items.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-24 bg-card border border-border/50 shadow-sm rounded-3xl max-w-2xl mx-auto">
              <div className="text-8xl mb-6">🛒</div>
              <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-8">Add some amazing products to get started!</p>
              <Link
                href="/category/adult-cycles"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
              >
                Start Shopping
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                <AnimatePresence>
                  {state.items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex gap-4 p-4 md:p-6 bg-card border border-border rounded-2xl"
                    >
                      <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-muted shrink-0">
                        <Image
                          src={item.product.thumbnail}
                          alt={item.product.name}
                          fill
                          sizes="100px"
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs text-muted-foreground">{item.product.brand}</p>
                            <Link
                              href={`/products/${item.product.id}`}
                              className="font-semibold hover:text-primary transition-colors line-clamp-2"
                            >
                              {item.product.name}
                            </Link>
                            {item.variantLabel && (
                              <p className="text-xs text-muted-foreground mt-1">{item.variantLabel}</p>
                            )}
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1.5 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                            aria-label="Remove item"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center border border-border rounded-xl overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors text-lg font-bold"
                            >
                              −
                            </button>
                            <span className="w-12 text-center font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors text-lg font-bold"
                            >
                              +
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary text-lg">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-xs text-muted-foreground">
                                {formatPrice(item.price)} each
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Continue Shopping */}
                <Link
                  href="/category/adult-cycles"
                  className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                >
                  ← Continue Shopping
                </Link>
              </div>

              {/* Order Summary */}
              <div className="space-y-4">
                {/* Coupon */}
                <div className="p-5 bg-card border border-border rounded-2xl">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Tag size={18} className="text-primary" />
                    Coupon Code
                  </h3>
                  {state.couponCode ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-green-700">{state.couponCode} applied!</p>
                        <p className="text-xs text-green-600">You saved {formatPrice(state.couponDiscount)}</p>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-xs text-muted-foreground hover:text-destructive"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter coupon code"
                          value={couponInput || autoCouponCode}
                          onChange={(e) => setCouponInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                          className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                        />
                        <button
                          onClick={() => handleApplyCoupon()}
                          className="px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-xs text-destructive mt-2">{couponError}</p>
                      )}
                      {couponSuccess && (
                        <p className="text-xs text-green-600 mt-2">{couponSuccess}</p>
                      )}
                      <div className="mt-4 space-y-2">
                        {promotions.filter(p => p.isPublic && p.isActive).map(promo => (
                          <div key={promo.id} className="flex items-center justify-between p-3 border border-border rounded-xl hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => { setCouponInput(promo.code); handleApplyCoupon(promo.code); }}>
                            <div>
                              <p className="text-sm font-bold">{promo.code}</p>
                              <p className="text-xs text-muted-foreground">{promo.description}</p>
                            </div>
                            <button className="text-xs font-semibold text-primary">Apply</button>
                          </div>
                        ))}
                      </div>

                      {autoCouponRule && state.couponCode === autoCouponCode && (
                        <p className="text-xs text-green-600 mt-2">{autoCouponRule.kind === "shipping" ? "Free standard shipping applied." : "Wheel prize applied. Your discount is included below."}</p>
                      )}
                      {autoCouponRule && state.couponCode !== autoCouponCode && subtotal < autoCouponRule.minimum && (
                        <p className="text-xs text-muted-foreground mt-2">Add {formatPrice(autoCouponRule.minimum - subtotal)} more to use {autoCouponCode}.</p>
                      )}
                    </>
                  )}
                </div>

                {/* Summary */}
                <div className="p-5 bg-card border border-border rounded-2xl space-y-4">
                  <h3 className="font-semibold text-lg">Order Summary</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Coupon Discount</span>
                        <span>-{formatPrice(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className={shipping === 0 ? "text-green-600 font-medium" : ""}>
                        {shipping === 0 ? "FREE" : formatPrice(shipping)}
                      </span>
                    </div>
                    {shipping > 0 && (
                      <div className="flex items-center gap-2 bg-muted/50 rounded-xl p-3">
                        <Truck size={16} className="text-primary" />
                        <p className="text-xs">
                          Add <strong>{formatPrice(shippingRates.freeShippingMinimum - subtotal)}</strong> more for free shipping
                        </p>
                      </div>
                    )}
                    <div className="h-px bg-border" />
                    <div className="flex justify-between font-bold text-base">
                      <span>Total</span>
                      <span className="text-primary text-xl">{formatPrice(total)}</span>
                    </div>
                  </div>

                  <Link
                    href="/checkout"
                    className="block w-full text-center bg-primary text-primary-foreground py-4 rounded-xl font-bold text-base hover:bg-primary/90 transition-colors"
                  >
                    Proceed to Checkout
                  </Link>

                  {/* Trust */}
                  <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground pt-2">
                    <span>🔒 Secure</span>
                    <span>•</span>
                    <span>↩️ Easy Returns</span>
                    <span>•</span>
                    <span>🚚 Fast Delivery</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
