"use client";

import { useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Search, Star, EyeOff, Eye, Edit2, X, Check } from "lucide-react";
import { useReviews } from "@/contexts/reviews-context";
import { useProducts } from "@/contexts/products-context";

export default function AdminReviewsPage() {
  const { reviews, updateReview } = useReviews();
  const { products } = useProducts();
  const [search, setSearch] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const [editingReview, setEditingReview] = useState<import("@/types").Review | null>(null);

  const handleToggleHide = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "hidden" ? "approved" : "hidden";
    updateReview(id, { status: newStatus });
    setSuccessMsg(newStatus === "hidden" ? "Review hidden from customers" : "Review is now visible to customers");
    setTimeout(() => setSuccessMsg(""), 3000);
  };
  
  const handleApprove = (id: string) => {
    updateReview(id, { status: "approved" });
    setSuccessMsg("Review approved!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingReview) {
      updateReview(editingReview.id, {
        title: editingReview.title,
        comment: editingReview.comment,
        rating: editingReview.rating,
      });
      setSuccessMsg("Review updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
      setEditingReview(null);
    }
  };

  const getProductName = (productId: string) => {
    return products.find(p => p.id === productId)?.name || "Unknown Product";
  };

  const filtered = reviews.filter(r => 
    r.userName.toLowerCase().includes(search.toLowerCase()) || 
    getProductName(r.productId).toLowerCase().includes(search.toLowerCase()) ||
    r.comment.toLowerCase().includes(search.toLowerCase())
  );

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
            <h1 className="text-2xl md:text-3xl font-bold">Reviews</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage and moderate customer reviews</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col h-[calc(100vh-12rem)] min-h-[400px]">
          <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 justify-between shrink-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="text"
                placeholder="Search reviews..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-card z-10">
                <tr className="border-b border-border bg-muted/20">
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Customer & Product</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Rating</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Comment</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((review) => (
                  <tr key={review.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{review.userName}</p>
                        {review.isVerified && <span className="bg-blue-100 text-blue-600 text-[10px] px-1.5 py-0.5 rounded-sm font-bold flex items-center gap-1"><Check size={10}/> Verified</span>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{getProductName(review.productId)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className={i < review.rating ? "fill-current" : "text-muted-foreground/30"} />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      
                      <p className="text-sm line-clamp-2 max-w-md">{review.comment}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        review.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                        review.status === 'hidden' ? 'bg-rose-100 text-rose-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {review.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {(!review.status || review.status === 'pending') && (
                           <button onClick={() => handleApprove(review.id)} className="p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-600 transition-colors" title="Approve">
                             <Check size={16} />
                           </button>
                        )}
                        <button onClick={() => setEditingReview(review)} className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary" title="Edit">
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => handleToggleHide(review.id, review.status || 'pending')} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive" title={review.status === 'hidden' ? "Show" : "Hide"}>
                          {review.status === 'hidden' ? <Eye size={15} /> : <EyeOff size={15} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-muted-foreground">
                      No reviews found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Modal */}
        {editingReview && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-background rounded-2xl w-full max-w-md p-6">
              <h3 className="text-xl font-bold mb-4">Edit Review</h3>
              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Rating</label>
                  <input type="number" min="1" max="5" value={editingReview.rating} onChange={(e) => setEditingReview({...editingReview, rating: Number(e.target.value)})} className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Title</label>
                  <input type="text" value={editingReview.title} onChange={(e) => setEditingReview({...editingReview, title: e.target.value})} className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Comment</label>
                  <textarea rows={4} value={editingReview.comment} onChange={(e) => setEditingReview({...editingReview, comment: e.target.value})} className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary" />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setEditingReview(null)} className="flex-1 py-2 rounded-xl border border-border hover:bg-muted text-sm font-semibold transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold transition-colors">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
