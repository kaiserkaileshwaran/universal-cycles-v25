"use client";

import { useEffect, useState } from "react";
import { getFirebaseDatabase } from "@/firebase/firebase";
import { ref, set, get, child } from "firebase/database";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X } from "lucide-react";

const PUBLIC_VAPID_KEY = "BHlYLUDGSORDJcFzmFUaWCNABgrQp69NAs8a0kyh50exPuZMURV6nl6MMWia8BPd9YdGWw6ObjF671en25-NtZ8";

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationManager() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    navigator.serviceWorker.register('/sw.js').then((registration) => {
      console.log('Service Worker registered with scope:', registration.scope);
    });

    if (Notification.permission === 'default') {
      const timer = setTimeout(() => setShowPrompt(true), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  
  const subscribe = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
        });

        // Save subscription to Firebase
        const subJson = subscription.toJSON();
        const subId = btoa(subJson.endpoint || "").replace(/[^a-zA-Z0-9]/g, "").slice(-30);
        
        try {
          const dbRef = ref(getFirebaseDatabase(), `push_subscriptions/${subId}`);
          await set(dbRef, subJson);
        } catch (dbError) {
          console.error("Firebase write error:", dbError);
          alert("Subscribed locally, but failed to save to database (Firebase rules might be blocking it).");
        }
        
        setShowPrompt(false);
      } else {
        alert("Permission denied by browser.");
        setShowPrompt(false);
      }
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      alert('Error: ' + ((error as Error).message || error));
      setShowPrompt(false);
    }
  };


  const dismiss = () => {
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 right-6 z-[100] w-[calc(100%-3rem)] max-w-sm rounded-2xl border border-border bg-card p-5 shadow-2xl md:w-96"
        >
          <button onClick={dismiss} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
          
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bell size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Stay Updated</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Get notified about new arrivals, exclusive promotions, and order updates.
              </p>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={subscribe}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Enable Notifications
                </button>
                <button
                  onClick={dismiss}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
