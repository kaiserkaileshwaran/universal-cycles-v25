"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ChevronLeft, ChevronRight, TrendingUp, UsersRound, Wrench, X, Zap, Star, Check } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ProductCard } from "@/components/products/product-card";
import { useCategories } from "@/contexts/categories-context";
import { useProducts } from "@/contexts/products-context";
import { useReviews } from "@/contexts/reviews-context";
import { useMarketing } from "@/contexts/marketing-context";
import { useStoreSettings } from "@/contexts/store-settings-context";
import { formatPrice } from "@/lib/utils";

type HeroGallery = "riders" | "service";

type GalleryItem = {
  src: string;
  alt: string;
};

const pexelsPhoto = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=900`;

const RIDER_GALLERY: GalleryItem[] = [
  { src: pexelsPhoto(9029446), alt: "Happy couple standing with their bicycles in a park" },
  { src: pexelsPhoto(10202931), alt: "Couple smiling together beside a bicycle" },
  { src: pexelsPhoto(8350903), alt: "Couple enjoying a bicycle ride outdoors" },
  { src: pexelsPhoto(8350904), alt: "Happy couple riding bicycles among flowers" },
  { src: pexelsPhoto(5225456), alt: "Couple taking a photo together beside a bicycle" },
  { src: pexelsPhoto(37371612), alt: "Couple walking with their bicycles through a sunny park" },
  { src: pexelsPhoto(10203436), alt: "Couple carrying bicycles through a green field" },
  { src: pexelsPhoto(10203441), alt: "Couple chatting together beside their bicycles" },
  { src: pexelsPhoto(15009966), alt: "Man and woman riding bicycles together on a sunny street" },
  { src: pexelsPhoto(36972866), alt: "Couple cycling together through a city" },
  { src: pexelsPhoto(10220126), alt: "Couple admiring a bicycle in a meadow" },
  { src: pexelsPhoto(8350899), alt: "Couple enjoying a scenic ride on bicycles" },
  { src: pexelsPhoto(22863958), alt: "Smiling couple riding city bicycles together" },
  { src: pexelsPhoto(7242951), alt: "Smiling woman leaning beside her bicycle" },
  { src: pexelsPhoto(7243314), alt: "Smiling woman walking alongside her bicycle" },
];

const SERVICE_GALLERY: GalleryItem[] = [
  {
    src: pexelsPhoto(5808010),
    alt: "Cyclist in a helmet fixing a bicycle wheel outdoors",
  },
  {
    src: pexelsPhoto(6334127),
    alt: "Man repairing a bicycle indoors beside tools",
  },
  {
    src: pexelsPhoto(5808019),
    alt: "Two cyclists fixing a bicycle tire outdoors",
  },
  {
    src: pexelsPhoto(28100861),
    alt: "Mechanic holding a bicycle wheel in a workshop",
  },
  {
    src: pexelsPhoto(5808015),
    alt: "Cyclist repairing a bicycle wheel on a rural roadside",
  },
  {
    src: pexelsPhoto(19895873),
    alt: "Teenager repairing a bicycle seat in a garage",
  },
  {
    src: pexelsPhoto(37129441),
    alt: "Close-up of a mechanic maintaining a bicycle gear and derailleur",
  },
  {
    src: pexelsPhoto(8926739),
    alt: "Hands using a tool to adjust bicycle wheel spokes",
  },
  {
    src: pexelsPhoto(34197976),
    alt: "Mechanic repairing a bicycle in a workshop",
  },
  {
    src: pexelsPhoto(10263877),
    alt: "Mechanic's hands working on bicycle parts with repair tools",
  },
  {
    src: pexelsPhoto(31628823),
    alt: "Bicycle workshop with frames and parts arranged for assembly",
  },
  {
    src: pexelsPhoto(14157266),
    alt: "Close-up of bicycle brake and wheel components",
  },
  {
    src: pexelsPhoto(545000),
    alt: "Bicycle seats and wheels displayed inside a shop",
  },
  {
    src: pexelsPhoto(17593893),
    alt: "Mechanic fixing a bicycle front fork with tools",
  },
  {
    src: pexelsPhoto(5807907),
    alt: "Cyclist adjusting a rear bicycle wheel on the roadside",
  },
];

export default function Home() {
  const { products } = useProducts();
  const { reviews } = useReviews();
  const { categories: CATEGORIES } = useCategories();
  const { subscribe } = useMarketing();
  const { settings } = useStoreSettings();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [miniSlideIndex, setMiniSlideIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setMiniSlideIndex(prev => prev + 1), 3000);
    return () => clearInterval(timer);
  }, []);
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [activeGallery, setActiveGallery] = useState<HeroGallery | null>(null);
  const galleryTrackRef = useRef<HTMLDivElement>(null);
  const galleryIndexRef = useRef(0);
  const activeProducts = products.filter((product) => product.isActive);
  const featuredProducts = activeProducts.slice(0, 4);
  const flashSaleProducts = activeProducts.filter((p) => p.salePrice).slice(0, 4);
  const newArrivals = [...activeProducts].sort((a, b) => b.createdAt - a.createdAt).slice(0, 4);
  const heroStats = [
    { label: "Products", value: activeProducts.length.toLocaleString() },
    { label: "Categories", value: CATEGORIES.length.toLocaleString() },
    { label: "Brands", value: new Set(activeProducts.map((product) => product.brand)).size.toLocaleString() },
    { label: "On sale", value: flashSaleProducts.length.toLocaleString() },
  ];

  const riderGalleryItems: GalleryItem[] = settings.happyCustomersImages?.length > 0 
    ? settings.happyCustomersImages.filter(Boolean).map(src => ({ src, alt: "Happy Customer" }))
    : RIDER_GALLERY;
    
  const serviceGalleryItems: GalleryItem[] = settings.serviceAvailableImages?.length > 0
    ? settings.serviceAvailableImages.filter(Boolean).map(src => ({ src, alt: "Service Available" }))
    : SERVICE_GALLERY;

  const galleryItems = activeGallery === "riders" ? riderGalleryItems : serviceGalleryItems;
  const galleryTitle = activeGallery === "riders" ? "Happy riders" : "Service available";
  useEffect(() => {
    galleryIndexRef.current = 0;
  }, [activeGallery]);

  const moveGallery = (direction: -1 | 1) => {
    const track = galleryTrackRef.current;
    if (!track) return;

    const slideCount = galleryItems.length;
    const nextIndex = (galleryIndexRef.current + direction + slideCount) % slideCount;
    galleryIndexRef.current = nextIndex;
    track.scrollTo({ left: track.clientWidth * nextIndex, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <AnimatePresence>
        {activeGallery && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveGallery(null)}
              className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={() => setActiveGallery(null)}
              className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-3"
            >
              <div
                onClick={(event) => event.stopPropagation()}
                className="flex h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-7xl 2xl:max-w-[1600px] flex-col overflow-hidden rounded-[28px] border border-white/20 bg-background/70 p-2 shadow-[0_25px_80px_rgba(0,0,0,0.25)] backdrop-blur-3xl dark:bg-background/60 sm:h-[calc(100dvh-1.5rem)] sm:w-[calc(100vw-1.5rem)] sm:p-3"
              >
                <div className="mb-4 flex shrink-0 items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 md:p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      {activeGallery === "riders" ? <UsersRound size={20} /> : <Wrench size={20} />}
                    </div>
                    <h3 className="text-lg font-bold text-foreground md:text-xl">{galleryTitle}</h3>
                  </div>
                  <button
                    onClick={() => setActiveGallery(null)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-foreground transition hover:bg-white/10"
                    aria-label="Close gallery"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div
                  ref={galleryTrackRef}
                  onScroll={(event) => {
                    const track = event.currentTarget;
                    galleryIndexRef.current = Math.round(track.scrollLeft / track.clientWidth);
                  }}
                  className="custom-scrollbar flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden scroll-smooth"
                >
                  {galleryItems.map((item) => (
                    <div
                      key={item.src}
                      className="relative flex h-full w-full min-w-full shrink-0 snap-start items-center justify-center overflow-hidden rounded-[20px] bg-black/10"
                    >
                      <Image
                        src={item.src}
                        alt={item.alt}
                        fill
                        sizes="calc(100vw - 2rem)"
                        className="object-contain"
                      />
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => moveGallery(-1)}
                  className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/60 sm:left-6 sm:h-14 sm:w-14"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={26} />
                </button>
                <button
                  type="button"
                  onClick={() => moveGallery(1)}
                  className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/60 sm:right-6 sm:h-14 sm:w-14"
                  aria-label="Next image"
                >
                  <ChevronRight size={26} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── HERO ─── */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/background-landscape.png"
            alt="Forest valley background"
            fill
            sizes="(max-width: 768px) 100vw, 100vw"
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        <div className="container relative z-10 mx-auto px-4 py-32 md:py-40">
          <div className="lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12">
            <div className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/20 px-4 py-2 text-sm font-medium text-accent-foreground backdrop-blur-sm"
              >
                <TrendingUp size={14} />
                Explore bicycles and gear for everyday rides and weekend escapes
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="mb-6 text-5xl font-bold leading-[0.95] text-white md:text-7xl lg:text-8xl"
              >
                Ride Into
                <br />
                <span className="bg-gradient-to-r from-yellow-300 to-amber-500 bg-clip-text text-transparent">
                  Adventure
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
                className="mb-10 max-w-xl text-lg leading-relaxed text-gray-200 md:text-xl"
              >
                Discover our premium collection of cycles, accessories, and gear — crafted for those who live life in motion.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.8 }}
                className="flex flex-wrap gap-4"
              >
                <Link
                  href="/category/all"
                  className="rounded-full bg-accent px-8 py-4 text-lg font-bold text-accent-foreground shadow-xl transition-transform hover:scale-105"
                >
                  Shop Cycles
                </Link>
                <Link
                  href="/category/accessories"
                  className="rounded-full border border-white/30 bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  Explore Accessories
                </Link>
              </motion.div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:hidden">
                <button
                  type="button"
                  onClick={() => setActiveGallery("riders")}
                  className="flex flex-1 items-center justify-between rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-left text-white backdrop-blur-md transition hover:bg-white/15"
                >
                  <span className="flex items-center gap-2">
                    
                    <div className="relative shrink-0 overflow-hidden bg-black/20 h-10 w-10 rounded-xl border border-white/20 shadow-inner">
                      <AnimatePresence mode="popLayout">
                        <motion.div
                          key={miniSlideIndex}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.5, ease: "easeInOut" }}
                          className="absolute inset-0"
                        >
                          <Image src={riderGalleryItems[miniSlideIndex % riderGalleryItems.length].src} alt="Gallery image" fill className="object-cover" sizes="40px" />
                        </motion.div>
                      </AnimatePresence>
                    </div>
                    <span className="text-sm font-semibold">Happy riders</span>
                  </span>
                  <ArrowUpRight size={16} className="text-white/80" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveGallery("service")}
                  className="flex flex-1 items-center justify-between rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-left text-white backdrop-blur-md transition hover:bg-white/15"
                >
                  <span className="flex items-center gap-2">
                    
                    <div className="relative shrink-0 overflow-hidden bg-black/20 h-10 w-10 rounded-xl border border-white/20 shadow-inner">
                      <AnimatePresence mode="popLayout">
                        <motion.div
                          key={miniSlideIndex}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.5, ease: "easeInOut" }}
                          className="absolute inset-0"
                        >
                          <Image src={serviceGalleryItems[miniSlideIndex % serviceGalleryItems.length].src} alt="Gallery image" fill className="object-cover" sizes="40px" />
                        </motion.div>
                      </AnimatePresence>
                    </div>
                    <span className="text-sm font-semibold">Service available</span>
                  </span>
                  <ArrowUpRight size={16} className="text-white/80" />
                </button>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.8 }}
                className="mt-8 flex flex-wrap gap-8 lg:mt-16"
              >
                {heroStats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-bold text-white md:text-3xl">{stat.value}</p>
                    <p className="text-sm text-gray-300">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            <div className="relative hidden h-[430px] lg:block pointer-events-none">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="absolute inset-0"
              >
                <button
                  type="button"
                  onClick={() => setActiveGallery("riders")}
                  className="pointer-events-auto group absolute right-0 top-[15%] flex w-[280px] items-center justify-between rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-md transition-all duration-300 hover:-translate-x-2 hover:bg-white/15 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]"
                >
                  <span className="flex items-center gap-4">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/20 shadow-inner">
                      <AnimatePresence mode="popLayout">
                        <motion.div
                          key={miniSlideIndex}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.5, ease: "easeInOut" }}
                          className="absolute inset-0"
                        >
                          <Image src={riderGalleryItems[miniSlideIndex % riderGalleryItems.length].src} alt="Gallery image" fill className="object-cover" sizes="56px" />
                        </motion.div>
                      </AnimatePresence>
                    </div>
                    <span className="text-base font-semibold text-white">Happy riders</span>
                  </span>
                  <ArrowUpRight size={20} className="text-white/60 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-white" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveGallery("service")}
                  className="pointer-events-auto group absolute bottom-[15%] right-[10%] flex w-[280px] items-center justify-between rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-md transition-all duration-300 hover:-translate-x-2 hover:bg-white/15 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]"
                >
                  <span className="flex items-center gap-4">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/20 shadow-inner">
                      <AnimatePresence mode="popLayout">
                        <motion.div
                          key={miniSlideIndex}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.5, ease: "easeInOut" }}
                          className="absolute inset-0"
                        >
                          <Image src={serviceGalleryItems[miniSlideIndex % serviceGalleryItems.length].src} alt="Gallery image" fill className="object-cover" sizes="56px" />
                        </motion.div>
                      </AnimatePresence>
                    </div>
                    <span className="text-base font-semibold text-white">Service available</span>
                  </span>
                  <ArrowUpRight size={20} className="text-white/60 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-white" />
                </button>
              </motion.div>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="flex h-9 w-5 items-start justify-center rounded-full border-2 border-white/50 pt-1.5"
          >
            <div className="h-2.5 w-1.5 rounded-full bg-white" />
          </motion.div>
        </motion.div>
      </section>

      {/* ─── CATEGORIES ─── */}
      <section className="bg-background py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                What We Offer
              </p>
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">Shop by Category</h2>
            </div>
            <Link
              href="/category/all"
              className="hidden items-center gap-1 text-primary transition-all hover:gap-3 md:flex"
            >
              All Categories <ChevronRight size={18} />
            </Link>
          </div>

          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
              >
                <Link
                  href={`/category/${cat.slug}`}
                  className="group flex flex-col items-center gap-3 rounded-2xl bg-muted/50 p-6 text-center transition-all duration-300 hover:scale-105 hover:bg-primary hover:text-primary-foreground hover:shadow-xl"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-3xl transition-colors group-hover:bg-white/20">
                    {cat.id === "adult-cycles" ? "🚴" : cat.id === "kids-bicycles" ? "🚲" : "🪖"}
                  </div>
                  <span className="text-sm font-semibold leading-tight">{cat.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED PRODUCTS ─── */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Hand-Picked</p>
              <h2 className="text-3xl font-bold md:text-4xl">Featured Products</h2>
            </div>
            <Link href="/category/all" className="hidden items-center gap-1 text-primary transition-all hover:gap-3 md:flex">
              View All <ChevronRight size={18} />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FLASH SALE BANNER ─── */}
      <section className="relative overflow-hidden bg-primary py-20 text-primary-foreground">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute right-0 top-0 h-96 w-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-accent" />
          <div className="absolute bottom-0 left-0 h-72 w-72 -translate-x-1/2 translate-y-1/2 rounded-full bg-white" />
        </div>
        <div className="container relative z-10 mx-auto px-4 md:px-8 lg:px-12">
          <div className="mb-12 flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent">
                <Zap size={28} className="text-accent-foreground" />
              </div>
              <div>
                <h2 className="text-3xl font-bold md:text-4xl">Current Sale Prices</h2>
                <p className="text-primary-foreground/70">Selected products with a reduced price today.</p>
              </div>
            </div>
          </div>

          {flashSaleProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {flashSaleProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="overflow-hidden rounded-2xl bg-white/10 backdrop-blur transition-colors hover:bg-white/20"
                >
                  <Link href={`/products/${product.id}`}>
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={product.thumbnail}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                      <div className="absolute left-3 top-3 rounded-full bg-destructive px-2 py-1 text-xs font-bold text-white">
                        -{product.salePrice ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0}%
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="mb-2 line-clamp-2 text-sm font-semibold text-white">{product.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-accent">{formatPrice(product.salePrice ?? product.price)}</span>
                        {product.salePrice && (
                          <span className="text-sm text-white/50 line-through">{formatPrice(product.price)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-white/20 bg-white/10 p-6 text-sm text-primary-foreground/80">
              There are no discounted products right now. Check back after the next catalog update.
            </p>
          )}
        </div>
      </section>

      {/* ─── PREMIUM BANNER ─── */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="relative overflow-hidden rounded-3xl">
            <Image
              src="/background-landscape.png"
              alt="Premium experience"
              width={1440}
              height={600}
              className="h-80 w-full object-cover md:h-[480px]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
            <div className="absolute inset-0 flex items-center p-8 md:p-16">
              <div className="max-w-lg">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-accent">Premium Collection</p>
                <h2 className="mb-4 text-4xl font-bold leading-tight text-white md:text-5xl">
                  Electric Cycles
                  <br />
                  Reimagined
                </h2>
                <p className="mb-8 text-lg text-gray-300">
                  Smart, sustainable, and built for the future. Experience the next generation of urban mobility.
                </p>
                <Link
                  href="/category/electric-cycles"
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 font-bold text-accent-foreground shadow-xl transition-transform hover:scale-105"
                >
                  Explore Electric <ChevronRight size={20} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── NEW ARRIVALS ─── */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Just Dropped</p>
              <h2 className="text-3xl font-bold md:text-4xl">New Arrivals</h2>
            </div>
            <Link href="/category/all" className="hidden items-center gap-1 text-primary transition-all hover:gap-3 md:flex">
              View All <ChevronRight size={18} />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {newArrivals.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      {reviews.filter(r => r.status === "approved").length > 0 && (
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Hear From Them</p>
            <h2 className="text-3xl font-bold md:text-4xl">Happy Customers</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.filter(r => r.status === "approved").slice(0, 3).map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl bg-background border border-border p-6 shadow-sm flex flex-col h-full"
              >
                <div className="flex mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < review.rating ? "fill-amber-400 text-amber-400" : "text-muted"}
                    />
                  ))}
                </div>
                
                <p className="text-muted-foreground mb-6 flex-1 italic">&quot;{review.comment}&quot;</p>
                <div className="flex items-center gap-2 mt-auto pt-4 border-t border-border">
                  <p className="font-semibold text-sm">{review.userName}</p>
                  {review.isVerified && <span className="bg-blue-100 text-blue-600 text-[10px] px-1.5 py-0.5 rounded-sm font-bold flex items-center gap-1"><Check size={10}/> Verified</span>}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      )}


      {/* ─── WHY US ─── */}
      <section className="bg-background py-20">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="mb-16 text-center">
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Our Promise</p>
            <h2 className="text-3xl font-bold md:text-4xl">Why Choose Universal Cycles?</h2>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: "🚚",
                title: "Clear Shipping Rates",
                desc: `Standard delivery is ${settings.freeShippingMinimum === 0 ? "free on all orders" : `free above ${formatPrice(settings.freeShippingMinimum)}`} and other options are shown at checkout.`,
              },
              {
                icon: "💵",
                title: "Cash on Delivery",
                desc: "Choose cash on delivery at checkout. No card payment is collected by this preview.",
              },
              {
                icon: "📦",
                title: "Order Status",
                desc: "View the status and carrier reference saved for your order in this browser.",
              },
              {
                icon: "🔎",
                title: "Product Details",
                desc: "Review specifications, current stock, and available sale pricing before you order.",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl bg-muted/50 p-6 text-center transition-colors hover:bg-muted"
              >
                <div className="mb-4 text-4xl">{feature.icon}</div>
                <h3 className="mb-2 text-lg font-bold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* ─── NEWSLETTER ─── */}
      <section className="bg-primary py-20 text-primary-foreground">
        <div className="container mx-auto max-w-2xl px-4 text-center md:px-8 lg:px-12">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Stay in the Loop</h2>
          <p className="mb-8 text-lg text-primary-foreground/70">
            Get exclusive deals, new arrivals, and adventure inspiration delivered to your inbox.
          </p>
          <form
            className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              const outcome = subscribe(newsletterEmail);
              setNewsletterMessage(outcome === "added" ? "You’re subscribed on this browser." : "This email is already subscribed.");
              setNewsletterEmail("");
            }}
          >
            <input
              type="email"
              aria-label="Email address for newsletter"
              placeholder="Enter your email"
              required
              value={newsletterEmail}
              onChange={(event) => {
                setNewsletterEmail(event.target.value);
                setNewsletterMessage("");
              }}
              className="flex-1 rounded-xl border border-white/20 bg-white/10 px-5 py-4 text-white placeholder:text-white/50 transition focus:border-accent focus:bg-white/20 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-xl bg-accent px-8 py-4 font-bold text-accent-foreground transition-transform hover:scale-105"
            >
              Subscribe
            </button>
          </form>
          <p role="status" className="mt-4 text-xs text-primary-foreground/70">
            {newsletterMessage || "Subscriptions are saved in this browser. You can remove them from admin messages."}
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
