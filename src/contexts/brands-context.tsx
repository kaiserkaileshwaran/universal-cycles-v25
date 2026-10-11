"use client";

import { createContext, useContext, type ReactNode, type Dispatch, type SetStateAction, useState, useEffect } from "react";

export interface Brand {
  id: string;
  name: string;
  slug: string;
}

const INITIAL_BRANDS: Brand[] = [
  { id: "hero", name: "Hero Cycles", slug: "hero-cycles" },
  { id: "hercules", name: "Hercules", slug: "hercules" },
  { id: "bsa", name: "BSA", slug: "bsa" },
  { id: "firefox", name: "Firefox", slug: "firefox" },
  { id: "trek", name: "Trek", slug: "trek" },
  { id: "giant", name: "Giant", slug: "giant" },
];

interface BrandsContextValue {
  brands: Brand[];
  setBrands: Dispatch<SetStateAction<Brand[]>>;
}

const BrandsContext = createContext<BrandsContextValue | undefined>(undefined);

import { useFirebaseState } from "@/lib/use-firebase-state";

export function BrandsProvider({ children }: { children: ReactNode }) {
  const [brands, setBrands] = useFirebaseState<Brand[]>("brands", INITIAL_BRANDS);

  return (
    <BrandsContext.Provider value={{ brands, setBrands }}>
      {children}
    </BrandsContext.Provider>
  );
}

export function useBrands() {
  const context = useContext(BrandsContext);
  if (!context) throw new Error("useBrands must be used within BrandsProvider");
  return context;
}
