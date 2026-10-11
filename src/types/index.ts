export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  categoryId: string;
  subcategoryId?: string;
  brand: string;
  images: string[];
  thumbnail: string;
  stock: number;
  variants?: ProductVariant[];
  specifications: Record<string, string>;
  features: string[];
  manualPdfUrl?: string;
  warrantyInfo?: string;
  rating: number;
  reviewsCount: number;
  createdAt: number;
  updatedAt: number;
  isActive: boolean;
  tags: string[];
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price?: number; // Override price
  stock: number;
  attributes: Record<string, string>; // e.g., { color: "Red", size: "M" }
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  isActive: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: number;
  helpful: number;
  status: "pending" | "approved" | "hidden";
  isVerified?: boolean;

}

export interface UserProfile {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'customer';
  addresses: Address[];
  wishlist: string[]; // Product IDs
  rewardPoints: number;
  createdAt: string;
}

export interface Address {
  id: string;
  label: string; // "Home", "Office"
  fullName: string;
  phone: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  userId: string;
  email?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingFee: number;
  discount: number;
  total: number;
  shippingAddress: Address;
  paymentMethod: 'card' | 'upi' | 'cod';
  paymentStatus: 'pending' | 'paid' | 'failed';
  trackingNumber?: string;
  orderNotes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface OrderItem {
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  quantity: number;
  thumbnail: string;
}
