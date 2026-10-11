"use client";

import { createContext, useCallback, useContext, type ReactNode, useState, useEffect } from "react";

export interface ContactMessage {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  createdAt: number;
  read: boolean;
}
export interface Subscriber { id: string; email: string; subscribedAt: number }

const MESSAGES_KEY = "uc_contact_messages";
const SUBSCRIBERS_KEY = "uc_subscribers";
interface MarketingValue {
  messages: ContactMessage[];
  subscribers: Subscriber[];
  sendMessage: (message: Omit<ContactMessage, "id" | "createdAt" | "read">) => void;
  subscribe: (email: string) => "added" | "exists";
  markMessageRead: (id: string) => void;
  deleteMessage: (id: string) => void;
  unsubscribe: (id: string) => void;
  ready: boolean;
}
const MarketingContext = createContext<MarketingValue | undefined>(undefined);

export function MarketingProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  const sendMessage = useCallback((message: Omit<ContactMessage, "id" | "createdAt" | "read">) => setMessages((current) => [{ ...message, id: `m${Date.now()}`, createdAt: Date.now(), read: false }, ...current]), []);
  const subscribe = useCallback((email: string) => {
    const normalized = email.trim().toLowerCase();
    if (subscribers.some((item) => item.email === normalized)) return "exists" as const;
    setSubscribers((current) => [{ id: `s${Date.now()}`, email: normalized, subscribedAt: Date.now() }, ...current]);
    return "added" as const;
  }, [subscribers]);
  const markMessageRead = useCallback((id: string) => setMessages((current) => current.map((message) => message.id === id ? { ...message, read: true } : message)), []);
  const deleteMessage = useCallback((id: string) => setMessages((current) => current.filter((message) => message.id !== id)), []);
  const unsubscribe = useCallback((id: string) => setSubscribers((current) => current.filter((subscriber) => subscriber.id !== id)), []);

  return <MarketingContext.Provider value={{ messages, subscribers, sendMessage, subscribe, markMessageRead, deleteMessage, unsubscribe, ready }}>{children}</MarketingContext.Provider>;
}

export function useMarketing() {
  const context = useContext(MarketingContext);
  if (!context) throw new Error("useMarketing must be used within MarketingProvider");
  return context;
}
