"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, MapPin, CreditCard, Truck, CheckCircle, Gift, FileText, ShoppingBag, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import { useOrders } from "@/contexts/orders-context";
import { useProducts } from "@/contexts/products-context";
import { generateId } from "@/lib/utils";
import type { Order } from "@/types";
import { useAddresses } from "@/contexts/addresses-context";

type CheckoutStep = "address" | "shipping" | "payment" | "review";

const STEPS: { id: CheckoutStep; label: string; icon: React.ReactNode }[] = [
  { id: "address", label: "Address", icon: <MapPin size={16} /> },
  { id: "shipping", label: "Shipping", icon: <Truck size={16} /> },
  { id: "payment", label: "Payment", icon: <CreditCard size={16} /> },
  { id: "review", label: "Review", icon: <CheckCircle size={16} /> },
];

export default function CheckoutPage() {
  const { state, subtotal, discount, shipping, shippingRates, clearCart } = useCart();
  const { user } = useAuth();
  const { addOrder } = useOrders();
  const { products, setProducts } = useProducts();
  const { ready: addressesReady, getAddresses, saveAddress } = useAddresses();

  const [step, setStep] = useState<CheckoutStep>("address");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isPlacing, setIsPlacing] = useState(false);

  const [address, setAddress] = useState({
    fullName: user?.displayName ?? "",
    email: user?.email ?? "",
    phone: "",
    street1: "",
    street2: "",
    city: "",
    state: "",
    country: "India",
    zipCode: "",
  });
  const [saveDeliveryAddress, setSaveDeliveryAddress] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const savedAddresses = user ? getAddresses(user.uid) : [];
  const [shippingMethod, setShippingMethod] = useState("standard");
  const paymentMethod = "cod" as const;
  const [giftWrap, setGiftWrap] = useState(false);
  const [orderNotes, setOrderNotes] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState("");

  const selectedShipping = shippingMethod === "overnight" ? shippingRates.overnightShippingFee : shippingMethod === "express" ? shippingRates.expressShippingFee : shipping;
  const orderTotal = Math.max(0, subtotal - discount + selectedShipping + (giftWrap ? 499 : 0));

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  useEffect(() => {
    if (!user || !addressesReady || address.street1) return;
    const addrs = getAddresses(user.uid);
    if (addrs.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowAddressForm(true);
      return;
    }
    const defaultAddress = addrs.find((saved) => saved.isDefault) || addrs[0];
    if (!defaultAddress) return;
    // Pre-fill the signed-in customer's saved default delivery address.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAddress({ fullName: defaultAddress.fullName, email: user.email ?? address.email, phone: defaultAddress.phone, street1: defaultAddress.street1, street2: defaultAddress.street2 ?? "", city: defaultAddress.city, state: defaultAddress.state, country: defaultAddress.country, zipCode: defaultAddress.zipCode });
  }, [address.email, address.street1, addressesReady, getAddresses, user]);

  const handlePlaceOrder = async () => {
    setIsPlacing(true);
    setCheckoutError("");
    const missingStock = state.items.find((item) => {
      const latest = products.find((product) => product.id === item.product.id);
      return !latest || !latest.isActive || latest.stock < item.quantity;
    });
    if (missingStock) {
      setCheckoutError(`${missingStock.product.name} is no longer available in the requested quantity. Update your cart and try again.`);
      setIsPlacing(false);
      return;
    }
    const nextOrderId = `UC${Date.now().toString().slice(-8)}`;
    const order: Order = {
      id: nextOrderId,
      userId: user?.uid ?? "guest",
      email: address.email.trim(),
      status: "pending",
      items: state.items.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        thumbnail: item.product.thumbnail,
      })),
      subtotal,
      tax: 0,
      shippingFee: selectedShipping,
      discount,
      total: orderTotal,
      shippingAddress: {
        id: generateId(),
        label: "Delivery",
        fullName: address.fullName.trim(),
        phone: address.phone.trim(),
        street1: address.street1.trim(),
        street2: address.street2.trim() || undefined,
        city: address.city.trim(),
        state: address.state.trim(),
        country: address.country.trim(),
        zipCode: address.zipCode.trim(),
        isDefault: false,
      },
      paymentMethod,
      paymentStatus: "pending",
      orderNotes: orderNotes.trim() || undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    addOrder(order);
    if (user && saveDeliveryAddress) saveAddress(user.uid, order.shippingAddress);
    setProducts((current) => current.map((product) => {
      const ordered = order.items.find((item) => item.productId === product.id);
      return ordered ? { ...product, stock: product.stock - ordered.quantity, updatedAt: Date.now() } : product;
    }));
    setOrderId(nextOrderId);
    clearCart();
    setOrderPlaced(true);
    setIsPlacing(false);
  };

  const continueFromAddress = () => {
    const required = [address.fullName, address.email, address.phone, address.street1, address.city, address.state, address.country, address.zipCode];
    if (required.some((value) => !value.trim())) {
      setCheckoutError("Complete all required delivery details to continue.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(address.email.trim())) {
      setCheckoutError("Enter a valid email address for your order confirmation.");
      return;
    }
    if (address.phone.replace(/\D/g, "").length < 10) {
      setCheckoutError("Enter a valid phone number with at least 10 digits.");
      return;
    }
    setCheckoutError("");
    setStep("shipping");
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle size={48} className="text-green-600" />
            </motion.div>
            <h1 className="text-3xl font-bold mb-3">Order Placed!</h1>
            <p className="text-muted-foreground mb-2">
              Thank you for your order. Your order details have been saved and payment is due on delivery.
            </p>
            <p className="text-sm font-mono bg-muted px-4 py-2 rounded-lg inline-block mb-8">
              Order #{orderId}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={user ? "/track-order" : `/track-order?orderId=${orderId}`}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
              >
                Track Order
              </Link>
              <Link
                href="/"
                className="border border-border px-8 py-3 rounded-xl font-semibold hover:bg-muted transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="flex min-h-[70vh] flex-col items-center justify-center px-4 pt-24 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShoppingBag size={28} />
          </div>
          <h1 className="text-2xl font-bold">Your cart is empty</h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">Add something you love before starting checkout.</p>
          <Link href="/category/all" className="mt-6 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90">Browse products</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 lg:pt-24">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12 max-w-6xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight size={14} />
            <Link href="/cart" className="hover:text-primary">Cart</Link>
            <ChevronRight size={14} />
            <span className="text-foreground font-medium">Checkout</span>
          </nav>

          <h1 className="text-3xl md:text-4xl font-bold mb-8">Checkout</h1>

          {checkoutError && (
            <div role="alert" className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <p>{checkoutError}</p>
            </div>
          )}

          {/* Step Indicator */}
          <div className="flex items-center mb-10">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center flex-1">
                <div
                  className={`flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer ${
                    stepIndex >= i ? "text-primary" : "text-muted-foreground"
                  }`}
                  onClick={() => stepIndex > i && setStep(s.id)}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      stepIndex > i
                        ? "bg-primary text-primary-foreground"
                        : stepIndex === i
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {stepIndex > i ? <CheckCircle size={16} /> : s.icon}
                  </div>
                  <span className="hidden sm:block">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-3 ${stepIndex > i ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {step === "address" && (
                  <motion.div
                    key="address"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-card border border-border rounded-2xl p-6 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold">Delivery Address</h2>
                      {savedAddresses.length > 0 && showAddressForm && (
                        <button type="button" onClick={() => setShowAddressForm(false)} className="text-sm font-semibold text-primary hover:underline">
                          Use Saved Address
                        </button>
                      )}
                      {savedAddresses.length > 0 && !showAddressForm && (
                        <button type="button" onClick={() => setShowAddressForm(true)} className="text-sm font-semibold text-primary hover:underline">
                          + Add New Address
                        </button>
                      )}
                    </div>

                    {!showAddressForm && savedAddresses.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {savedAddresses.map((saved) => (
                          <div 
                            key={saved.id} 
                            onClick={() => setAddress({ fullName: saved.fullName, email: address.email || user?.email || "", phone: saved.phone, street1: saved.street1, street2: saved.street2 ?? "", city: saved.city, state: saved.state, country: saved.country, zipCode: saved.zipCode })}
                            className={`cursor-pointer rounded-2xl border-2 p-5 transition-all relative ${address.street1 === saved.street1 ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/50'}`}
                          >
                            {address.street1 === saved.street1 && (
                              <div className="absolute top-4 right-4 text-primary">
                                <CheckCircle size={20} className="fill-primary/20" />
                              </div>
                            )}
                            <p className="font-bold text-base mb-1">
                              {saved.label} {saved.isDefault && <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full ml-2 align-middle">Default</span>}
                            </p>
                            <p className="text-sm font-medium mb-2">{saved.fullName} · {saved.phone}</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {saved.street1}{saved.street2 ? `, ${saved.street2}` : ""}<br/>
                              {saved.city}, {saved.state} {saved.zipCode}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            { label: "Full Name", key: "fullName", placeholder: "John Doe" },
                            { label: "Email", key: "email", placeholder: "you@example.com", type: "email" },
                            { label: "Phone", key: "phone", placeholder: "9876543210", type: "tel" },
                            { label: "Country", key: "country", placeholder: "India" },
                            { label: "Street Address", key: "street1", placeholder: "12, Market Street" },
                            { label: "Apt / Suite (optional)", key: "street2", placeholder: "House No. 4" },
                            { label: "City", key: "city", placeholder: "Erode" },
                            { label: "State", key: "state", placeholder: "Tamil Nadu" },
                            { label: "ZIP Code", key: "zipCode", placeholder: "638001" },
                          ].map(({ label, key, placeholder, type }) => (
                            <div key={key} className={key === "street1" || key === "email" ? "sm:col-span-2" : ""}>
                              <label htmlFor={`checkout-${key}`} className="block text-sm font-medium mb-1">{label}{key !== "street2" && " *"}</label>
                              <input
                                id={`checkout-${key}`}
                                type={type ?? "text"}
                                required={key !== "street2"}
                                autoComplete={key === "fullName" ? "name" : key === "email" ? "email" : key === "phone" ? "tel" : key === "street1" ? "street-address" : undefined}
                                placeholder={placeholder}
                                value={address[key as keyof typeof address]}
                                onChange={(e) => setAddress((prev) => ({ ...prev, [key]: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                              />
                            </div>
                          ))}
                        </div>
                        {user && (
                          <label className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                            <input type="checkbox" checked={saveDeliveryAddress} onChange={(event) => setSaveDeliveryAddress(event.target.checked)} className="accent-primary"/>
                            Save this delivery address to my account on this device
                          </label>
                        )}
                      </>
                    )}

                    {/* Gift Wrap & Notes */}
                    <div className="space-y-3 pt-2 border-t border-border">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={giftWrap}
                          onChange={(e) => setGiftWrap(e.target.checked)}
                          className="rounded accent-primary"
                        />
                        <div className="flex items-center gap-2">
                          <Gift size={16} className="text-primary" />
                          <span className="text-sm font-medium">Add gift wrapping (+₹499)</span>
                        </div>
                      </label>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2">
                          <FileText size={16} className="text-muted-foreground" />
                          Order Notes (optional)
                        </label>
                        <textarea
                          value={orderNotes}
                          onChange={(e) => setOrderNotes(e.target.value)}
                          placeholder="Any special instructions for your order..."
                          rows={2}
                          className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none"
                        />
                      </div>
                    </div>

                    <button
                      onClick={continueFromAddress}
                      className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                    >
                      Continue to Shipping
                    </button>
                  </motion.div>
                )}

                {step === "shipping" && (
                  <motion.div
                    key="shipping"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-card border border-border rounded-2xl p-6 space-y-4"
                  >
                    <h2 className="text-xl font-bold">Shipping Method</h2>
                    <div className="space-y-3">
                      {[
                        { id: "standard", label: "Standard Delivery", desc: "5-7 business days", price: shipping === 0 ? "FREE" : formatPrice(shipping) },
                        { id: "express", label: "Express Delivery", desc: "2-3 business days", price: formatPrice(999) },
                        { id: "overnight", label: "Priority Delivery", desc: "Next business day", price: formatPrice(1999) },
                      ].map((method) => (
                        <label key={method.id} className="flex items-center gap-4 p-4 border-2 border-border rounded-xl cursor-pointer hover:border-primary transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                          <input
                            type="radio"
                            name="shipping"
                            value={method.id}
                            checked={shippingMethod === method.id}
                            onChange={() => setShippingMethod(method.id)}
                            className="accent-primary"
                          />
                          <div className="flex-1">
                            <p className="font-semibold">{method.label}</p>
                            <p className="text-sm text-muted-foreground">{method.desc}</p>
                          </div>
                          <span className={`font-bold ${method.price === "FREE" ? "text-green-600" : ""}`}>
                            {method.price}
                          </span>
                        </label>
                      ))}
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => setStep("address")}
                        className="flex-1 py-4 rounded-xl border border-border font-semibold hover:bg-muted transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => setStep("payment")}
                        className="flex-1 bg-primary text-primary-foreground py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                      >
                        Continue to Payment
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === "payment" && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-card border border-border rounded-2xl p-6 space-y-4"
                  >
                    <h2 className="text-xl font-bold">Payment Method</h2>
                    <div className="rounded-2xl border-2 border-primary bg-primary/5 p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Truck size={19} /></div>
                        <div>
                          <p className="font-semibold">Cash on Delivery</p>
                          <p className="mt-1 text-sm text-muted-foreground">Pay the courier when your order arrives. Online card and UPI payments are not available yet.</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => setStep("shipping")}
                        className="flex-1 py-4 rounded-xl border border-border font-semibold hover:bg-muted transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => {
                          setCheckoutError("");
                          setStep("review");
                        }}
                        className="flex-1 bg-primary text-primary-foreground py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                      >
                        Review Order
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === "review" && (
                  <motion.div
                    key="review"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    {/* Items Review */}
                    <div className="bg-card border border-border rounded-2xl p-6">
                      <h2 className="text-xl font-bold mb-4">Review Your Order</h2>
                      <div className="space-y-3">
                        {state.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3">
                            <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                              <Image src={item.product.thumbnail} alt={item.product.name} fill sizes="80px" className="object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <Link href={`/products/${item.product.id}`} target="_blank" className="text-sm font-medium line-clamp-1 hover:text-primary hover:underline">{item.product.name}</Link>
                              <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-semibold text-sm">{formatPrice(item.price * item.quantity)}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="bg-card border border-border rounded-2xl p-6">
                      <h3 className="font-semibold mb-2">Delivery Address</h3>
                      <p className="text-sm text-muted-foreground">
                        {address.fullName}, {address.street1}{address.street2 ? `, ${address.street2}` : ""}, {address.city}, {address.state} {address.zipCode}<br />{address.email} · {address.phone}
                      </p>
                      <h3 className="font-semibold mt-4 mb-2">Payment</h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        Cash on Delivery
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep("payment")}
                        className="flex-1 py-4 rounded-xl border border-border font-semibold hover:bg-muted transition-colors"
                      >
                        Back
                      </button>
                      <motion.button
                        onClick={handlePlaceOrder}
                        disabled={isPlacing}
                        className="flex-1 bg-primary text-primary-foreground py-4 rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-70"
                        whileTap={{ scale: 0.98 }}
                      >
                        {isPlacing ? "Placing Order..." : `Place Order · ${formatPrice(orderTotal)}`}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Order Summary Sidebar */}
            <div className="bg-card border border-border rounded-2xl p-6 h-fit sticky top-24">
              <h3 className="font-bold text-lg mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm mb-4">
                {state.items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span className="text-muted-foreground line-clamp-1 flex-1 mr-2">
                      {item.product.name} ×{item.quantity}
                    </span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="h-px bg-border mb-4" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                {giftWrap && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gift Wrap</span>
                    <span>₹499</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className={selectedShipping === 0 ? "text-green-600" : ""}>{selectedShipping === 0 ? "FREE" : formatPrice(selectedShipping)}</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(orderTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
