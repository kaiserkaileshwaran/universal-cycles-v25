"use client";

import { useCallback, useState } from "react";
import { MessageCircle, Phone } from "lucide-react";
import { useStoreSettings } from "@/contexts/store-settings-context";
import LoadingExperience from "@/components/loading-experience";
import { AuthNotificationAndModal } from "@/components/auth-modal";
import { PushNotificationManager } from "@/components/push-notification-manager";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const { settings } = useStoreSettings();
  
  // Format WhatsApp Link
  const waNumber = settings.whatsappNumber.replace(/[^0-9]/g, '');
  const waText = encodeURIComponent(settings.whatsappMessage);
  const waUrl = `https://wa.me/${waNumber}?text=${waText}`;
  

  const handleLoadComplete = useCallback(() => setIsLoaded(true), []);

  return (
    <>
      <LoadingExperience onComplete={handleLoadComplete} />
      <div className={isLoaded ? "block" : "hidden"}>{children}</div>
      <AuthNotificationAndModal />
      <PushNotificationManager />
      {isLoaded && (
        <a
          href={waUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Chat with Universal Cycles on WhatsApp"
          title="Chat on WhatsApp"
          className="fixed right-4 bottom-[calc(4.25rem+env(safe-area-inset-bottom)+0.75rem)] z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg ring-2 ring-white/80 transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] md:bottom-6"
        >
          <span className="relative flex h-7 w-7 items-center justify-center">
            <MessageCircle size={26} strokeWidth={2.25} />
            <Phone size={11} strokeWidth={3} className="absolute" />
          </span>
        </a>
      )}
    </>
  );
}
