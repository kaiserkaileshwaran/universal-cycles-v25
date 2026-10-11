"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, Trophy, ToggleLeft, ToggleRight, X, Check } from "lucide-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { cn } from "@/lib/utils";
import { useSpinWheel, type Prize, type PrizeType } from "@/contexts/spin-wheel-context";
import { usePromotions } from "@/contexts/promotions-context";

const TYPE_LABELS: Record<PrizeType, string> = {
  coupon: "Coupon Code",
  discount: "% Discount",
  product: "Free Product",
  gift: "Gift / Message",
  points: "Reward Points",
};

export default function AdminSpinWheelPage() {
  const { prizes, winners, savePrizes } = useSpinWheel();
  const { promotions } = usePromotions();
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Prize | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null);
  const [rotation, setRotation] = useState(0);
  const animationFrameRef = useRef<number | null>(null);
  const [activeTab, setActiveTab] = useState<"wheel" | "winners">("wheel");
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState<Omit<Prize, "id">>({
    label: "", type: "coupon", value: "WELCOME10", probability: 10, color: "#2D6A4F", enabled: true
  });

  useEffect(() => () => { if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current); }, []);

  const activePrizes = prizes.filter((p) => p.enabled);
  const totalProb = activePrizes.reduce((s, p) => s + p.probability, 0);
  const segmentAngle = 360 / activePrizes.length;

  const spinWheel = useCallback(() => {
    if (spinning || activePrizes.length === 0) return;
    setSpinning(true);
    setResult(null);

    // Random weighted selection
    let rand = Math.random() * totalProb;
    let winner = activePrizes[0];
    for (const prize of activePrizes) {
      if (rand <= prize.probability) {
        winner = prize;
        break;
      }
      rand -= prize.probability;
    }

    const spins = 5 + Math.random() * 3;
    const winnerIndex = activePrizes.findIndex((prize) => prize.id === winner.id);
    const targetOffset = ((360 - (winnerIndex + 0.5) * segmentAngle) % 360 + 360) % 360;
    const targetAngle = rotation + spins * 360 + ((targetOffset - rotation % 360 + 360) % 360);

    // Animate rotation
    const start = rotation;
    const duration = 4000;
    const startTime = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      setRotation(start + (targetAngle - start) * ease);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(tick);
      } else {
        animationFrameRef.current = null;
        setRotation(targetOffset);
        setSpinning(false);
        setResult(winner);
      }
    };

    animationFrameRef.current = requestAnimationFrame(tick);
  }, [activePrizes, rotation, segmentAngle, spinning, totalProb]);

  const openAdd = () => {
    setEditingPrize(null);
    setFormError("");
    setForm({ label: "", type: "coupon", value: "WELCOME10", probability: 10, color: "#2D6A4F", enabled: true });
    setShowForm(true);
  };

  const openEdit = (p: Prize) => {
    setEditingPrize(p);
    setFormError("");
    setForm({ label: p.label, type: p.type, value: p.value, probability: p.probability, color: p.color, enabled: p.enabled });
    setShowForm(true);
  };

  const savePrize = () => {
    if (!form.label.trim()) {
      setFormError("Add a name for this prize.");
      return;
    }
    if (!Number.isInteger(form.probability) || form.probability < 1 || form.probability > 99) {
      setFormError("Probability must be a whole number from 1 to 99.");
      return;
    }
    if (form.type === "coupon" && !promotions.some(p => p.code === form.value.trim().toUpperCase())) {
      setFormError("Choose a coupon code that is available in Promotions.");
      return;
    }
    if (editingPrize) {
      savePrizes(prizes.map((p) => p.id === editingPrize.id ? { ...p, ...form, label: form.label.trim() } : p));
    } else {
      savePrizes([...prizes, { ...form, label: form.label.trim(), id: `p${Date.now()}` }]);
    }
    setShowForm(false);
  };

  const deletePrize = (id: string) => savePrizes(prizes.filter((p) => p.id !== id));

  const togglePrize = (id: string) => savePrizes(prizes.map((p) => p.id === id ? { ...p, enabled: !p.enabled } : p));

  const COLORS = ["#2D6A4F", "#1B4332", "#F4A261", "#95D5B2", "#D8F3DC", "#B7E4C7", "#74C69D", "#40916C"];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Spin Wheel</h1>
          <p className="text-muted-foreground text-sm">Manage the customer wheel, daily limits, and reward history. Changes are saved in this browser.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          {(["wheel", "winners"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-5 py-3 text-sm font-semibold capitalize border-b-2 -mb-px transition-colors",
                activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab === "winners" ? "Winner History" : "Wheel Preview & Prizes"}
            </button>
          ))}
        </div>

        {activeTab === "wheel" && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Wheel Preview */}
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                {/* Pointer */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
                  <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[24px] border-l-transparent border-r-transparent border-b-foreground" />
                </div>

                {/* Wheel */}
                <div
                  className="relative w-64 h-64 md:w-80 md:h-80 rounded-full border-4 border-foreground shadow-2xl overflow-hidden"
                  style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? "none" : "" }}
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {activePrizes.map((prize, i) => {
                      const startAngle = i * segmentAngle;
                      const endAngle = startAngle + segmentAngle;
                      const x1 = 50 + 50 * Math.cos((startAngle * Math.PI) / 180);
                      const y1 = 50 + 50 * Math.sin((startAngle * Math.PI) / 180);
                      const x2 = 50 + 50 * Math.cos((endAngle * Math.PI) / 180);
                      const y2 = 50 + 50 * Math.sin((endAngle * Math.PI) / 180);
                      const midAngle = (startAngle + endAngle) / 2;
                      const tx = 50 + 33 * Math.cos((midAngle * Math.PI) / 180);
                      const ty = 50 + 33 * Math.sin((midAngle * Math.PI) / 180);

                      return (
                        <g key={prize.id}>
                          <path
                            d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`}
                            fill={prize.color}
                          />
                          <text
                            x={tx}
                            y={ty}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="white"
                            fontSize="3.5"
                            fontWeight="bold"
                            transform={`rotate(${midAngle}, ${tx}, ${ty})`}
                          >
                            {prize.label}
                          </text>
                        </g>
                      );
                    })}
                    <circle cx="50" cy="50" r="8" fill="#1a1a1a" />
                  </svg>
                </div>
              </div>

              <button
                onClick={spinWheel}
                disabled={spinning || activePrizes.length < 2}
                className="px-10 py-4 bg-primary text-primary-foreground rounded-full font-bold text-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
              >
                {spinning ? "Spinning..." : "Test Spin"}
              </button>

              {/* Result */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3 bg-accent text-accent-foreground px-6 py-4 rounded-2xl shadow-lg"
                  >
                    <Trophy size={24} />
                    <div>
                      <p className="font-bold">Prize Won!</p>
                      <p className="text-sm">{result.label}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Prize Management */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Prizes ({prizes.length})</h2>
                <button
                  onClick={openAdd}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  <Plus size={16} /> Add Prize
                </button>
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {prizes.map((prize) => (
                  <div
                    key={prize.id}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border transition-colors",
                      prize.enabled ? "border-border bg-card" : "border-border bg-muted/30 opacity-60"
                    )}
                  >
                    <div className="w-5 h-5 rounded-full shrink-0" style={{ backgroundColor: prize.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{prize.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {TYPE_LABELS[prize.type]} · {prize.probability}% chance
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => togglePrize(prize.id)} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
                        {prize.enabled ? <ToggleRight size={18} className="text-primary" /> : <ToggleLeft size={18} className="text-muted-foreground" />}
                      </button>
                      <button onClick={() => openEdit(prize)} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
                        <Edit2 size={15} className="text-muted-foreground" />
                      </button>
                      <button onClick={() => deletePrize(prize.id)} className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors">
                        <Trash2 size={15} className="text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Probability Summary */}
              <div className="p-4 bg-muted/50 rounded-xl text-sm">
                <p className="font-semibold mb-2">Probability Distribution</p>
                <div className="flex flex-wrap gap-2">
                  {activePrizes.map((p) => (
                    <span key={p.id} className="text-xs px-2 py-1 rounded-full text-white font-medium" style={{ backgroundColor: p.color }}>
                      {p.label}: {p.probability}%
                    </span>
                  ))}
                </div>
                <p className={cn("text-xs mt-2", totalProb !== 100 ? "text-amber-600 font-semibold" : "text-muted-foreground")}>
                  Total: {totalProb}% {totalProb !== 100 ? "(⚠️ should sum to 100%)" : "✅"}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "winners" && (
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="overflow-x-auto"><table className="w-full min-w-[600px]"><thead className="bg-muted/50"><tr>{["Customer", "Prize", "Reward code", "Date", "Action"].map((heading) => <th key={heading} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{heading}</th>)}</tr></thead>
              <tbody className="divide-y divide-border">{winners.map((winner) => <tr key={winner.id}><td className="px-5 py-3 text-sm">{winner.user}</td><td className="px-5 py-3 text-sm font-semibold">{winner.prize}</td><td className="px-5 py-3 font-mono text-sm">{winner.rewardCode || "—"}</td><td className="px-5 py-3 text-sm text-muted-foreground">{new Date(winner.date).toLocaleString()}</td><td className="px-5 py-3">{winner.email ? <a href={`mailto:${encodeURIComponent(winner.email)}?subject=${encodeURIComponent(`Your ${winner.prize} reward`)}`} className="text-xs font-semibold text-primary hover:underline">Email customer</a> : <span className="text-xs text-muted-foreground">No email</span>}</td></tr>)}
                {winners.length === 0 && <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-muted-foreground">Customer wins will appear here after a spin.</td></tr>}
              </tbody></table></div>
          </div>
        )}
      </div>

      {/* Prize Form Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowForm(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] bg-background border border-border rounded-2xl z-50 shadow-2xl"
            >
              <div className="flex items-center justify-between p-5 border-b">
                <h2 className="font-bold">{editingPrize ? "Edit Prize" : "Add Prize"}</h2>
                <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-muted rounded-lg"><X size={18} /></button>
              </div>
              <div className="p-5 space-y-4">
                {formError && <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</p>}
                <div>
                  <label className="block text-sm font-medium mb-1">Prize Label</label>
                  <input
                    type="text"
                    value={form.label}
                    onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
                    placeholder="e.g. 20% OFF"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Prize Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as PrizeType }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none text-sm"
                  >
                    {(Object.entries(TYPE_LABELS) as [PrizeType, string][]).filter(([value]) => value !== "discount").map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Value</label>
                    <input
                      type="text"
                      value={form.value}
                      onChange={(e) => setForm((p) => ({ ...p, value: e.target.value.toUpperCase() }))}
                      placeholder={form.type === "coupon" ? "e.g. WELCOME10" : "Reward value or SKU"}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none text-sm"
                  />
                </div>
                {form.type === "coupon" && <p className="-mt-2 text-xs text-muted-foreground">Available codes: {promotions.filter(p => p.isActive).map(p => p.code).join(", ")}</p>}
                <div>
                  <label className="block text-sm font-medium mb-1">Probability (%)</label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={form.probability}
                    onChange={(e) => setForm((p) => ({ ...p, probability: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Segment Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setForm((p) => ({ ...p, color: c }))}
                        className={cn("w-8 h-8 rounded-full transition-transform hover:scale-110", form.color === c && "ring-2 ring-offset-2 ring-foreground scale-110")}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-5 border-t flex gap-3">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-border font-semibold text-sm hover:bg-muted">
                  Cancel
                </button>
                <button onClick={savePrize} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 flex items-center justify-center gap-2">
                  <Check size={16} /> Save
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
