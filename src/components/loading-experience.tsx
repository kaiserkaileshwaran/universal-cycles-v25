"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

type Orientation = "landscape" | "portrait";

export default function LoadingExperience({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true);
  const [orientation, setOrientation] = useState<Orientation>("landscape");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncOrientation = () => {
      setOrientation(window.matchMedia("(orientation: portrait)").matches ? "portrait" : "landscape");
    };

    syncOrientation();
    window.addEventListener("resize", syncOrientation);

    return () => window.removeEventListener("resize", syncOrientation);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return;

    let cancelled = false;
    let audioContext: AudioContext | null = null;

    const startAmbient = async () => {
      try {
        if (typeof navigator !== "undefined" && navigator.userActivation && !navigator.userActivation.hasBeenActive) {
          return; // Skip audio to prevent autoplay console warnings
        }
        audioContext = new AudioContextCtor();
        const master = audioContext.createGain();
        master.gain.value = 0.001;
        master.connect(audioContext.destination);

        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = 420;
        gain.gain.value = 0.0008;
        oscillator.connect(gain);
        gain.connect(master);

        await audioContext.resume();
        oscillator.start();

        master.gain.linearRampToValueAtTime(0.12, audioContext.currentTime + 0.4);
        window.setTimeout(() => {
          if (!cancelled) {
            master.gain.linearRampToValueAtTime(0.001, audioContext!.currentTime + 0.3);
          }
        }, 900);
        window.setTimeout(() => {
          if (!cancelled) {
            audioContext?.close().catch(() => undefined);
          }
        }, 1200);
      } catch {
        // Ignore autoplay restrictions and continue silently.
      }
    };

    startAmbient();

    const timer = window.setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 1200);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      audioContext?.close().catch(() => undefined);
    };
  }, [onComplete]);

  const backgroundSrc = orientation === "portrait" ? "/background-portrait.png" : "/background-landscape.png";

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.985 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src={backgroundSrc}
            alt=""
            fill
            loading="eager"
            sizes="100vw"
            className="object-cover object-center"
          />

          <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center sm:px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="mb-6 flex w-[clamp(180px,34vw,280px)] items-center justify-center"
            >
              <Image src="/logo.svg" alt="Universal Cycles logo" width={320} height={320} className="h-auto w-full object-contain" loading="eager" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10, letterSpacing: "0.08em" }}
              animate={{ opacity: 1, y: 0, letterSpacing: "0.18em" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.18 }}
              className="text-[clamp(1.2rem,2.8vw,2rem)] font-semibold uppercase tracking-[0.18em] text-[#f7f4ec] [text-shadow:_0_2px_10px_rgba(0,0,0,0.22)]"
            >
              UNIVERSAL CYCLES
            </motion.h1>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
