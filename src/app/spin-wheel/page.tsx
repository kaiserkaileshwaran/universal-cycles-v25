"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Gift, Trophy, X } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSpinWheel, type Prize } from "@/contexts/spin-wheel-context";

function startSpinAnimation(
  activePrizes: Prize[],
  rotation: number,
  setRotation: (value: number) => void,
  onFrame: (id: number) => void,
  onComplete: (prize: Prize, stopAngle: number) => void,
) {
  const segmentAngle = 360 / activePrizes.length;
  const totalWeight = activePrizes.reduce((sum, prize) => sum + prize.probability, 0);
  let roll = Math.random() * totalWeight;
  let winnerIndex = activePrizes.findIndex((prize) => {
    roll -= prize.probability;
    return roll < 0;
  });
  if (winnerIndex < 0) winnerIndex = activePrizes.length - 1;
  const winner = activePrizes[winnerIndex];
  const totalSpins = 6 + Math.random() * 4;
  const stopAngle = ((-(winnerIndex + 0.5) * segmentAngle) % 360 + 360) % 360;
  const targetAngle = rotation + totalSpins * 360 + ((stopAngle - rotation % 360 + 360) % 360);
  const duration = 5000;
  const startTime = Date.now();
  let frameId = 0;
  const tick = () => {
    const elapsed = Date.now() - startTime;
    const t = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - t, 4);
    setRotation(rotation + (targetAngle - rotation) * eased);
    if (t < 1) {
      frameId = requestAnimationFrame(tick);
      onFrame(frameId);
    }
    else onComplete(winner, stopAngle);
  };
  frameId = requestAnimationFrame(tick);
  onFrame(frameId);
  return frameId;
}

export default function SpinWheelPage() {
  const { user } = useAuth();
  const { prizes, ready, hasSpunToday, recordWin } = useSpinWheel();
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<Prize | null>(null);
  const animRef = useRef<number | null>(null);
  const activePrizes = prizes.filter((prize) => prize.enabled);
  const segmentAngle = activePrizes.length ? 360 / activePrizes.length : 0;
  const hasSpun = Boolean(user && ready && hasSpunToday(user.uid));

  const spin = () => {
    if (spinning || hasSpun || !ready || !user || activePrizes.length === 0) return;
    setSpinning(true);
    setResult(null);

    animRef.current = startSpinAnimation(activePrizes, rotation, setRotation, (frameId) => { animRef.current = frameId; }, (winner, stopAngle) => {
      animRef.current = null;
      setRotation(stopAngle);
      setSpinning(false);
      setResult(winner);
      recordWin(user.uid, user.email ?? "", winner);
    });
  };

  useEffect(() => {
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 lg:pt-24">
        {/* Hero */}
        <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground py-16 md:py-24 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles size={24} className="text-accent" />
              <span className="text-accent font-semibold uppercase tracking-widest text-sm">Lucky Wheel</span>
              <Sparkles size={24} className="text-accent" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Spin & Win!</h1>
            <p className="text-primary-foreground/80 text-lg">
              One weighted daily spin for signed-in customers. Eligible coupon prizes work at checkout.
            </p>
          </motion.div>
        </div>

        <div className="container mx-auto px-4 md:px-8 lg:px-12 py-16">
          {!user ? (
            <div className="text-center max-w-md mx-auto">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold mb-2">Log in to Spin</h2>
              <p className="text-muted-foreground mb-6">Create a free account to unlock your daily spin and win amazing prizes!</p>
              <Link
                href="/register"
                className="inline-block bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform"
              >
                Create Free Account
              </Link>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row items-center justify-center gap-16">
              {/* Wheel */}
              <div className="flex flex-col items-center gap-8">
                <div className="relative">
                  {/* Glow */}
                  <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl scale-110" />

                  {/* Pointer */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 z-10 filter drop-shadow-lg">
                    <div className="w-0 h-0 border-l-[14px] border-r-[14px] border-t-[28px] border-l-transparent border-r-transparent border-t-amber-400" />
                  </div>

                  {/* Wheel Container */}
                  <div
                    className="relative w-72 h-72 md:w-96 md:h-96 rounded-full border-8 border-primary shadow-2xl"
                    style={{ transform: `rotate(${rotation}deg)` }}
                  >
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      {activePrizes.map((prize, i) => {
                        const startAngle = i * segmentAngle - 90;
                        const endAngle = startAngle + segmentAngle;
                        const toRad = (a: number) => (a * Math.PI) / 180;
                        const x1 = 50 + 50 * Math.cos(toRad(startAngle));
                        const y1 = 50 + 50 * Math.sin(toRad(startAngle));
                        const x2 = 50 + 50 * Math.cos(toRad(endAngle));
                        const y2 = 50 + 50 * Math.sin(toRad(endAngle));
                        const mx = 50 + 35 * Math.cos(toRad(startAngle + segmentAngle / 2));
                        const my = 50 + 35 * Math.sin(toRad(startAngle + segmentAngle / 2));
                        const la = segmentAngle > 180 ? 1 : 0;

                        return (
                          <g key={prize.id}>
                            <path d={`M 50 50 L ${x1} ${y1} A 50 50 0 ${la} 1 ${x2} ${y2} Z`} fill={prize.color} stroke="white" strokeWidth="0.5" />
                            <text
                              x={mx} y={my}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fill="white"
                              fontSize="4"
                              fontWeight="bold"
                              transform={`rotate(${startAngle + segmentAngle / 2}, ${mx}, ${my})`}
                            >
                              {prize.label}
                            </text>
                          </g>
                        );
                      })}
                      <circle cx="50" cy="50" r="7" fill="#111" stroke="white" strokeWidth="1" />
                      <circle cx="50" cy="50" r="3" fill="#F4A261" />
                    </svg>
                  </div>
                </div>

                <motion.button
                  onClick={spin}
                  disabled={spinning || hasSpun || !ready || activePrizes.length === 0}
                  className={cn(
                    "px-14 py-5 rounded-full font-bold text-xl shadow-2xl transition-all",
                    hasSpun
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-gradient-to-r from-accent to-amber-500 text-accent-foreground hover:scale-110 hover:shadow-accent/30 hover:shadow-2xl"
                  )}
                  whileTap={!hasSpun ? { scale: 0.95 } : {}}
                >
                  {spinning ? "Spinning..." : hasSpun ? "Come back tomorrow!" : "🎰 SPIN!"}
                </motion.button>

                {hasSpun && (
                  <p className="text-sm text-muted-foreground">You get 1 spin per day. Come back tomorrow!</p>
                )}
              </div>

              {/* Info Panel */}
              <div className="max-w-sm w-full space-y-6">
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Trophy size={20} className="text-amber-500" /> Possible Prizes
                  </h2>
                  <div className="space-y-2">
                    {activePrizes.filter((p, i, arr) => arr.findIndex((a) => a.label === p.label) === i).map((prize) => (
                      <div key={prize.id} className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: prize.color }} />
                        <span className="text-sm">{prize.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <Gift size={18} className="text-primary" /> How It Works
                  </h3>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2"><span className="font-bold text-primary">1.</span> You get 1 free spin per day</li>
                    <li className="flex items-start gap-2"><span className="font-bold text-primary">2.</span> Click SPIN and watch the wheel go!</li>
                    <li className="flex items-start gap-2"><span className="font-bold text-primary">3.</span> Your result is recorded in the prize history</li>
                    <li className="flex items-start gap-2"><span className="font-bold text-primary">4.</span> Use coupon prizes at checkout</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Result Modal */}
      <AnimatePresence>
        {result && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 150 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-background border border-border rounded-3xl p-8 w-[340px] text-center shadow-2xl"
            >
              <button
                onClick={() => setResult(null)}
                className="absolute top-4 right-4 p-1.5 hover:bg-muted rounded-full"
              >
                <X size={18} />
              </button>

              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold mb-2">Congratulations!</h2>
              <p className="text-muted-foreground mb-6">You won:</p>

              <div
                className="text-3xl font-bold text-white py-6 px-8 rounded-2xl mb-6 shadow-xl"
                style={{ backgroundColor: result.color }}
              >
                {result.label}
              </div>

              {result.type === "coupon" && result.value && (
                <div className="bg-muted rounded-xl p-3 mb-6">
                  <p className="text-xs text-muted-foreground mb-1">Your coupon code:</p>
                  <p className="font-mono font-bold text-lg tracking-widest">{result.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">Choose “Use Prize” to apply it in your cart.</p>
                </div>
              )}
              {result.type === "points" && <p className="mb-6 text-sm text-muted-foreground">{result.value} points were added to your reward balance on this device.</p>}
              {result.type === "product" && <p className="mb-6 text-sm text-muted-foreground">The prize is recorded for store follow-up.</p>}

              {result.label === "Try Again" && (
                <p className="text-muted-foreground text-sm mb-6">Better luck next time! Come back tomorrow for another spin.</p>
              )}

              <Link
                href={result.type === "coupon" && result.value ? `/cart?coupon=${encodeURIComponent(result.value)}` : "/account"}
                onClick={() => setResult(null)}
                className="block w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
              >
                {result.type === "coupon" && result.value ? "Use Prize" : "View My Account"}
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
