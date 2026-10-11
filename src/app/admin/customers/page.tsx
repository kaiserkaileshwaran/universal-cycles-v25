"use client";

import { useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Search, Mail, Phone, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOrders } from "@/contexts/orders-context";

export default function AdminCustomersPage() {
  const [search, setSearch] = useState("");
  const { orders } = useOrders();
  const customers = [...orders.reduce((grouped, order) => {
    const email = order.email?.trim().toLowerCase();
    if (!email) return grouped;
    const previous = grouped.get(email);
    const current = previous ?? { id: order.userId, name: order.shippingAddress.fullName, email, phone: order.shippingAddress.phone, orders: 0, spent: 0, status: "active", location: `${order.shippingAddress.city}, ${order.shippingAddress.state}` };
    current.orders += 1;
    if (order.status !== "cancelled" && order.status !== "refunded") current.spent += order.total;
    grouped.set(email, current);
    return grouped;
  }, new Map<string, {id:string;name:string;email:string;phone:string;orders:number;spent:number;status:string;location:string}>()).values()];

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Customers</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your customer database and view their history.</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="text"
                placeholder="Search customers by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase pb-3">Customer</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase pb-3">Contact</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase pb-3">Location</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase pb-3">Orders</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase pb-3">Spent</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase pb-3">Status</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((customer) => (
                  <tr key={customer.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-xs text-muted-foreground">{customer.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-sm">
                          <Mail size={14} className="text-muted-foreground" />
                          <span>{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm">
                          <Phone size={14} className="text-muted-foreground" />
                          <span>{customer.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-1.5 text-sm">
                        <MapPin size={14} className="text-muted-foreground" />
                        <span>{customer.location}</span>
                      </div>
                    </td>
                    <td className="py-4 text-sm font-medium">{customer.orders}</td>
                    <td className="py-4 text-sm font-bold">₹{customer.spent.toLocaleString()}</td>
                    <td className="py-4">
                      <span className={cn(
                        "text-xs font-semibold px-2.5 py-1 rounded-full",
                        customer.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      )}>
                        {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <a href={`mailto:${customer.email}`} aria-label={`Email ${customer.name}`} className="inline-flex p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
                        <Mail size={18} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filtered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No customers found matching &quot;{search}&quot;
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
