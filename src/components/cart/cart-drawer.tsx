"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Trash2, Plus, Minus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/contexts/cart-context";
import { formatPrice } from "@/lib/utils";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { state, removeItem, updateQuantity, subtotal, shipping, total, itemCount } = useCart();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-background z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-primary" />
                <h2 className="font-bold text-lg">Shopping Cart</h2>
                {itemCount > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                    {itemCount}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto">
              {state.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 px-6">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                    <ShoppingBag size={32} className="text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-center">
                    Your cart is empty. Start exploring our premium collection!
                  </p>
                  <button
                    onClick={onClose}
                    className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {state.items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      className="flex gap-4 p-3 bg-muted/50 rounded-xl"
                    >
                      {/* Image */}
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                        <Image
                          src={item.product.thumbnail}
                          alt={item.product.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-2">{item.product.name}</p>
                        {item.variantLabel && (
                          <p className="text-xs text-muted-foreground mt-0.5">{item.variantLabel}</p>
                        )}
                        <p className="font-bold text-primary mt-1">
                          {formatPrice(item.price * item.quantity)}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="ml-auto p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Summary */}
            {state.items.length > 0 && (
              <div className="p-6 border-t space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  {state.couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon ({state.couponCode})</span>
                      <span>-{formatPrice(state.couponDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={shipping === 0 ? "text-green-600 font-medium" : "font-medium"}>
                      {shipping === 0 ? "FREE" : formatPrice(shipping)}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Add {formatPrice(100 - subtotal)} more for free shipping
                    </p>
                  )}
                  <div className="h-px bg-border" />
                  <div className="flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="block w-full bg-primary text-primary-foreground text-center py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors text-sm"
                >
                  Proceed to Checkout
                </Link>
                <button
                  onClick={onClose}
                  className="block w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
