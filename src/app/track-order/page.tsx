"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { PackageCheck, Search, Package } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useOrders } from "@/contexts/orders-context";
import { ORDER_STATUSES } from "@/constants";
import { formatPrice, cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";

function TrackOrderContent() {
  const params = useSearchParams();
  const { orders } = useOrders();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  
  const orderId = params.get("orderId") || query.trim();
  const order = orders.find((item) => item.id.toLowerCase() === orderId.toLowerCase());
  
  const userOrders = user ? orders.filter((o) => o.userId === user.uid).sort((a, b) => b.createdAt - a.createdAt) : [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="container mx-auto max-w-5xl flex-1 px-4 pt-28 pb-16 md:pt-36 md:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight">Track your order</h1>
          <p className="mt-3 text-muted-foreground text-lg">Enter your order number or log in to view your history.</p>
        </div>
        
        {!params.get("orderId") && (
          <form 
            className="flex gap-2 mb-10" 
            onSubmit={(event) => { 
              event.preventDefault(); 
              window.history.replaceState(null, "", `/track-order?orderId=${encodeURIComponent(query.trim())}`); 
            }}
          >
            <label className="sr-only" htmlFor="order-number">Order number</label>
            <input 
              id="order-number" 
              value={query} 
              onChange={(event) => setQuery(event.target.value)} 
              placeholder="e.g. UC123456" 
              className="min-w-0 flex-1 rounded-xl border border-border bg-card px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50" 
              required 
            />
            <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 font-bold text-primary-foreground hover:bg-primary/90 transition-colors">
              <Search size={18} /> Track
            </button>
          </form>
        )}

        {/* Show Specific Order */}
        {order ? (
          <div className="space-y-6">
            <Link href="/track-order" className="text-sm font-semibold text-primary hover:underline block mb-4">
              &larr; Back to Order History
            </Link>
            <section className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
                <div>
                  <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wider mb-1">Order Details</p>
                  <h2 className="text-2xl font-bold text-primary">#{order.id}</h2>
                  <p className="mt-1 text-sm font-medium">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <span className={`rounded-full px-4 py-1.5 text-sm font-bold ${ORDER_STATUSES[order.status]?.color}`}>
                  {ORDER_STATUSES[order.status]?.label ?? order.status}
                </span>
              </div>
              
              <div className="space-y-4 py-6">
                {order.items.map((item) => (
                  <div key={item.productId} className="flex gap-4 text-sm font-medium items-center">
                    <div className="w-16 h-16 bg-muted rounded-xl flex-shrink-0 relative overflow-hidden">
                      {item.thumbnail ? (
                        <Image src={item.thumbnail} alt={item.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Package size={20} /></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <Link href={`/products/${item.productId}`} className="font-semibold text-base line-clamp-1 hover:text-primary hover:underline transition-colors">{item.name}</Link>
                      <p className="text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-bold text-lg">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between border-t border-border pt-6 font-bold text-lg">
                <span>Order Total</span>
                <span className="text-primary">{formatPrice(order.total)}</span>
              </div>
              
              {order.trackingNumber && (
                <div className="mt-8 rounded-2xl bg-primary/10 border border-primary/20 p-5">
                  <p className="text-sm font-bold text-primary">Carrier tracking reference</p>
                  <p className="mt-1 break-all font-mono text-lg font-semibold">{order.trackingNumber}</p>
                </div>
              )}
              
              <div className="mt-6 rounded-2xl bg-muted/50 p-5">
                <p className="text-sm font-bold mb-2">Delivery Address</p>
                <p className="text-sm font-medium">{order.shippingAddress.fullName}</p>
                <p className="text-sm text-muted-foreground">{order.shippingAddress.street1}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
              </div>
            </section>
          </div>
        ) : orderId ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
            <p className="font-bold text-lg">We couldn’t find that order.</p>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">Please check the order number and try again. It usually starts with UC.</p>
            <button onClick={() => { setQuery(""); window.history.replaceState(null, "", "/track-order"); }} className="mt-6 inline-block font-bold text-primary hover:underline">Clear Search</button>
          </div>
        ) : user ? (
          <div className="mt-12 space-y-6">
            <h2 className="text-2xl font-bold mb-6">Your Order History</h2>
            {userOrders.length > 0 ? (
              userOrders.map((userOrder) => {
                const status = ORDER_STATUSES[userOrder.status as keyof typeof ORDER_STATUSES];
                return (
                  <Link href={`/track-order?orderId=${userOrder.id}`} key={userOrder.id} className="block group">
                    <article className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm hover:border-primary/50 transition-colors">
                      <div className="bg-muted/30 border-b border-border p-5 flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Order Placed</p>
                          <p className="text-sm font-bold">{new Date(userOrder.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Total</p>
                          <p className="text-sm font-bold text-primary">{formatPrice(userOrder.total)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Order #</p>
                          <p className="text-sm font-mono font-bold group-hover:text-primary transition-colors">{userOrder.id}</p>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={cn("w-2.5 h-2.5 rounded-full", status.color.includes("text-green") ? "bg-green-500" : status.color.includes("text-amber") ? "bg-amber-500" : "bg-blue-500")} />
                          <span className="font-bold text-base">{status.label}</span>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {userOrder.items.length} {userOrder.items.length === 1 ? 'item' : 'items'} • {userOrder.items.map(i => i.name).join(", ")}
                        </p>
                      </div>
                    </article>
                  </Link>
                );
              })
            ) : (
              <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
                <Package size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="font-bold text-lg">No orders yet.</p>
                <p className="mt-2 text-sm text-muted-foreground">When you place an order, it will show up here.</p>
                <Link href="/category/adult-cycles" className="mt-6 inline-block font-bold text-primary hover:underline">Start Shopping</Link>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center mt-12">
            <p className="font-bold text-lg mb-2">Want to see your full history?</p>
            <p className="text-muted-foreground mb-6">Log in to view all your previous orders in one place.</p>
            <Link href="/login" className="inline-block bg-primary text-primary-foreground font-bold px-8 py-3 rounded-xl hover:bg-primary/90 transition-colors">
              Log In
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function TrackOrderPage() {
  return <Suspense fallback={<div className="min-h-screen bg-background" />}><TrackOrderContent /></Suspense>;
}
