/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { createContext, useContext, type ReactNode, type Dispatch, type SetStateAction, useState, useEffect } from "react";
import { COUPON_RULES } from "@/constants/promotions";

export interface Promotion {
  id: string;
  code: string;
  kind: "percent" | "fixed" | "shipping";
  value: number;
  minimum: number;
  isPublic: boolean;
  isActive: boolean;
  description: string;
}

const INITIAL_PROMOTIONS: Promotion[] = Object.entries(COUPON_RULES).map(([code, rule]) => ({
  id: code,
  code,
  kind: rule.kind as any,
  value: rule.value,
  minimum: rule.minimum,
  isPublic: true,
  isActive: true,
  description: rule.kind === "percent" ? `\${rule.value}% off` : rule.kind === "shipping" ? "Free shipping" : `₹\${rule.value} off`
}));

interface PromotionsContextValue {
  promotions: Promotion[];
  setPromotions: Dispatch<SetStateAction<Promotion[]>>;
  getDiscount: (code: string | undefined, subtotal: number) => number;
}

const PromotionsContext = createContext<PromotionsContextValue | undefined>(undefined);

import { useFirebaseState } from "@/lib/use-firebase-state";

export function PromotionsProvider({ children }: { children: ReactNode }) {
  const [promotions, setPromotions] = useFirebaseState<Promotion[]>("promotions", INITIAL_PROMOTIONS);

  const getDiscount = (code: string | undefined, subtotal: number) => {
    if (!code) return 0;
    const promo = promotions.find((p) => p.code.toLowerCase() === code.toLowerCase() && p.isActive);
    if (!promo || subtotal < promo.minimum) return 0;
    if (promo.kind === "percent") return subtotal * (promo.value / 100);
    if (promo.kind === "fixed") return promo.value;
    return 0;
  };

  return (
    <PromotionsContext.Provider value={{ promotions, setPromotions, getDiscount }}>
      {children}
    </PromotionsContext.Provider>
  );
}

export function usePromotions() {
  const context = useContext(PromotionsContext);
  if (!context) throw new Error("usePromotions must be used within PromotionsProvider");
  return context;
}
