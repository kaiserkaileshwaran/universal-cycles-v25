"use client";

import Link from "next/link";
import Image from "next/image";
import { Globe, MapPin, Phone, Mail } from "lucide-react";
import { useStoreSettings } from "@/contexts/store-settings-context";

export function Footer() {
  const { settings } = useStoreSettings();
  return (
    <footer className="bg-primary text-primary-foreground pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3"><Image src="/logo.svg" alt={settings.storeName} width={48} height={48} className="h-12 w-12 object-contain dark:invert" loading="eager" priority /><h3 className="text-2xl font-bold tracking-[0.15em] uppercase text-accent">{settings.storeName}</h3></div>
            <p className="text-primary-foreground/80 text-sm leading-relaxed max-w-xs">
              {settings.description}
            </p>
            <div className="flex gap-4 pt-4">
              <Link href="/about" aria-label="About Universal Cycles" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors">
                <Globe size={20} />
              </Link>
              <a href="tel:+919876543210" aria-label="Call Universal Cycles" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors">
                <Phone size={20} />
              </a>
              <a href={`mailto:${settings.contactEmail}`} aria-label={`Email ${settings.storeName}`} className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors">
                <Mail size={20} />
              </a>
              <a href="https://maps.google.com/?q=Erode%2C+Tamil+Nadu%2C+India" target="_blank" rel="noreferrer" aria-label="Find Universal Cycles in Erode" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors">
                <MapPin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li><Link href="/about" className="hover:text-accent transition-colors">About Us</Link></li>
              <li><Link href="/category/adult-cycles" className="hover:text-accent transition-colors">Bicycles</Link></li>
              <li><Link href="/category/accessories" className="hover:text-accent transition-colors">Cycling Accessories</Link></li>
              <li><Link href="/offers" className="hover:text-accent transition-colors">Deals &amp; Offers 🔥</Link></li>
              <li><Link href="/spin-wheel" className="hover:text-accent transition-colors">Lucky Spin Wheel 🎡</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Customer Service</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li><Link href="/contact" className="hover:text-accent transition-colors">Contact Us</Link></li>
              <li><Link href="/faq" className="hover:text-accent transition-colors">FAQ</Link></li>
              <li><Link href="/shipping" className="hover:text-accent transition-colors">Shipping & Returns</Link></li>
              <li><Link href="/warranty" className="hover:text-accent transition-colors">Warranty Information</Link></li>
              <li><Link href="/track-order" className="hover:text-accent transition-colors">Track Order</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Contact Us</h4>
            <ul className="space-y-4 text-sm text-primary-foreground/80">
              <li className="flex items-start gap-3">
                <MapPin size={20} className="text-accent shrink-0" />
                <span>Erode, Tamil Nadu, India</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={20} className="text-accent shrink-0" />
                <a className="hover:text-accent" href="tel:+919876543210">9876543210</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={20} className="text-accent shrink-0" />
                <a className="break-all hover:text-accent" href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-primary-foreground/20 pt-8 mt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/60">
          <p>&copy; {new Date().getFullYear()} {settings.storeName}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-primary-foreground transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
