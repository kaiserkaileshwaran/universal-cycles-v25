"use client";

import { createContext, useContext, type ReactNode, useState, useEffect } from "react";
import type { Order } from "@/types";

interface OrdersContextValue {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrder: (orderId: string, patch: Partial<Order>) => void;
}

const OrdersContext = createContext<OrdersContextValue | undefined>(undefined);
import { useFirebaseState } from "@/lib/use-firebase-state";

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useFirebaseState<Order[]>("orders", []);

  const addOrder = (order: Order) => setOrders((current) => [order, ...current]);
  const updateOrder = (orderId: string, patch: Partial<Order>) => {
    setOrders((current) => current.map((order) => order.id === orderId ? { ...order, ...patch } : order));
  };

  return <OrdersContext.Provider value={{ orders, addOrder, updateOrder }}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) throw new Error("useOrders must be used within OrdersProvider");
  return context;
}
