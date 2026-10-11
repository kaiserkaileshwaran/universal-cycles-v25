"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ShoppingBag, Users, Package, DollarSign, AlertCircle
} from "lucide-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { useProducts } from "@/contexts/products-context";
import { useOrders } from "@/contexts/orders-context";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { AdvancedAnalytics } from "@/components/admin/advanced-analytics";

export default function AdminDashboard() {
  const { products } = useProducts();
  const { orders } = useOrders();
  const outOfStock = products.filter((product) => product.isActive && product.stock === 0);
  const lowStock = products.filter((product) => product.isActive && product.stock > 0 && product.stock < 10);
  const revenue = orders.filter((order) => order.status !== "cancelled" && order.status !== "refunded").reduce((sum, order) => sum + order.total, 0);
  const customers = new Set(orders.map((order) => order.email).filter(Boolean)).size;
  const stats = [
    { title: "Recorded Revenue", value: formatPrice(revenue), icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
    { title: "Orders", value: orders.length.toLocaleString(), icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Customers", value: customers.toLocaleString(), icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Active Products", value: products.filter((product) => product.isActive).length.toLocaleString(), icon: Package, color: "text-amber-600", bg: "bg-amber-50" },
  ];
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Welcome back! Here&apos;s what&apos;s happening today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-card border border-border rounded-2xl p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl md:text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", stat.bg)}>
                  <stat.icon size={20} className={stat.color} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <AdvancedAnalytics />



        {/* Inventory Alerts */}
        {(outOfStock.length > 0 || lowStock.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Out of Stock */}
            <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-6 shadow-sm flex flex-col h-[400px]">
              <div className="flex items-center gap-3 mb-5 shrink-0">
                <div className="p-2 bg-destructive/10 text-destructive rounded-xl">
                  <AlertCircle size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-destructive">Out of Stock</h2>
                  <p className="text-sm text-destructive/80 font-medium">{outOfStock.length} products need restock</p>
                </div>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto pr-2 pb-2">
                <div className="space-y-3">
                  {outOfStock.map((product) => (
                    <Link href={`/products/${product.id}`} key={product.id} className="bg-background border border-red-500/40 shadow-sm rounded-xl p-3.5 flex items-center transition-all hover:border-red-500/60 hover:shadow-md group">
                      <p className="font-semibold text-foreground line-clamp-1 leading-tight group-hover:text-primary transition-colors">{product.name}</p>
                    </Link>
                  ))}
                  {outOfStock.length === 0 && (
                     <div className="h-full flex items-center justify-center text-muted-foreground text-sm py-10 border-2 border-dashed border-border rounded-xl">No out of stock items.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Low Stock */}
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 shadow-sm flex flex-col h-[400px]">
              <div className="flex items-center gap-3 mb-5 shrink-0">
                <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
                  <AlertCircle size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-amber-600">Low Stock</h2>
                  <p className="text-sm text-amber-600/80 font-medium">{lowStock.length} products running low</p>
                </div>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto pr-2 pb-2">
                <div className="space-y-3">
                  {lowStock.map((product) => (
                    <Link href={`/products/${product.id}`} key={product.id} className="bg-background border border-amber-500/20 shadow-sm rounded-xl p-3.5 flex items-center justify-between gap-3 transition-all hover:border-amber-500/40 hover:shadow-md group">
                      <p className="font-semibold text-foreground line-clamp-1 leading-tight group-hover:text-primary transition-colors">{product.name}</p>
                      <span className="text-sm font-bold text-amber-600 bg-amber-500/10 px-3 py-1 rounded-lg shrink-0 border border-amber-500/20">
                        {product.stock} left
                      </span>
                    </Link>
                  ))}
                  {lowStock.length === 0 && (
                     <div className="h-full flex items-center justify-center text-muted-foreground text-sm py-10 border-2 border-dashed border-border rounded-xl">No low stock items.</div>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </AdminLayout>
  );
}
