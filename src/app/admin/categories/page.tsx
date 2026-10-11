/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Plus, Edit2, Trash2, X, Check } from "lucide-react";
import { useCategories } from "@/contexts/categories-context";

import { motion, AnimatePresence } from "framer-motion";

export default function AdminCategoriesPage() {
  const { categories, setCategories } = useCategories();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ id: "", name: "", slug: "", description: "", subcategories: [] as { id: string; name: string; slug: string }[] });
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const handleEdit = (c: any) => {
    setEditingCategory(c);
    setForm({ id: c.id, name: c.name, slug: c.slug, description: c.description || "", subcategories: c.subcategories || [] });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name || !form.slug) return;
    if (editingCategory) {
      setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, name: form.name, slug: form.slug, description: form.description, subcategories: form.subcategories } : c));
      setSuccessMsg("Category updated successfully!");
    } else {
      setCategories(prev => [...prev, { ...form, id: form.slug, subcategories: [] }]);
      setSuccessMsg("Category created successfully!");
    }
    setShowForm(false);
    setEditingCategory(null);
    setForm({ id: "", name: "", slug: "", description: "", subcategories: [] });
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleDelete = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    setSuccessMsg("Category deleted successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {successMsg && (
          <div className="bg-green-100/50 border border-green-500/20 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
            {successMsg}
            <button onClick={() => setSuccessMsg("")} className="text-green-700/50 hover:text-green-700"><X size={16} /></button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Categories</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage product categories and subcategories</p>
          </div>
          <button 
            onClick={() => { setEditingCategory(null); setForm({ id: "", name: "", slug: "", description: "", subcategories: [] }); setShowForm(true); }}
            className="bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Add Category
          </button>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Category</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Slug</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Subcategories</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-4">
                      <p className="font-medium text-sm">{category.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{category.description}</p>
                    </td>
                    <td className="px-4 py-4 text-sm font-mono text-muted-foreground">{category.slug}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {category.subcategories?.map(sub => (
                          <span key={sub.id} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md">
                            {sub.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(category)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary"><Edit2 size={15} /></button>
                        <button onClick={() => handleDelete(category.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-16 text-muted-foreground">
                      No categories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <AnimatePresence>
          {showForm && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setShowForm(false)}
              />
              <motion.div
                initial={{ opacity: 0, x: "100%" }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background border-l border-border shadow-2xl z-50 flex flex-col"
              >
                <div className="p-6 border-b flex items-center justify-between">
                  <h2 className="text-xl font-bold">{editingCategory ? "Edit Category" : "Add Category"}</h2>
                  <button onClick={() => setShowForm(false)} className="p-2 hover:bg-muted rounded-full transition-colors"><X size={20} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">Category Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") }))}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Slug</label>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Subcategories</label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        placeholder="New subcategory name"
                        id="new-sub-input"
                        className="flex-1 px-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const val = e.currentTarget.value.trim();
                            if (val) {
                              setForm(p => ({
                                ...p,
                                subcategories: [...p.subcategories, { id: val.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name: val, slug: val.toLowerCase().replace(/[^a-z0-9]+/g, "-") }]
                              }));
                              e.currentTarget.value = "";
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById("new-sub-input") as HTMLInputElement;
                          const val = input.value.trim();
                          if (val) {
                            setForm(p => ({
                              ...p,
                              subcategories: [...p.subcategories, { id: val.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name: val, slug: val.toLowerCase().replace(/[^a-z0-9]+/g, "-") }]
                            }));
                            input.value = "";
                          }
                        }}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    {form.subcategories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {form.subcategories.map((sub, idx) => (
                          <div key={idx} className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full text-sm">
                            {sub.name}
                            <button
                              type="button"
                              onClick={() => setForm(p => ({ ...p, subcategories: p.subcategories.filter((_, i) => i !== idx) }))}
                              className="text-muted-foreground hover:text-destructive transition-colors ml-1"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-6 border-t flex gap-3">
                  <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border border-border font-semibold hover:bg-muted transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleSave} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                    <Check size={18} /> {editingCategory ? "Save Changes" : "Create"}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </div>
    </AdminLayout>
  );
}
