"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Edit2, Trash2, X, Check, ChevronUp, ChevronDown
} from "lucide-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { useCategories } from "@/contexts/categories-context";
import { useBrands } from "@/contexts/brands-context";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useProducts } from "@/contexts/products-context";
import { sendPushNotification } from "@/lib/push-helper";

type SortField = "name" | "price" | "stock" | "rating";
type SortDir = "asc" | "desc";

type SortIconProps = {
  field: SortField;
  currentField: SortField;
  currentDir: SortDir;
};

function SortIcon({ field, currentField, currentDir }: SortIconProps) {
  if (currentField !== field) {
    return <ChevronDown size={14} className="opacity-20" />;
  }

  return currentDir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
}

export default function AdminProductsPage() {
  const { products, setProducts } = useProducts();
  const { categories: CATEGORIES } = useCategories();
  const { brands: dynamicBrands } = useBrands();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    brand: "",
    price: "",
    salePrice: "",
    stock: "",
    categoryId: "",
    subcategoryId: "",
    description: "",
    isActive: true,
    images: [] as string[],
  });

  const [newImageUrl, setNewImageUrl] = useState("");
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const filtered = products
    .filter((p) => {
      const matchQ = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === "all" || p.categoryId === selectedCategory;
      return matchQ && matchCat;
    })
    .sort((a, b) => {
      let valA: string | number, valB: string | number;
      switch (sortField) {
        case "price": valA = a.salePrice ?? a.price; valB = b.salePrice ?? b.price; break;
        case "stock": valA = a.stock; valB = b.stock; break;
        case "rating": valA = a.rating; valB = b.rating; break;
        default: valA = a.name; valB = b.name;
      }
      if (sortDir === "asc") return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  };

  const openNew = () => {
    setEditingProduct(null);
    setForm({ name: "", brand: "", price: "", salePrice: "", stock: "", categoryId: "", subcategoryId: "", description: "", isActive: true, images: [] });
    setNewImageUrl("");
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({
      name: p.name,
      brand: p.brand,
      price: String(p.price),
      salePrice: p.salePrice ? String(p.salePrice) : "",
      stock: String(p.stock),
      categoryId: p.categoryId,
      subcategoryId: p.subcategoryId || "",
      description: p.description,
      isActive: p.isActive,
      images: p.images || [],
    });
    setNewImageUrl("");
    setFormError("");
    setShowForm(true);
  };

  const handleSave = () => {
    const price = Number(form.price);
    const salePrice = form.salePrice ? Number(form.salePrice) : undefined;
    const stock = Number(form.stock);
    if (!form.name.trim() || !form.description.trim() || !form.brand || !form.categoryId) {
      setFormError("Complete the name, description, brand, and category before saving.");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setFormError("Enter a valid price greater than ₹0.");
      return;
    }
    if (salePrice !== undefined && (!Number.isFinite(salePrice) || salePrice <= 0 || salePrice >= price)) {
      setFormError("Sale price must be greater than ₹0 and lower than the regular price.");
      return;
    }
    if (!Number.isInteger(stock) || stock < 0) {
      setFormError("Stock must be a whole number of 0 or more.");
      return;
    }
    const now = Date.now();
    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? { ...p, ...form, name: form.name.trim(), description: form.description.trim(), price, salePrice, stock, subcategoryId: form.subcategoryId || undefined, thumbnail: form.images[0] ?? p.thumbnail, updatedAt: now }
            : p
        )
      );
    } else {
      const newProduct: Product = {
        id: `p${Date.now()}`,
        ...form,
        name: form.name.trim(),
        description: form.description.trim(),
        price,
        salePrice,
        stock,
        images: form.images,
        thumbnail: form.images.length > 0 ? form.images[0] : "/background-landscape.png",
        variants: [],
        specifications: {},
        features: [],
        rating: 0,
        reviewsCount: 0,
        tags: [],
        createdAt: now,
        updatedAt: now,
      };
      setProducts((prev) => [newProduct, ...prev]);
      sendPushNotification("New Arrival!", `Check out our new ${newProduct.name}`, `/products/${newProduct.id}`);
    }
    setFormError("");
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleteId(null);
    setSuccessMsg("Product deleted successfully!");
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
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Products</h1>
            <p className="text-muted-foreground text-sm">{products.length} total products</p>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            <Plus size={18} /> Add Product
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none text-sm"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">
                    Product
                  </th>
                  <th
                    className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 cursor-pointer hover:text-foreground"
                    onClick={() => toggleSort("price")}
                  >
                    <div className="flex items-center gap-1">Price <SortIcon field="price" currentField={sortField} currentDir={sortDir} /></div>
                  </th>
                  <th
                    className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 cursor-pointer hover:text-foreground"
                    onClick={() => toggleSort("stock")}
                  >
                    <div className="flex items-center gap-1">Stock <SortIcon field="stock" currentField={sortField} currentDir={sortDir} /></div>
                  </th>
                  <th
                    className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 cursor-pointer hover:text-foreground"
                    onClick={() => toggleSort("rating")}
                  >
                    <div className="flex items-center gap-1">Rating <SortIcon field="rating" currentField={sortField} currentDir={sortDir} /></div>
                  </th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                          <Image src={product.thumbnail} alt={product.name} fill sizes="60px" className="object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold">{formatPrice(product.salePrice ?? product.price)}</p>
                        {product.salePrice && (
                          <p className="text-xs text-muted-foreground line-through">{formatPrice(product.price)}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "text-sm font-semibold",
                        product.stock === 0 ? "text-destructive" : product.stock < 10 ? "text-amber-600" : "text-green-600"
                      )}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="text-sm">⭐</span>
                        <span className="text-sm">{product.rating}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "text-xs font-semibold px-2 py-1 rounded-full",
                        product.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                      )}>
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(product)}
                          aria-label={`Edit ${product.name}`}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteId(product.id)}
                          aria-label={`Delete ${product.name}`}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-muted-foreground">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add / Edit Form Modal */}
        <AnimatePresence>
          {showForm && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50"
                onClick={() => setShowForm(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed inset-x-4 top-8 bottom-8 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[600px] sm:max-h-[85vh] bg-background border border-border rounded-2xl z-50 flex flex-col overflow-hidden shadow-2xl"
              >
                <div className="flex items-center justify-between p-6 border-b">
                  <h2 className="text-xl font-bold">{editingProduct ? "Edit Product" : "Add New Product"}</h2>
                  <button onClick={() => setShowForm(false)} className="p-2 hover:bg-muted rounded-lg">
                    <X size={20} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {formError && (
                    <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                      {formError}
                    </p>
                  )}
                  {[
                    { label: "Product Name", key: "name", placeholder: "e.g. TrailBlazer MTB Pro" },
                    { label: "Description", key: "description", placeholder: "Product description..." },
                  ].map(({ label, key, placeholder }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium mb-1">{label}</label>
                      {key === "description" ? (
                        <textarea
                          value={form[key as keyof typeof form] as string}
                          onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                          placeholder={placeholder}
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none"
                        />
                      ) : (
                        <input
                          type="text"
                          value={form[key as keyof typeof form] as string}
                          onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                          placeholder={placeholder}
                          className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                        />
                      )}
                    </div>
                  ))}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Brand</label>
                      <select
                        value={form.brand}
                        onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none text-sm"
                      >
                        <option value="">Select brand</option>
                        {dynamicBrands.map((b) => <option key={b.id} value={b.name}>{b.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Category</label>
                      <select
                        value={form.categoryId}
                        onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value, subcategoryId: "" }))}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none text-sm"
                      >
                        <option value="">Select category</option>
                        {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Subcategory</label>
                      <select
                        value={form.subcategoryId}
                        onChange={(e) => setForm((p) => ({ ...p, subcategoryId: e.target.value }))}
                        disabled={!form.categoryId || !(CATEGORIES.find(c => c.id === form.categoryId)?.subcategories?.length)}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none text-sm disabled:opacity-50"
                      >
                        <option value="">Select subcategory</option>
                        {(CATEGORIES.find(c => c.id === form.categoryId)?.subcategories || []).map((sub) => (
                          <option key={sub.id} value={sub.id}>{sub.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Price (₹)</label>
                      <input
                        type="number"
                        value={form.price}
                        onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                        placeholder="0.00"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Sale Price (₹)</label>
                      <input
                        type="number"
                        value={form.salePrice}
                        onChange={(e) => setForm((p) => ({ ...p, salePrice: e.target.value }))}
                        placeholder="Optional"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Stock Quantity</label>
                      <input
                        type="number"
                        value={form.stock}
                        onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))}
                        placeholder="0"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none text-sm"
                      />
                    </div>
                    <div className="flex items-end pb-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.isActive}
                          onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                          className="rounded accent-primary w-4 h-4"
                        />
                        <span className="text-sm font-medium">Active / Published</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Product Images</label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="url"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1 px-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (newImageUrl.trim()) {
                              setForm(p => ({ ...p, images: [...p.images, newImageUrl.trim()] }));
                              setNewImageUrl("");
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newImageUrl.trim()) {
                            setForm(p => ({ ...p, images: [...p.images, newImageUrl.trim()] }));
                            setNewImageUrl("");
                          }
                        }}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    {form.images.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {form.images.map((url, idx) => (
                          <div key={idx} className="relative aspect-square rounded-lg border border-border overflow-hidden group">
                            <Image src={url} alt={`Preview ${idx}`} fill sizes="80px" className="object-cover" />
                            <button
                              type="button"
                              onClick={() => setForm(p => ({ ...p, images: p.images.filter((_, i) => i !== idx) }))}
                              className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
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
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-3 rounded-xl border border-border font-semibold hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Check size={18} /> {editingProduct ? "Save Changes" : "Create Product"}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Delete Confirm */}
        <AnimatePresence>
          {deleteId && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] bg-background border border-border rounded-2xl p-6 z-50 shadow-2xl"
              >
                <h3 className="text-lg font-bold mb-2">Delete Product?</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  This action cannot be undone. The product will be permanently removed.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteId(null)}
                    className="flex-1 py-3 rounded-xl border border-border font-semibold hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteId)}
                    className="flex-1 py-3 rounded-xl bg-destructive text-destructive-foreground font-semibold hover:bg-destructive/90"
                  >
                    Delete
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
