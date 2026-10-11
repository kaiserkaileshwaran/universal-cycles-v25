"use client";

import { createContext, useCallback, useContext, type ReactNode, useState, useEffect } from "react";
import { DEFAULT_STORE_SETTINGS, type StoreSettings } from "@/constants/store-settings";

interface StoreSettingsValue {
  settings: StoreSettings;
  saveSettings: (settings: StoreSettings) => void;
  ready: boolean;
}

const StoreSettingsContext = createContext<StoreSettingsValue | undefined>(undefined);
function validRate(value: unknown, fallback: number) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}
const normalizeSettings = (value: Partial<StoreSettings>): StoreSettings => ({
  storeName: typeof value.storeName === "string" ? value.storeName : DEFAULT_STORE_SETTINGS.storeName,
  contactEmail: typeof value.contactEmail === "string" ? value.contactEmail : DEFAULT_STORE_SETTINGS.contactEmail,
  description: typeof value.description === "string" ? value.description : DEFAULT_STORE_SETTINGS.description,
  freeShippingMinimum: validRate(value.freeShippingMinimum, DEFAULT_STORE_SETTINGS.freeShippingMinimum),
  standardShippingFee: validRate(value.standardShippingFee, DEFAULT_STORE_SETTINGS.standardShippingFee),
  expressShippingFee: validRate(value.expressShippingFee, DEFAULT_STORE_SETTINGS.expressShippingFee),
  overnightShippingFee: validRate(value.overnightShippingFee, DEFAULT_STORE_SETTINGS.overnightShippingFee),
  whatsappNumber: typeof value.whatsappNumber === "string" ? value.whatsappNumber : DEFAULT_STORE_SETTINGS.whatsappNumber,
  whatsappMessage: typeof value.whatsappMessage === "string" ? value.whatsappMessage : DEFAULT_STORE_SETTINGS.whatsappMessage,
  happyCustomersImages: Array.isArray(value.happyCustomersImages) ? value.happyCustomersImages : DEFAULT_STORE_SETTINGS.happyCustomersImages,
  serviceAvailableImages: Array.isArray(value.serviceAvailableImages) ? value.serviceAvailableImages : DEFAULT_STORE_SETTINGS.serviceAvailableImages,
});

import { useFirebaseState } from "@/lib/use-firebase-state";

export function StoreSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings, ready] = useFirebaseState<StoreSettings>("settings", DEFAULT_STORE_SETTINGS);

  const saveSettings = useCallback((next: StoreSettings) => {
    const normalized = normalizeSettings(next);
    setSettings(normalized);
  }, [setSettings]);

  const normalizedSettings = normalizeSettings(settings || {});

  return <StoreSettingsContext.Provider value={{ settings: normalizedSettings, saveSettings, ready }}>{children}</StoreSettingsContext.Provider>;
}

export function useStoreSettings() {
  const context = useContext(StoreSettingsContext);
  if (!context) throw new Error("useStoreSettings must be used within StoreSettingsProvider");
  return context;
}
