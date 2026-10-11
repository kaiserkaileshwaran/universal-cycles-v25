/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { sendPushNotification } from "@/lib/push-helper";
import { Percent, Tag, Plus, Edit2, Trash2, X, Check, Eye, EyeOff } from "lucide-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { formatPrice } from "@/lib/utils";
import { usePromotions, type Promotion } from "@/contexts/promotions-context";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminPromotionsPage() {
  const { promotions, setPromotions } = usePromotions();
  const [showForm, setShowForm] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
  const [form, setForm] = useState<Partial<Promotion>>({
    code: "",
    description: "",
    kind: "percent",
    value: 10,
    minimum: 0,
    isPublic: true,
    isActive: true
  });
  const [successMsg, setSuccessMsg] = useState("");

  const handleEdit = (p: Promotion) => {
    setEditingPromo(p);
    setForm(p);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.code) return;
    const code = form.code.toUpperCase().trim();
    if (editingPromo) {
      setPromotions(prev => prev.map(p => p.id === editingPromo.id ? { ...p, ...form, code } as Promotion : p));
      setSuccessMsg("Promotion updated successfully!");
    } else {
      setPromotions(prev => [{ ...form, id: `promo-\${Date.now()}`, code } as Promotion, ...prev]);
      setSuccessMsg("Promotion created successfully!");
    }
    setShowForm(false);
    setEditingPromo(null);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleDelete = (id: string) => {
    setPromotions(prev => prev.filter(p => p.id !== id));
    setSuccessMsg("Promotion deleted successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {successMsg && (
          <div className="bg-green-100/50 border border-green-500/20 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
            {successMsg}
            <button onClick={() => setSuccessMsg("")} className="hover:text-green-900"><X size={16} /></button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Promotions</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage active discount codes for your store.</p>
          </div>
          <button 
            onClick={() => { setEditingPromo(null); setForm({ code: "", description: "", kind: "percent", value: 10, minimum: 0, isPublic: true, isActive: true }); setShowForm(true); }}
            className="bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus size={18} /> Add Promotion
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><Tag size={22} /></span><div><p className="text-sm text-muted-foreground">Total Codes</p><p className="text-2xl font-bold">{promotions.length}</p></div></div>
          <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-700"><Percent size={22} /></span><div><p className="text-sm text-muted-foreground">Active Codes</p><p className="text-2xl font-bold">{promotions.filter(p => p.isActive).length}</p></div></div>
          <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-700"><EyeOff size={22} /></span><div><p className="text-sm text-muted-foreground">Hidden Codes</p><p className="text-2xl font-bold">{promotions.filter(p => !p.isPublic).length}</p></div></div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto"><table className="w-full min-w-[620px]">
            <thead className="bg-muted/50"><tr>{["Code", "Offer", "Min Spend", "Visibility", "Status", "Actions"].map((h) => <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-border">{promotions.map((p) => <tr key={p.id}>
              <td className="px-5 py-4 font-mono font-bold">{p.code}</td>
              <td className="px-5 py-4">{p.kind === "percent" ? `\${p.value}% off` : p.kind === "shipping" ? "Free shipping" : `\${formatPrice(p.value)} off`}</td>
              <td className="px-5 py-4 text-sm text-muted-foreground">{p.minimum ? formatPrice(p.minimum) : "No minimum"}</td>
              <td className="px-5 py-4">{p.isPublic ? <span className="flex items-center gap-1 text-xs text-blue-600"><Eye size={14}/> Public</span> : <span className="flex items-center gap-1 text-xs text-purple-600"><EyeOff size={14}/> Hidden</span>}</td>
              <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold \${p.isActive ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>{p.isActive ? 'Active' : 'Inactive'}</span></td>
              <td className="px-5 py-4 text-right">
                <button onClick={() => handleEdit(p)} className="p-1.5 hover:bg-muted rounded-md mr-1 text-muted-foreground hover:text-primary"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-destructive/10 rounded-md text-muted-foreground hover:text-destructive"><Trash2 size={16} /></button>
              </td>
            </tr>)}
            {promotions.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">No promotions found.</td></tr>}
            </tbody>
          </table></div>
        </div>

        <AnimatePresence>
          {showForm && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowForm(false)} />
              <motion.div initial={{ opacity: 0, x: "100%" }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background border-l border-border shadow-2xl z-50 flex flex-col">
                <div className="p-6 border-b flex items-center justify-between">
                  <h2 className="text-xl font-bold">{editingPromo ? "Edit Promotion" : "Add Promotion"}</h2>
                  <button onClick={() => setShowForm(false)} className="p-2 hover:bg-muted rounded-full transition-colors"><X size={20} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                  <div><label className="block text-sm font-medium mb-1">Code</label><input type="text" value={form.code} onChange={(e) => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="e.g. SUMMER20" className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none text-sm font-mono uppercase" /></div>
                  <div><label className="block text-sm font-medium mb-1">Description</label><input type="text" value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Summer Sale" className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none text-sm" /></div>
                  <div><label className="block text-sm font-medium mb-1">Type</label><select value={form.kind} onChange={(e) => setForm(p => ({ ...p, kind: e.target.value as any }))} className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none text-sm"><option value="percent">Percentage Off</option><option value="fixed">Fixed Amount Off</option><option value="shipping">Free Shipping</option></select></div>
                  {form.kind !== "shipping" && <div><label className="block text-sm font-medium mb-1">Discount Value {form.kind === "percent" ? "(%)" : "(₹)"}</label><input type="number" value={form.value} onChange={(e) => setForm(p => ({ ...p, value: Number(e.target.value) }))} className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none text-sm" /></div>}
                  <div><label className="block text-sm font-medium mb-1">Minimum Spend (₹)</label><input type="number" value={form.minimum} onChange={(e) => setForm(p => ({ ...p, minimum: Number(e.target.value) }))} className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none text-sm" /></div>
                  <div className="flex flex-col gap-3 pt-2">
                    <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={form.isPublic} onChange={(e) => setForm(p => ({ ...p, isPublic: e.target.checked }))} className="w-4 h-4 accent-primary" /><div><p className="text-sm font-medium">Public Checkout Code</p><p className="text-xs text-muted-foreground">Users can click to apply this in cart</p></div></label>
                    <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm(p => ({ ...p, isActive: e.target.checked }))} className="w-4 h-4 accent-primary" /><div><p className="text-sm font-medium">Active</p><p className="text-xs text-muted-foreground">Code is currently redeemable</p></div></label>
                  </div>
                </div>
                <div className="p-6 border-t flex gap-3">
                  <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border border-border font-semibold hover:bg-muted transition-colors">Cancel</button>
                  <button onClick={handleSave} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"><Check size={18} /> Save</button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
