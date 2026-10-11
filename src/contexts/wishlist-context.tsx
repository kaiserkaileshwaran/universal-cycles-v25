"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useAuth } from "./auth-context";

interface WishlistContextType {
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<string[]>([]);

  const toggleWishlist = (productId: string) => {
    if (!user) return; // Only allow if logged in
    
    setItems((prev) => {
      const updated = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      return updated;
    });
  };

  const isWishlisted = (productId: string) => items.includes(productId);
  const clearWishlist = () => setItems([]);

  return (
    <WishlistContext.Provider
      value={{ wishlist: items, toggleWishlist, isWishlisted, clearWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
}
