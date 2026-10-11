import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function PrivacyPage() {
  return <div className="min-h-screen bg-background"><Navbar /><main className="container mx-auto max-w-3xl px-4 py-28 md:px-8"><p className="text-sm font-semibold uppercase tracking-widest text-primary">Site information</p><h1 className="mt-2 text-3xl font-bold">Privacy information</h1><p className="mt-4 leading-7 text-muted-foreground">This store preview uses Firebase Authentication for account sign-in. Cart contents, catalog edits, and checkout order records are currently saved in this browser only; they are not synchronized between devices or sent to an order-processing service.</p><p className="mt-4 leading-7 text-muted-foreground">Avoid entering sensitive information while this preview is in use. For questions about an account, contact <a className="text-primary underline" href="mailto:support@universalcycles.in">support@universalcycles.in</a>.</p><p className="mt-8 text-sm text-muted-foreground">This page describes the current preview behavior and is not a substitute for the store owner&apos;s final privacy notice.</p><Link href="/" className="mt-8 inline-flex font-semibold text-primary">Return to the store</Link></main><Footer /></div>;
}
