/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useOrders } from "@/contexts/orders-context";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { formatPrice } from "@/lib/utils";

export function AdvancedAnalytics() {
  const { orders } = useOrders();
  const [analyticsView, setAnalyticsView] = useState<"date"|"time"|"product">("date");
  const [analyticsChartType, setAnalyticsChartType] = useState<"bar"|"line">("bar");
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState<"7d"|"1m"|"6m"|"1y"|"all">("7d");

  const chartData = useMemo(() => {
    const now = new Date();
    
    const filteredOrders = orders.filter(o => {
      if (analyticsTimeRange === 'all') return true;
      const orderDate = new Date(o.createdAt);
      const diffDays = (now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24);
      if (analyticsTimeRange === '7d') return diffDays <= 7;
      if (analyticsTimeRange === '1m') return diffDays <= 30;
      if (analyticsTimeRange === '6m') return diffDays <= 180;
      if (analyticsTimeRange === '1y') return diffDays <= 365;
      return true;
    });

    let data: { name: string; value: number }[] = [];
    
    if (analyticsView === 'date') {
      if (analyticsTimeRange === 'all') {
        let oldestDate = new Date();
        if (orders.length > 0) {
          const validTimes = orders.map(o => o.createdAt);
          if (validTimes.length > 0) oldestDate = new Date(Math.min(...validTimes));
          if (oldestDate.getTime() > now.getTime()) oldestDate = new Date(); 
        }
        oldestDate.setDate(oldestDate.getDate() - 1); 
        const diffDays = Math.max(1, Math.ceil((now.getTime() - oldestDate.getTime()) / (1000 * 3600 * 24)));
        
        if (diffDays <= 60) {
          const days = diffDays + 1;
          const dateArr = Array.from({length: days}).map((_, i) => {
            const d = new Date(now);
            d.setDate(d.getDate() - ((days - 1) - i));
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          });
          data = dateArr.map(dateStr => {
            const dayOrders = filteredOrders.filter(o => new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) === dateStr);
            return { name: dateStr, value: dayOrders.reduce((sum, o) => sum + (o.total || 0), 0) };
          });
        } else {
          const months = Math.max(1, Math.ceil(diffDays / 30)) + 1;
          const monthArr = Array.from({length: months}).map((_, i) => {
            const d = new Date(now);
            d.setMonth(d.getMonth() - ((months - 1) - i));
            return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
          });
          data = monthArr.map(monthStr => {
            const monthOrders = filteredOrders.filter(o => new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) === monthStr);
            return { name: monthStr, value: monthOrders.reduce((sum, o) => sum + (o.total || 0), 0) };
          });
        }
      } else {
        const days = analyticsTimeRange === '7d' ? 7 : analyticsTimeRange === '1m' ? 30 : analyticsTimeRange === '6m' ? 180 : 365;
        if (days <= 30) {
          const dateArr = Array.from({length: days}).map((_, i) => {
            const d = new Date(now);
            d.setDate(d.getDate() - ((days - 1) - i));
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          });
          data = dateArr.map(dateStr => {
            const dayOrders = filteredOrders.filter(o => new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) === dateStr);
            return { name: dateStr, value: dayOrders.reduce((sum, o) => sum + (o.total || 0), 0) };
          });
        } else {
          const months = Math.ceil(days / 30);
          const monthArr = Array.from({length: months}).map((_, i) => {
            const d = new Date(now);
            d.setMonth(d.getMonth() - ((months - 1) - i));
            return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
          });
          data = monthArr.map(monthStr => {
            const monthOrders = filteredOrders.filter(o => new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) === monthStr);
            return { name: monthStr, value: monthOrders.reduce((sum, o) => sum + (o.total || 0), 0) };
          });
        }
      }
    } else if (analyticsView === 'time') {
      const blocks = [
        { id: 'morning', l: 'Morning', min: 6, max: 12 },
        { id: 'afternoon', l: 'Afternoon', min: 12, max: 17 },
        { id: 'evening', l: 'Evening', min: 17, max: 21 },
        { id: 'night', l: 'Night', min: 21, max: 6 }
      ];
      data = blocks.map(b => {
        const blockOrders = filteredOrders.filter(o => {
          const h = new Date(o.createdAt).getHours();
          if (b.min < b.max) return h >= b.min && h < b.max;
          return h >= b.min || h < b.max;
        });
        return { name: b.l, value: blockOrders.reduce((sum, o) => sum + (o.total || 0), 0) };
      });
    } else if (analyticsView === 'product') {
      const productSales: Record<string, number> = {};
      filteredOrders.forEach(o => {
        if (o.items && Array.isArray(o.items)) {
          o.items.forEach(i => { 
            const title = i.name || 'Unknown Product';
            const price = i.price || 0;
            const qty = i.quantity || 1;
            productSales[title] = (productSales[title] || 0) + (price * qty); 
          });
        }
      });
      const sorted = Object.entries(productSales).sort((a,b) => b[1] - a[1]).slice(0, 5);
      data = sorted.length ? sorted.map(([title, val]) => ({ name: title.length > 20 ? title.substring(0,17)+'...' : title, value: val })) : [{ name: 'No Products', value: 0 }];
    }

    
    return data;
  }, [orders, analyticsTimeRange, analyticsView, analyticsChartType]);

  const PIE_COLORS = ['#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d'];
  const PRIMARY_COLOR = '#22c55e'; // Green-500
  
  const formatTooltip = (val: number) => {
     if (chartData.length === 1 && chartData[0].name === 'No Revenue Data') return formatPrice(0);
     return formatPrice(val);
  };

  return (
    <div className="bg-card border border-border p-4 sm:p-8 rounded-2xl shadow-sm w-full overflow-hidden mt-6">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-4">
        <div>
          <h2 className="font-bold text-lg">Advanced Analytics</h2>
          <p className="text-muted-foreground text-sm mt-1">Visualize your revenue streams in detail.</p>
        </div>
        
        <div className="flex flex-wrap gap-2 sm:gap-4 w-full xl:w-auto overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex bg-muted p-1 rounded-lg border border-border shrink-0 shadow-sm">
            {[{id: '7d', l: '7 Days'}, {id: '1m', l: '1 Month'}, {id: '6m', l: '6 Months'}, {id: '1y', l: '1 Year'}, {id: 'all', l: 'All Time'}].map((t) => (
              <button 
                key={t.id} 
                onClick={() => setAnalyticsTimeRange(t.id as never)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all duration-300 ${analyticsTimeRange === t.id ? 'bg-background text-foreground shadow-sm border border-border/50' : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'}`}
              >
                {t.l}
              </button>
            ))}
          </div>

          <div className="flex bg-muted p-1 rounded-lg border border-border shrink-0 shadow-sm">
            {['date', 'time', 'product'].map((v) => (
              <button 
                key={v} 
                onClick={() => setAnalyticsView(v as never)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all duration-300 ${analyticsView === v ? 'bg-background text-foreground shadow-sm border border-border/50' : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'}`}
              >
                By {v}
              </button>
            ))}
          </div>

          <div className="flex bg-muted p-1 rounded-lg border border-border shrink-0 shadow-sm">
            {['bar', 'line'].map((v) => (
              <button 
                key={v} 
                onClick={() => setAnalyticsChartType(v as never)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all duration-300 ${analyticsChartType === v ? 'bg-background text-foreground shadow-sm border border-border/50' : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-[400px] w-full min-w-0 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          {analyticsChartType === 'bar' ? (
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="barColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={PRIMARY_COLOR} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={PRIMARY_COLOR} stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#22c55e', fontWeight: 600 }} dy={15} angle={-35} textAnchor="end" interval="preserveStartEnd" height={60} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#22c55e' }} tickFormatter={(v) => `${v}`} dx={-10} />
              <RechartsTooltip cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }} formatter={(v: number | string | any) => [formatPrice(v), 'Revenue']} contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} labelStyle={{ fontWeight: 'bold', color: 'hsl(var(--foreground))', marginBottom: '4px' }} />
              <Bar dataKey="value" fill="url(#barColor)" radius={[6, 6, 0, 0]} maxBarSize={60} minPointSize={8} />
            </BarChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#22c55e', fontWeight: 600 }} dy={15} angle={-35} textAnchor="end" interval="preserveStartEnd" height={60} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#22c55e' }} tickFormatter={(v) => `${v}`} dx={-10} />
              <RechartsTooltip formatter={(v: number | string | any) => [formatPrice(v), 'Revenue']} contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} labelStyle={{ fontWeight: 'bold', color: 'hsl(var(--foreground))', marginBottom: '4px' }} />
              <Line type="monotone" dataKey="value" stroke={PRIMARY_COLOR} strokeWidth={4} dot={{ r: 5, fill: PRIMARY_COLOR, strokeWidth: 2, stroke: 'hsl(var(--background))' }} activeDot={{ r: 8, fill: PRIMARY_COLOR, stroke: 'hsl(var(--background))', strokeWidth: 3 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
