"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, MapPin, LogOut, Plus, X, Edit2, Package, ChevronRight } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/contexts/auth-context";
import { updateProfile } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useAddresses } from "@/contexts/addresses-context";
import { useOrders } from "@/contexts/orders-context";
import type { Address } from "@/types";
import { cn, formatPrice } from "@/lib/utils";
export default function AccountPage() {
  const { user, loading, signOut } = useAuth();
  const { getAddresses, saveAddress, setDefaultAddress, deleteAddress } = useAddresses();
  const { orders } = useOrders();
  const userOrders = orders.filter(o => o.userId === user?.uid).sort((a,b) => b.createdAt - a.createdAt);
  const router = useRouter();
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [profileMessage, setProfileMessage] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Partial<Address> | null>(null);

  const savedAddresses = user ? getAddresses(user.uid) : [];

  useEffect(() => {
    if (!loading && user === null && !isLoggingOut) {
      router.replace("/login");
    }
  }, [user, loading, isLoggingOut, router]);

  // Sync displayName when user loads
  useEffect(() => {
    if (user?.displayName && !displayName) {
      setDisplayName(user.displayName);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading account details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut();
    router.push("/login");
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const newAddress: Address = {
      id: editingAddress?.id || crypto.randomUUID(),
      label: formData.get("label") as string,
      fullName: formData.get("fullName") as string,
      phone: formData.get("phone") as string,
      street1: formData.get("street1") as string,
      street2: formData.get("street2") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      zipCode: formData.get("zipCode") as string,
      country: formData.get("country") as string,
      isDefault: formData.get("isDefault") === "on" || (editingAddress ? editingAddress.isDefault : false) || false,
    };
    
    // If setting this one as default, we might need to manually update others?
    // Wait, addresses-context doesn't automatically unset others on saveAddress if isDefault is true.
    // Actually, setting default is handled by setDefaultAddress in the context.
    saveAddress(user.uid, newAddress);
    if (newAddress.isDefault) {
      setDefaultAddress(user.uid, newAddress.id);
    }
    
    setIsAddressModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <Navbar />

      <div className="flex-1 container mx-auto px-4 md:px-8 pt-28 pb-16 md:pt-36 max-w-5xl">
        <h1 className="text-3xl font-bold mb-8 text-center">My Profile</h1>
        
        <div className="space-y-8">
          {/* Profile Information */}
          <div className="bg-card border border-border shadow-sm rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <User size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold">Profile Information</h2>
                <p className="text-sm text-muted-foreground">Manage your personal details</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-foreground mb-1.5 block">Display Name</label>
                <input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm font-medium"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1.5 block">Email Address</label>
                <input
                  defaultValue={user.email ?? ""}
                  disabled
                  className="w-full px-4 py-3.5 rounded-xl border border-border bg-muted/80 text-muted-foreground text-sm font-medium cursor-not-allowed truncate"
                />
              </div>
            </div>
            
            <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <button 
                onClick={async () => {
                  setProfileMessage("");
                  try {
                    const nextName = displayName.trim() || user.displayName?.trim();
                    if (!nextName) throw new Error("Enter a display name.");
                    await updateProfile(user, { displayName: nextName });
                    setDisplayName(nextName);
                    setProfileMessage("Your profile name has been updated.");
                  } catch (error) {
                    setProfileMessage(error instanceof Error ? error.message : "We could not update your profile.");
                  }
                }} 
                className="bg-primary text-primary-foreground px-8 py-3.5 rounded-xl text-sm font-bold hover:bg-primary/90 hover:shadow-lg transition-all"
              >
                Save Changes
              </button>
              {profileMessage && <p role="status" className="text-sm font-medium text-green-600 bg-green-500/10 px-4 py-2 rounded-lg">{profileMessage}</p>}
            </div>
          </div>

          {/* Saved Addresses */}
          <div className="bg-card border border-border shadow-sm rounded-3xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Saved Addresses</h2>
                  <p className="text-sm text-muted-foreground">Manage your delivery locations</p>
                </div>
              </div>
              <button 
                onClick={() => { setEditingAddress(null); setIsAddressModalOpen(true); }}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shrink-0"
              >
                <Plus size={16} /> Add Address
              </button>
            </div>
            
            {savedAddresses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
                <p className="font-medium">No saved addresses yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Add a new address so you can check out faster.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {savedAddresses.map((address) => (
                  <article key={address.id} className="rounded-2xl border border-border bg-card p-5 relative">
                    {address.isDefault && (
                      <span className="absolute top-4 right-4 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary font-bold">Default</span>
                    )}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{address.label}</p>
                        <p className="mt-2 text-sm font-medium">{address.fullName} · {address.phone}</p>
                        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                          {address.street1}{address.street2 ? `, ${address.street2}` : ""}<br/>
                          {address.city}, {address.state} {address.zipCode}<br/>
                          {address.country}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-4 border-t border-border pt-4">
                      <button 
                        onClick={() => { setEditingAddress(address); setIsAddressModalOpen(true); }} 
                        className="text-sm font-semibold flex items-center gap-1 hover:text-primary transition-colors"
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={address.isDefault}
                            onChange={() => { if (!address.isDefault) setDefaultAddress(user.uid, address.id); }}
                          />
                          <div className="w-9 h-5 bg-muted border border-border rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary peer-checked:border-primary"></div>
                        </div>
                        <span className={cn("text-sm font-semibold transition-colors", address.isDefault ? "text-primary" : "text-muted-foreground group-hover:text-foreground")}>
                          Default Address
                        </span>
                      </label>
                      <button onClick={() => deleteAddress(user.uid, address.id)} className="text-sm font-semibold text-destructive hover:underline ml-auto">
                        Remove
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders Overview */}
          <div className="bg-card border border-border shadow-sm rounded-3xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                  <Package size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Recent Orders</h2>
                  <p className="text-sm text-muted-foreground">Quickly find your order details</p>
                </div>
              </div>
              <Link 
                href="/track-order"
                className="flex items-center gap-2 text-sm font-bold text-primary hover:underline shrink-0"
              >
                View all orders <ChevronRight size={16} />
              </Link>
            </div>
            
            {userOrders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
                <p className="font-medium">No orders yet</p>
                <p className="mt-1 text-sm text-muted-foreground">When you buy something, your order will show up here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userOrders.slice(0, 3).map((order) => (
                  <Link 
                    key={order.id} 
                    href={`/track-order?orderId=${order.id}`}
                    className="block rounded-2xl border border-border bg-card hover:bg-muted/30 hover:border-primary/50 transition-all p-4 sm:p-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1.5">
                          <span className="font-bold">Order #{order.id}</span>
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full",
                            order.status === "delivered" ? "bg-green-100 text-green-700" :
                            order.status === "cancelled" ? "bg-red-100 text-red-700" :
                            "bg-orange-100 text-orange-700"
                          )}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item{order.items.length !== 1 ? 's' : ''} · {formatPrice(order.total)}
                        </p>
                      </div>
                      <div className="text-sm font-semibold text-primary flex items-center gap-1 group-hover:underline">
                        Track Details <ChevronRight size={14} />
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-border flex items-center gap-3 overflow-x-auto pb-1">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 shrink-0 bg-muted/50 rounded-lg pr-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.thumbnail} alt={item.name} className="w-10 h-10 object-cover rounded-lg" />
                          <div className="truncate max-w-[120px]">
                            <p className="text-xs font-semibold truncate">{item.name}</p>
                            <p className="text-[10px] text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="pt-4">
            <button 
              onClick={handleLogout} 
              disabled={isLoggingOut}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-border bg-card hover:bg-muted font-bold text-destructive transition-colors mx-auto shadow-sm"
            >
              <LogOut size={18} /> {isLoggingOut ? "Logging out..." : "Log Out"}
            </button>
          </div>

        </div>
      </div>

      <Footer />

      {/* Address Form Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-background/95 backdrop-blur-md border-b border-border p-6 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold">{editingAddress ? "Edit Address" : "Add New Address"}</h2>
              <button onClick={() => setIsAddressModalOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveAddress} className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="text-sm font-semibold mb-1.5 block">Address Label (e.g., Home, Work)</label>
                  <input name="label" defaultValue={editingAddress?.label || ""} required className="w-full px-4 py-3.5 rounded-xl border border-border bg-background shadow-sm hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-sm" placeholder="Home" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-sm font-semibold mb-1.5 block">Full Name</label>
                  <input name="fullName" defaultValue={editingAddress?.fullName || ""} required className="w-full px-4 py-3.5 rounded-xl border border-border bg-background shadow-sm hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-sm" placeholder="John Doe" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-sm font-semibold mb-1.5 block">Phone Number</label>
                  <input name="phone" defaultValue={editingAddress?.phone || ""} required className="w-full px-4 py-3.5 rounded-xl border border-border bg-background shadow-sm hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-sm" placeholder="+1 (555) 000-0000" />
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-semibold mb-1.5 block">Street Address</label>
                  <input name="street1" defaultValue={editingAddress?.street1 || ""} required className="w-full px-4 py-3.5 rounded-xl border border-border bg-background shadow-sm hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-sm" placeholder="123 Main St" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-semibold mb-1.5 block text-muted-foreground">Apartment, suite, etc. (Optional)</label>
                  <input name="street2" defaultValue={editingAddress?.street2 || ""} className="w-full px-4 py-3.5 rounded-xl border border-border bg-background shadow-sm hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-sm" placeholder="Apt 4B" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-sm font-semibold mb-1.5 block">City</label>
                  <input name="city" defaultValue={editingAddress?.city || ""} required className="w-full px-4 py-3.5 rounded-xl border border-border bg-background shadow-sm hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-sm" placeholder="New York" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-sm font-semibold mb-1.5 block">State / Province</label>
                  <input name="state" defaultValue={editingAddress?.state || ""} required className="w-full px-4 py-3.5 rounded-xl border border-border bg-background shadow-sm hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-sm" placeholder="NY" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-sm font-semibold mb-1.5 block">ZIP / Postal Code</label>
                  <input name="zipCode" defaultValue={editingAddress?.zipCode || ""} required className="w-full px-4 py-3.5 rounded-xl border border-border bg-background shadow-sm hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-sm" placeholder="10001" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-sm font-semibold mb-1.5 block">Country</label>
                  <input name="country" defaultValue={editingAddress?.country || "United States"} required className="w-full px-4 py-3.5 rounded-xl border border-border bg-background shadow-sm hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-sm" />
                </div>
              </div>
              <div className="col-span-2 mt-2">
                <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors">
                  <input 
                    type="checkbox" 
                    name="isDefault" 
                    defaultChecked={editingAddress?.isDefault || false}
                    className="w-5 h-5 rounded-md border-border text-primary focus:ring-primary/40"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-bold block">Set as default address</span>
                    <span className="text-xs text-muted-foreground">Use this address automatically for future orders</span>
                  </div>
                </label>
              </div>

              <div className="pt-4 flex gap-3 border-t mt-6">
                <button type="button" onClick={() => setIsAddressModalOpen(false)} className="flex-1 py-3.5 rounded-xl border font-bold hover:bg-muted transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors">Save Address</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
