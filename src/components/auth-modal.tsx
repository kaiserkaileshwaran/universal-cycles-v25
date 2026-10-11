"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Singleton event emitter for auth requests
type AuthRequestEvent = CustomEvent<{ title: string; subtitle: string }>;

export function requestAuth(title: string, subtitle: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("trigger-auth-modal", { detail: { title, subtitle } }));
  }
}

export function AuthNotificationAndModal() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  
  const [showNotification, setShowNotification] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "Sign in required", subtitle: "Please sign in to continue." });

  // Initial load notification
  useEffect(() => {
    if (!loading && !user && !sessionStorage.getItem("auth_notified")) {
      // Don't show on auth pages
      if (pathname && (pathname.includes('/login') || pathname.includes('/register') || pathname.includes('/reset-password'))) return;
      
      const timer = setTimeout(() => setShowNotification(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [loading, user, pathname]);

  const dismissNotification = () => {
    sessionStorage.setItem("auth_notified", "true");
    setShowNotification(false);
  };

  // Listen for manual auth triggers (Wishlist, Buy Now)
  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as AuthRequestEvent;
      setModalContent(customEvent.detail);
      setShowModal(true);
    };
    window.addEventListener("trigger-auth-modal", handler);
    return () => window.removeEventListener("trigger-auth-modal", handler);
  }, []);

  if (loading) return null;

  return (
    <>
      {/* Toast Notification for Logged Out User on initial visit */}
      <AnimatePresence>
        {showNotification && !user && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-24 z-50 md:w-96 bg-card border border-border shadow-2xl rounded-2xl p-4 flex flex-col gap-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Lock size={18} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">You're signed out</h4>
                  <p className="text-sm text-muted-foreground mt-0.5 leading-snug">Sign in to buy products and save items to your wishlist. You can still browse and add to cart!</p>
                </div>
              </div>
              <button onClick={dismissNotification} className="p-1 hover:bg-muted rounded-full transition-colors text-muted-foreground">
                <X size={18} />
              </button>
            </div>
            <div className="flex gap-2 mt-1">
              <Link href="/login" onClick={dismissNotification} className="flex-1 bg-primary text-primary-foreground text-center py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">Sign in</Link>
              <Link href="/register" onClick={dismissNotification} className="flex-1 bg-muted text-foreground text-center py-2 rounded-xl text-sm font-semibold hover:bg-muted/80 transition-colors">Register</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Block Modal (when clicking Wishlist or Buy Now) */}
      <AnimatePresence>
        {showModal && !user && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-card border border-border shadow-2xl rounded-3xl p-6 md:p-8 z-[101]"
            >
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-2 bg-muted/50 hover:bg-muted rounded-full transition-colors text-muted-foreground">
                <X size={20} />
              </button>
              
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 mx-auto">
                <Lock size={32} className="text-primary" />
              </div>
              
              <h2 className="text-2xl font-bold text-center mb-2">{modalContent.title}</h2>
              <p className="text-muted-foreground text-center mb-8 leading-relaxed">
                {modalContent.subtitle}
              </p>
              
              <div className="space-y-3">
                <Link 
                  href="/login" 
                  onClick={() => setShowModal(false)}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3.5 rounded-xl font-bold text-lg hover:bg-primary/90 transition-all active:scale-95 shadow-sm"
                >
                  <LogIn size={20} /> Sign in
                </Link>
                <Link 
                  href="/register" 
                  onClick={() => setShowModal(false)}
                  className="w-full flex items-center justify-center gap-2 bg-muted/50 text-foreground py-3.5 rounded-xl font-bold text-lg hover:bg-muted transition-all active:scale-95 border border-border"
                >
                  <UserPlus size={20} /> Create an account
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
