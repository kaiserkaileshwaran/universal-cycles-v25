"use client";

import { useMemo, useState } from "react";
import { Mail, MessageSquare, Search, Trash2, Users } from "lucide-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { useMarketing } from "@/contexts/marketing-context";

export default function AdminMessagesPage() {
  const { messages, subscribers, markMessageRead, deleteMessage, unsubscribe } = useMarketing();
  const [tab, setTab] = useState<"inbox" | "subscribers">("inbox");
  const [search, setSearch] = useState("");
  const visibleMessages = useMemo(() => messages.filter((message) => `${message.firstName} ${message.lastName} ${message.email} ${message.message}`.toLowerCase().includes(search.toLowerCase())), [messages, search]);
  const visibleSubscribers = useMemo(() => subscribers.filter((subscriber) => subscriber.email.includes(search.toLowerCase())), [subscribers, search]);

  return <AdminLayout><div className="space-y-6">
    <div><h1 className="text-2xl font-bold md:text-3xl">Messages & subscribers</h1><p className="mt-1 text-sm text-muted-foreground">Contact form entries and newsletter signups saved in this browser.</p></div>
    <div className="flex flex-wrap gap-2 border-b border-border">{([{ id: "inbox", label: `Inbox (${messages.length})`, icon: MessageSquare }, { id: "subscribers", label: `Subscribers (${subscribers.length})`, icon: Users }] as const).map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setTab(id)} aria-pressed={tab === id} className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold ${tab === id ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}><Icon size={16}/>{label}</button>)}</div>
    <label className="relative block max-w-lg"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/><input aria-label="Search messages" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={tab === "inbox" ? "Search name, email, or message" : "Search subscribers by email"} className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-primary"/></label>
    {tab === "inbox" ? <div className="space-y-3">{visibleMessages.map((message) => <article key={message.id} className={`rounded-2xl border border-border bg-card p-5 ${message.read ? "" : "border-l-4 border-l-primary"}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold">{message.firstName} {message.lastName}</h2>{!message.read && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">New</span>}<span className="text-xs text-muted-foreground">{new Date(message.createdAt).toLocaleString()}</span></div><a className="mt-1 inline-flex items-center gap-1 text-sm text-primary hover:underline" href={`mailto:${encodeURIComponent(message.email)}?subject=${encodeURIComponent("Re: your message to Universal Cycles")}`}><Mail size={14}/>{message.email}</a></div>
        <div className="flex shrink-0 gap-2"><button onClick={() => markMessageRead(message.id)} disabled={message.read} className="rounded-lg border border-border px-3 py-2 text-xs font-semibold disabled:opacity-50">Mark read</button><button onClick={() => deleteMessage(message.id)} aria-label={`Delete message from ${message.email}`} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 size={16}/></button></div>
      </div><p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-foreground/85">{message.message}</p>
    </article>)}{visibleMessages.length === 0 && <EmptyState title={search ? "No matching messages" : "Your inbox is empty"} detail="Messages sent through the contact form will appear here."/>}</div> : <div className="overflow-hidden rounded-2xl border border-border bg-card"><div className="overflow-x-auto"><table className="w-full min-w-[500px]"><thead className="bg-muted/50"><tr>{["Email address", "Subscribed", "Action"].map((heading) => <th key={heading} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{heading}</th>)}</tr></thead><tbody className="divide-y divide-border">{visibleSubscribers.map((subscriber) => <tr key={subscriber.id}><td className="px-5 py-4 text-sm">{subscriber.email}</td><td className="px-5 py-4 text-sm text-muted-foreground">{new Date(subscriber.subscribedAt).toLocaleDateString()}</td><td className="px-5 py-4"><button onClick={() => unsubscribe(subscriber.id)} className="text-xs font-semibold text-destructive hover:underline">Unsubscribe</button></td></tr>)}</tbody></table></div>{visibleSubscribers.length === 0 && <EmptyState title={search ? "No matching subscribers" : "No subscribers yet"} detail="Newsletter signups will appear here."/>}</div>}
  </div></AdminLayout>;
}

function EmptyState({ title, detail }: { title: string; detail: string }) { return <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center"><h2 className="font-semibold">{title}</h2><p className="mt-2 text-sm text-muted-foreground">{detail}</p></div>; }
