"use client";

import { createContext, useContext, useEffect, useState, type Dispatch, type ReactNode, type SetStateAction,  } from "react";
import { CATEGORIES as INITIAL_CATEGORIES } from "@/constants";

type Subcategory = {
  id: string;
  name: string;
  slug: string;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  subcategories: Subcategory[];
};

interface CategoriesContextValue {
  categories: Category[];
  setCategories: Dispatch<SetStateAction<Category[]>>;
}

const CategoriesContext = createContext<CategoriesContextValue | undefined>(undefined);
import { useFirebaseState } from "@/lib/use-firebase-state";

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useFirebaseState<Category[]>("categories", INITIAL_CATEGORIES);

  return <CategoriesContext.Provider value={{ categories, setCategories }}>{children}</CategoriesContext.Provider>;
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (!context) throw new Error("useCategories must be used within CategoriesProvider");
  return context;
}
