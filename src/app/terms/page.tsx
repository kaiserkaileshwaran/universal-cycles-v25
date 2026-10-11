import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function TermsPage() {
  return <div className="min-h-screen bg-background"><Navbar /><main className="container mx-auto max-w-3xl px-4 py-28 md:px-8"><p className="text-sm font-semibold uppercase tracking-widest text-primary">Site information</p><h1 className="mt-2 text-3xl font-bold">Terms of service</h1><p className="mt-4 leading-7 text-muted-foreground">This site is currently a storefront preview. Checkout records are saved only in the browser where they are placed. Orders are not transmitted to a fulfillment system, and no payment gateway is connected.</p><p className="mt-4 leading-7 text-muted-foreground">Please contact <a className="text-primary underline" href="mailto:support@universalcycles.in">support@universalcycles.in</a> before relying on product availability, pricing, or delivery. The store owner should replace this preview notice with approved terms before accepting real orders.</p><Link href="/" className="mt-8 inline-flex font-semibold text-primary">Return to the store</Link></main><Footer /></div>;
}
