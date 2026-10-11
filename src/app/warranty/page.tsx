"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ShieldCheck, Zap, PenTool } from "lucide-react";

export default function WarrantyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 lg:pt-32 pb-16 md:pb-24">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Warranty Information</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our commitment to quality. We build our products to last, and we back them up.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="bg-card border border-border p-6 rounded-3xl text-center">
              <ShieldCheck size={32} className="text-primary mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Lifetime Frame</h3>
              <p className="text-sm text-muted-foreground">All bicycle frames are covered for the lifetime of the original owner.</p>
            </div>
            <div className="bg-card border border-border p-6 rounded-3xl text-center">
              <Zap size={32} className="text-primary mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">1-Year Electronics</h3>
              <p className="text-sm text-muted-foreground">Batteries, motors, and electronic components on e-bikes and smart accessories.</p>
            </div>
            <div className="bg-card border border-border p-6 rounded-3xl text-center">
              <PenTool size={32} className="text-primary mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">2-Year Components</h3>
              <p className="text-sm text-muted-foreground">Forks, drivetrains, and mechanical components against manufacturing defects.</p>
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none text-foreground/80 space-y-6">
            <h2 className="text-3xl font-bold text-foreground">What is Covered?</h2>
            <p>
              Universal Cycles warrants that all new bicycles, components, and accessories are free from defects in material and workmanship. This warranty is valid only for the original purchaser and is non-transferable.
            </p>
            
            <h2 className="text-3xl font-bold text-foreground mt-12">What is NOT Covered?</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Normal wear and tear (tires, brake pads, chains, etc.)</li>
              <li>Damage caused by improper assembly or maintenance.</li>
              <li>Damage resulting from accidents, misuse, abuse, or neglect.</li>
              <li>Modifications or installations of components not originally intended for the product.</li>
              <li>Labor charges for part replacement or changeover.</li>
            </ul>

            <div className="bg-muted p-8 rounded-3xl mt-12 border border-border">
              <h3 className="text-2xl font-bold text-foreground mb-4">File a Claim</h3>
              <p className="mb-6">
                If you believe your product has a warranty issue, please contact our support team. We will need your original order number, serial number (for bicycles), and clear photos of the defect.
              </p>
              <button className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors">
                Contact Warranty Support
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
