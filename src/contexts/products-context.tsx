"use client";

import { createContext, useContext, useEffect, useState, type Dispatch, type ReactNode, type SetStateAction,  } from "react";
import { SAMPLE_PRODUCTS } from "@/constants";
import type { Product } from "@/types";

interface ProductsContextValue {
  products: Product[];
  setProducts: Dispatch<SetStateAction<Product[]>>;
}

const ProductsContext = createContext<ProductsContextValue | undefined>(undefined);
import { useFirebaseState } from "@/lib/use-firebase-state";

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useFirebaseState<Product[]>("products", SAMPLE_PRODUCTS);

  return <ProductsContext.Provider value={{ products, setProducts }}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) throw new Error("useProducts must be used within ProductsProvider");
  return context;
}
