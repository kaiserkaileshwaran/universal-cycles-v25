"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, X, Check, Award } from "lucide-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { useBrands, type Brand } from "@/contexts/brands-context";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminBrandsPage() {
  const { brands, setBrands } = useBrands();
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [form, setForm] = useState<{ name: string; slug: string }>({ name: "", slug: "" });
  const [successMsg, setSuccessMsg] = useState("");

  const handleEdit = (b: Brand) => {
    setEditingBrand(b);
    setForm({ name: b.name, slug: b.slug });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    const name = form.name.trim();
    const slug = form.slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    
    if (editingBrand) {
      setBrands(prev => prev.map(b => b.id === editingBrand.id ? { ...b, name, slug } : b));
      setSuccessMsg("Brand updated successfully!");
    } else {
      setBrands(prev => [...prev, { id: slug, name, slug }]);
      setSuccessMsg("Brand created successfully!");
    }
    
    setShowForm(false);
    setEditingBrand(null);
    setForm({ name: "", slug: "" });
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleDelete = (id: string) => {
    setBrands(prev => prev.filter(b => b.id !== id));
    setSuccessMsg("Brand deleted successfully!");
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
            <h1 className="text-2xl font-bold md:text-3xl">Brand Management</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage cycle brands available in your store.</p>
          </div>
          <button 
            onClick={() => { setEditingBrand(null); setForm({ name: "", slug: "" }); setShowForm(true); }}
            className="bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus size={18} /> Add Brand
          </button>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700"><Award size={22} /></div>
          <div><p className="text-sm text-muted-foreground">Total Brands</p><p className="text-2xl font-bold">{brands.length}</p></div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto"><table className="w-full">
            <thead className="bg-muted/50"><tr>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Brand Name</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Slug</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-border">{brands.map((b) => <tr key={b.id}>
              <td className="px-5 py-4 font-semibold">{b.name}</td>
              <td className="px-5 py-4 font-mono text-sm text-muted-foreground">{b.slug}</td>
              <td className="px-5 py-4 text-right">
                <button onClick={() => handleEdit(b)} className="p-1.5 hover:bg-muted rounded-md mr-1 text-muted-foreground hover:text-primary"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(b.id)} className="p-1.5 hover:bg-destructive/10 rounded-md text-muted-foreground hover:text-destructive"><Trash2 size={16} /></button>
              </td>
            </tr>)}
            {brands.length === 0 && <tr><td colSpan={3} className="px-5 py-10 text-center text-muted-foreground">No brands found.</td></tr>}
            </tbody>
          </table></div>
        </div>

        <AnimatePresence>
          {showForm && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowForm(false)} />
              <motion.div initial={{ opacity: 0, x: "100%" }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background border-l border-border shadow-2xl z-50 flex flex-col">
                <div className="p-6 border-b flex items-center justify-between">
                  <h2 className="text-xl font-bold">{editingBrand ? "Edit Brand" : "Add Brand"}</h2>
                  <button onClick={() => setShowForm(false)} className="p-2 hover:bg-muted rounded-full transition-colors"><X size={20} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-1">Brand Name</label>
                    <input type="text" value={form.name} onChange={(e) => setForm({ name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") })} placeholder="e.g. Hero Cycles" className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Slug</label>
                    <input type="text" value={form.slug} onChange={(e) => setForm(p => ({ ...p, slug: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none text-sm font-mono" />
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
