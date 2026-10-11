"use client";

import { createContext, useContext, useReducer, useEffect, ReactNode, useState } from "react";
import { Product } from "@/types";
import { generateId } from "@/lib/utils";
import { usePromotions } from "@/contexts/promotions-context";
import { useStoreSettings } from "@/contexts/store-settings-context";
import type { StoreSettings } from "@/constants/store-settings";

export interface CartItem {
  id: string;
  product: Product;
  variantId?: string;
  variantLabel?: string;
  quantity: number;
  price: number;
}

interface CartState {
  items: CartItem[];
  couponCode?: string;
  couponDiscount: number;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: { product: Product; variantId?: string; variantLabel?: string; quantity: number } }
  | { type: "REMOVE_ITEM"; payload: { id: string } }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "APPLY_COUPON"; payload: { code: string; discount: number } }
  | { type: "REMOVE_COUPON" }
  | { type: "LOAD_CART"; payload: CartState };

const initialState: CartState = {
  items: [],
  couponCode: undefined,
  couponDiscount: 0,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const { product, variantId, variantLabel, quantity } = action.payload;
      if (product.stock < 1) return state;
      const existingIndex = state.items.findIndex(
        (item) => item.product.id === product.id && item.variantId === variantId
      );

      if (existingIndex >= 0) {
        const updated = [...state.items];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: Math.min(product.stock, updated[existingIndex].quantity + quantity),
        };
        return { ...state, items: updated };
      }

      const price = product.salePrice ?? product.price;
      return {
        ...state,
        items: [
          ...state.items,
          { id: generateId(), product, variantId, variantLabel, quantity: Math.min(product.stock, quantity), price },
        ],
      };
    }

    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter((item) => item.id !== action.payload.id) };

    case "UPDATE_QUANTITY": {
      if (action.payload.quantity < 1) {
        return { ...state, items: state.items.filter((item) => item.id !== action.payload.id) };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: Math.min(item.product.stock, action.payload.quantity) }
            : item
        ),
      };
    }

    case "CLEAR_CART":
      return initialState;

    case "APPLY_COUPON":
      return { ...state, couponCode: action.payload.code, couponDiscount: action.payload.discount };

    case "REMOVE_COUPON":
      return { ...state, couponCode: undefined, couponDiscount: 0 };

    case "LOAD_CART":
      return action.payload;

    default:
      return state;
  }
}

interface CartContextType {
  state: CartState;
  addItem: (product: Product, options?: { variantId?: string; variantLabel?: string; quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  itemCount: number;
  shippingRates: Pick<StoreSettings, "freeShippingMinimum" | "standardShippingFee" | "expressShippingFee" | "overnightShippingFee">;
  ready: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [ready, setReady] = useState(false);
  const { settings } = useStoreSettings();
  const { promotions, getDiscount } = usePromotions();
  const shippingRates = settings;

  useEffect(() => {
    setReady(true);
  }, []);

  const addItem = (
    product: Product,
    options?: { variantId?: string; variantLabel?: string; quantity?: number }
  ) => {
    dispatch({
      type: "ADD_ITEM",
      payload: {
        product,
        variantId: options?.variantId,
        variantLabel: options?.variantLabel,
        quantity: options?.quantity ?? 1,
      },
    });
  };

  const removeItem = (id: string) => dispatch({ type: "REMOVE_ITEM", payload: { id } });
  const updateQuantity = (id: string, quantity: number) =>
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  const clearCart = () => dispatch({ type: "CLEAR_CART" });
  const applyCoupon = (code: string, discount: number) =>
    dispatch({ type: "APPLY_COUPON", payload: { code, discount } });
  const removeCoupon = () => dispatch({ type: "REMOVE_COUPON" });

  const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = getDiscount(state.couponCode, subtotal);
  const appliedPromo = state.couponCode ? promotions.find(p => p.code.toLowerCase() === state.couponCode?.toLowerCase() && p.isActive) : null;
  const shipping = subtotal >= shippingRates.freeShippingMinimum || appliedPromo?.kind === "shipping" ? 0 : shippingRates.standardShippingFee;
  const total = Math.max(0, subtotal - discount + shipping);
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        state,
        ready,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        subtotal,
        discount,
        shipping,
        total,
        itemCount,
        shippingRates,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
