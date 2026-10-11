"use client";

import { createContext, useCallback, useContext, type ReactNode, useState, useEffect } from "react";
import type { Address } from "@/types";

type AddressBook = Record<string, Address[]>;
interface AddressValue {
  getAddresses: (userId: string) => Address[];
  saveAddress: (userId: string, address: Address) => void;
  setDefaultAddress: (userId: string, addressId: string) => void;
  deleteAddress: (userId: string, addressId: string) => void;
  ready: boolean;
}
const AddressContext = createContext<AddressValue | undefined>(undefined);

import { useFirebaseState } from "@/lib/use-firebase-state";

export function AddressesProvider({ children }: { children: ReactNode }) {
  const [book, setBook, ready] = useFirebaseState<AddressBook>("addresses", {});

  const getAddresses = useCallback((userId: string) => book[userId] ?? [], [book]);
  const saveAddress = useCallback((userId: string, address: Address) => setBook((current) => {
    const existing = current[userId] ?? [];
    const index = existing.findIndex((item) => item.id === address.id);
    
    if (index >= 0) {
      // Update existing
      const updated = [...existing];
      updated[index] = address;
      return { ...current, [userId]: updated };
    }
    
    // Add new
    const same = (item: Address) => item.street1.toLowerCase() === address.street1.toLowerCase() && item.zipCode === address.zipCode;
    if (existing.some(same)) return current;
    
    const withDefault = existing.length === 0 ? { ...address, isDefault: true } : address;
    return { ...current, [userId]: [withDefault, ...existing] };
  }), []);
  const setDefaultAddress = useCallback((userId: string, addressId: string) => setBook((current) => ({
    ...current,
    [userId]: (current[userId] ?? []).map((address) => ({ ...address, isDefault: address.id === addressId })),
  })), []);
  const deleteAddress = useCallback((userId: string, addressId: string) => setBook((current) => {
    const addresses = current[userId] ?? [];
    const removedDefault = addresses.find((address) => address.id === addressId)?.isDefault;
    const remaining = addresses.filter((address) => address.id !== addressId);
    if (removedDefault && remaining[0]) remaining[0] = { ...remaining[0], isDefault: true };
    return { ...current, [userId]: remaining };
  }), []);

  return <AddressContext.Provider value={{ getAddresses, saveAddress, setDefaultAddress, deleteAddress, ready }}>{children}</AddressContext.Provider>;
}

export function useAddresses() {
  const context = useContext(AddressContext);
  if (!context) throw new Error("useAddresses must be used within AddressesProvider");
  return context;
}
