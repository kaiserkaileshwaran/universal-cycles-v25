"use client";

import { createContext, useCallback, useContext, type ReactNode, useState, useEffect } from "react";

export type PrizeType = "coupon" | "discount" | "product" | "gift" | "points";
export interface Prize {
  id: string;
  label: string;
  type: PrizeType;
  value: string;
  probability: number;
  color: string;
  enabled: boolean;
}
export interface SpinWinner {
  id: string;
  user: string;
  email: string;
  prize: string;
  rewardCode?: string;
  date: string;
}

export const SPIN_PRIZES_KEY = "uc_spin_prizes";
export const SPIN_WINNERS_KEY = "uc_spin_winners";
export const SPIN_DAILY_KEY = "uc_spin_daily";
export const INITIAL_PRIZES: Prize[] = [
  { id: "1", label: "10% OFF", type: "coupon", value: "WELCOME10", probability: 30, color: "#2D6A4F", enabled: true },
  { id: "2", label: "Free Shipping", type: "coupon", value: "FREESHIP", probability: 10, color: "#F4A261", enabled: true },
  { id: "3", label: "₹2,000 OFF", type: "coupon", value: "CYCLE20", probability: 10, color: "#1B4332", enabled: true },
  { id: "4", label: "Try Again", type: "gift", value: "", probability: 25, color: "#95D5B2", enabled: true },
  { id: "5", label: "500 Reward Points", type: "points", value: "500", probability: 10, color: "#40916C", enabled: true },
  { id: "6", label: "25% OFF", type: "coupon", value: "WHEEL25", probability: 10, color: "#B7E4C7", enabled: true },
  { id: "7", label: "₹500 OFF", type: "coupon", value: "FIVE5", probability: 5, color: "#74C69D", enabled: true },
];

interface SpinContextValue {
  prizes: Prize[];
  winners: SpinWinner[];
  hasSpunToday: (userId: string) => boolean;
  savePrizes: (prizes: Prize[]) => void;
  recordWin: (userId: string, email: string, prize: Prize) => void;
  ready: boolean;
}

const SpinContext = createContext<SpinContextValue | undefined>(undefined);
const localDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

export function SpinWheelProvider({ children }: { children: ReactNode }) {
  const [prizes, setPrizes] = useState(INITIAL_PRIZES);
  const [winners, setWinners] = useState<SpinWinner[]>([]);
  const [dailySpins, setDailySpins] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => { setReady(true); }, []);

  useEffect(() => {
    try {
      
      
      
    } catch { /* Keep this browser session usable if storage is full or disabled. */ }
  }, [dailySpins, prizes, winners]);

  const hasSpunToday = useCallback((userId: string) => dailySpins[userId] === localDate(), [dailySpins]);
  const savePrizes = useCallback((nextPrizes: Prize[]) => setPrizes(nextPrizes), []);
  const recordWin = useCallback((userId: string, email: string, prize: Prize) => {
    const date = new Date().toISOString();
    setDailySpins((current) => ({ ...current, [userId]: localDate() }));
    setWinners((current) => [{
      id: `w${Date.now()}`,
      user: email || "Signed-in customer",
      email,
      prize: prize.label,
      rewardCode: prize.type === "coupon" ? prize.value : undefined,
      date,
    }, ...current]);
    if (prize.type === "points") {
      try {
        const key = `uc_reward_points:${userId}`;
        
      } catch { /* Points remain recorded in the prize history. */ }
    }
  }, []);

  return <SpinContext.Provider value={{ prizes, winners, hasSpunToday, savePrizes, recordWin, ready }}>{children}</SpinContext.Provider>;
}

export function useSpinWheel() {
  const context = useContext(SpinContext);
  if (!context) throw new Error("useSpinWheel must be used within SpinWheelProvider");
  return context;
}
