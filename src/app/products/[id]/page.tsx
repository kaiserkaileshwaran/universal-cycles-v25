"use client";

import { useState, type FormEvent } from "react";
import { useParams, notFound, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, ChevronLeft, Star, Heart, ShoppingCart, Share2,
  Shield, Truck, RotateCcw, Plus, Minus, Check
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ProductCard } from "@/components/products/product-card";
import { useCart } from "@/contexts/cart-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { formatPrice, getDiscountPercent } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useProducts } from "@/contexts/products-context";
import { useReviews } from "@/contexts/reviews-context";
import { useAuth } from "@/contexts/auth-context";
import { requestAuth } from "@/components/auth-modal";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;
  const { products } = useProducts();
  const product = products.find((p) => p.id === productId && p.isActive);
  const { user } = useAuth();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  const [addedToCart, setAddedToCart] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewError, setReviewError] = useState("");
  const { reviews, addReview} = useReviews();

  const { addItem, shippingRates } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  if (!product) return notFound();

  const discountPct = product.salePrice ? getDiscountPercent(product.price, product.salePrice) : 0;
  const wishlisted = isWishlisted(product.id);
  const relatedProducts = products.filter((p) => p.isActive && p.id !== product.id).slice(0, 4);
  const productReviews = reviews.filter((review) => review.productId === product.id && review.status === 'approved');
  const hasReviewed = user ? productReviews.some(r => r.userId === user.uid) : false;
  const averageReviewRating = productReviews.length ? Math.round((productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length) * 10) / 10 : product.rating;

  const submitReview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const userName = user?.displayName || user?.email?.split('@')[0] || "Anonymous";
    const title = "";
    const comment = String(fields.get("comment") ?? "").trim();
    if (!comment) { setReviewError("Complete your review before submitting."); return; }
    
    const isVerified = user?.providerData?.some(p => p.providerId === 'google.com') || false;
    addReview({ productId: product.id, userId: user?.uid || "browser-customer", userName, rating: reviewRating, title, comment, isVerified, status: 'pending' });
    
    event.currentTarget.reset();
    setReviewError("");
    setReviewMessage("Your review has been submitted and is pending admin approval.");
    setShowReviewForm(false);
  };

  const handleAddToCart = () => {
    addItem(product, { quantity });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    if (!user) return requestAuth("Sign in to checkout", "Create an account or sign in to complete your purchase.");
    addItem(product, { quantity });
    router.push("/checkout");
  };

  const handleShare = async () => {
    const details = { title: product.name, url: window.location.href };
    try {
      if (navigator.share) {
        await navigator.share(details);
        setShareMessage("Product link shared.");
      } else {
        await navigator.clipboard.writeText(details.url);
        setShareMessage("Product link copied.");
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      setShareMessage("Could not share the link. Copy it from your browser address bar.");
    }
    window.setTimeout(() => setShareMessage(""), 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Breadcrumb */}
      <div className="pt-20 lg:pt-24 border-b">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight size={14} />
            <Link href={`/category/${product.categoryId}`} className="hover:text-primary transition-colors capitalize">
              {product.categoryId.replace(/-/g, " ")}
            </Link>
            <ChevronRight size={14} />
            <span className="text-foreground font-medium line-clamp-1">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-[32px] overflow-hidden bg-gradient-to-br from-muted/50 to-muted shadow-sm border border-border/50 group">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  
                  transition={{ duration: 0.3 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={product.images[selectedImage] ?? product.thumbnail}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1023px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="eager"
                  />
                </motion.div>
              </AnimatePresence>
              

              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-md flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-10"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} className="text-foreground" />
                  </button>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-md flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-10"
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} className="text-foreground" />
                  </button>
                </>
              )}

              {discountPct > 0 && (
                <div className="absolute top-4 left-4 bg-destructive text-white text-sm font-bold px-3 py-1.5 rounded-full z-10">
                  -{discountPct}% OFF
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      "relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all",
                      selectedImage === i ? "border-primary" : "border-transparent hover:border-border"
                    )}
                  >
                    <Image src={img} alt={`View ${i + 1}`} fill sizes="100px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-1">
                {product.brand}
              </p>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mt-3">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={
                        i < Math.floor(product.rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted"
                      }
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">{product.rating}</span>
                <span className="text-sm text-muted-foreground">
                  ({product.reviewsCount} reviews)
                </span>
                {user ? (hasReviewed ? <span className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">You reviewed this</span> : <button type="button" onClick={() => { setShowReviewForm(true); setReviewMessage(""); setReviewError(""); document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" }); }} className="text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95">Write a review</button>) : <Link href="/login" className="text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95">Log in to review</Link>}
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <span className="text-3xl md:text-4xl font-bold text-primary">
                {formatPrice(product.salePrice ?? product.price)}
              </span>
              {product.salePrice && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                    Save {formatPrice(product.price - product.salePrice)}
                  </span>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", product.stock > 0 ? "bg-green-500" : "bg-red-500")} />
              <span className={cn("text-sm font-medium", product.stock > 0 ? "text-green-600" : "text-red-500")}>
                {product.stock === 0 ? "Out of Stock" : product.stock < 5 ? `Only ${product.stock} left!` : "In Stock"}
              </span>
            </div>

            {/* Short Description */}
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={`flex items-center border border-border rounded-xl overflow-hidden ${product.stock === 0 ? "opacity-50 pointer-events-none" : ""}`}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-14 text-center font-semibold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-12 h-12 flex items-center justify-center hover:bg-muted transition-colors"
                    disabled={quantity >= product.stock}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <motion.button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  aria-label={product.stock === 0 ? "Out of stock" : addedToCart ? "Added to cart" : "Add to cart"}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-base transition-all disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:bg-muted",
                    addedToCart
                      ? "bg-green-600 text-white"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                  whileTap={{ scale: 0.98 }}
                >
                  <AnimatePresence mode="wait">
                    {addedToCart ? (
                      <motion.span
                        key="check"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="flex items-center gap-2"
                      >
                        <Check size={18} />
                        <span className="hidden sm:inline">Added</span>
                      </motion.span>
                    ) : (
                      <motion.span
                        key="cart"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="flex items-center gap-2"
                      >
                        <ShoppingCart size={18} />
                        <span className="hidden sm:inline">Add</span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                  
                </motion.button>

                <button
                  onClick={() => { if (!user) return requestAuth("Sign in to save items", "Create an account or sign in to build your wishlist and save your favorite products for later."); toggleWishlist(product.id); }}
                  className={cn(
                    "w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all",
                    wishlisted
                      ? "border-red-300 bg-red-50 text-red-500"
                      : "border-border hover:border-red-300 hover:text-red-400"
                  )}
                  aria-label="Toggle wishlist"
                >
                  <Heart size={20} className={wishlisted ? "fill-red-500" : ""} />
                </button>

                <button
                  className="w-14 h-14 rounded-xl border-2 border-border flex items-center justify-center hover:border-primary hover:text-primary transition-all"
                  aria-label="Share"
                  onClick={handleShare}
                >
                  <Share2 size={20} />
                </button>
              </div>
              {shareMessage && <p role="status" className="text-sm text-muted-foreground">{shareMessage}</p>}

              {product.stock === 0 ? (
                <button
                  disabled
                  className="block w-full text-center py-4 rounded-xl border-2 border-muted bg-muted text-muted-foreground font-semibold cursor-not-allowed opacity-70"
                >
                  Out of Stock
                </button>
              ) : (
                <button
                  onClick={handleBuyNow}
                  className="block w-full text-center py-4 rounded-xl border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  Buy Now
                </button>
              )}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 border border-border rounded-2xl p-4">
              {[
                { icon: <Truck size={20} />, title: "Shipping", desc: shippingRates.freeShippingMinimum === 0 ? "Free standard delivery" : `Free above ${formatPrice(shippingRates.freeShippingMinimum)}` },
                { icon: <RotateCcw size={20} />, title: "Cash on Delivery", desc: "Available at checkout" },
                { icon: <Shield size={20} />, title: "Warranty", desc: product.warrantyInfo ?? "1 year" },
              ].map((badge) => (
                <div key={badge.title} className="flex flex-col items-center text-center gap-1.5">
                  <div className="text-primary">{badge.icon}</div>
                  <p className="text-xs font-semibold">{badge.title}</p>
                  <p className="text-xs text-muted-foreground">{badge.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

                {/* Sections: Description / Specs / Reviews */}
        <div className="mt-16 md:mt-24">
          
          <div className="space-y-16">
            
            {/* Description */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">{product.name} Details</h3>
                <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                  {product.description}
                </p>
                
                {product.features && product.features.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold mb-4 text-primary">Key Features</h4>
                    <ul className="space-y-3">
                      {product.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Check size={20} className="text-green-600 mt-0.5 shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted border border-border shadow-lg">
                <Image 
                  src={product.images[0] || product.thumbnail} 
                  alt={product.name}
                  fill
                  sizes="(max-width: 1023px) 100vw, 50vw"
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>

            {/* Specifications */}
            <div>
              <h3 className="text-2xl font-bold mb-6">Specifications</h3>
              <div className="border border-border rounded-2xl overflow-hidden">
                {Object.entries(product.specifications).map(([key, value], i) => (
                  <div
                    key={key}
                    className={cn(
                      "grid grid-cols-2 p-4 gap-4",
                      i % 2 === 0 ? "bg-muted/30" : "bg-background"
                    )}
                  >
                    <span className="text-sm font-semibold">{key}</span>
                    <span className="text-sm text-muted-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div id="reviews" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold mb-6">Customer Reviews</h3>
                {!hasReviewed && user && (
                  <button type="button" onClick={() => { setShowReviewForm(true); setReviewMessage(""); setReviewError(""); }} className="text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 px-6 py-2.5 rounded-xl mb-6 transition-all shadow-sm active:scale-95">
                    Write a review
                  </button>
                )}
              </div>
                {/* Rating Summary */}
                <div className="flex items-center gap-6 p-6 bg-muted/30 rounded-2xl">
                  <div className="text-center">
                    <p className="text-5xl font-bold text-primary">{productReviews.length ? averageReviewRating.toFixed(1) : product.rating}</p>
                    <div className="flex justify-center mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{productReviews.length} customer reviews</p>
                  </div>
                  {productReviews.length > 0 ? <div className="flex-1 space-y-1">
                    {[5, 4, 3, 2, 1].map((n) => (
                      <div key={n} className="flex items-center gap-2">
                        <span className="text-xs w-3">{n}</span>
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-amber-400 h-2 rounded-full"
                            style={{ width: `${productReviews.filter((review) => review.rating === n).length / productReviews.length * 100}%` }}
                          />
                        </div>
                        <span className="w-6 text-right text-xs text-muted-foreground">{productReviews.filter((review) => review.rating === n).length}</span>
                      </div>
                    ))}
                  </div> : <p className="flex-1 text-sm text-muted-foreground">Be the first customer to leave a review for this product.</p>}
                </div>

                {reviewMessage && <p role="status" className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">{reviewMessage}</p>}
                {showReviewForm && <form onSubmit={submitReview} className="space-y-4 rounded-2xl border border-border bg-card p-5 md:p-6">
                  <div className="flex items-center justify-between gap-3"><h3 className="font-semibold">Write a review</h3><button type="button" onClick={() => setShowReviewForm(false)} className="text-sm text-muted-foreground hover:text-foreground">Cancel</button></div>
                  {reviewError && <p role="alert" className="text-sm text-destructive">{reviewError}</p>}
                  <fieldset><legend className="mb-2 text-sm font-medium">Your rating</legend><div className="flex gap-1">{[1,2,3,4,5].map((rating) => <button key={rating} type="button" aria-label={`${rating} star${rating === 1 ? "" : "s"}`} aria-pressed={reviewRating === rating} onClick={() => setReviewRating(rating)}><Star size={24} className={rating <= reviewRating ? "fill-amber-400 text-amber-400" : "text-muted"}/></button>)}</div></fieldset>
                  <label className="block space-y-2 text-sm font-medium">Your review<textarea name="comment" required maxLength={3000} rows={4} className="w-full rounded-xl border border-border bg-background px-3 py-2.5"/></label>
                  <button type="submit" className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Submit review</button>
                </form>}

                {/* Review List */}
                {productReviews.map((review) => (
                  <div key={review.id} className="p-6 border border-border rounded-2xl space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{review.userName}</p>
                          {review.isVerified && <span className="bg-blue-100 text-blue-600 text-[10px] px-1.5 py-0.5 rounded-sm font-bold flex items-center gap-1"><Check size={10}/> Verified with Google Account</span>}
                        </div>
                        <div className="flex mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={i < review.rating ? "fill-amber-400 text-amber-400" : "text-muted"}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      </span>
                    </div>
                    
                    <p className="text-muted-foreground text-sm leading-relaxed">{review.comment}</p>
                    
                  </div>
                ))}
          </div>
        </div>
        </div>

        {/* Related Products */}
        <div className="mt-20">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
