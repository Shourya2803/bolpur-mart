// types/index.ts

// Base Firebase document interface
export interface FirebaseDocument {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

// User interface
export interface User extends FirebaseDocument {
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  addresses: Address[];
  payments: PaymentMethod[];
  cart?: CartItem[];
  preferences: UserPreferences;
  emailVerified?: boolean;
  profileCompleted?: boolean;
  authProvider?: 'email' | 'google';
  lastLoginAt?: string;
  lastLogoutAt?: string;
}

export interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  receiverName: string;
  receiverPhone: string;
  street: string;
  city: string;
  state: string;
  pinCode: string;
  fullAddress: string;
  isDefault: boolean;
  addressType?: 'home' | 'work' | 'other';
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'upi';
  name: string;
  details: string;
  isDefault: boolean;
  lastUsed?: string;
  cardNumber?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cardHolderName?: string;
  cardType?: 'visa' | 'mastercard' | 'rupay';
  upiId?: string;
}

export interface UserPreferences {
  notifications: boolean;
  theme: 'light' | 'dark';
  language: string;
  currency: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: string;
  stock: number;
  attributes: Record<string, string>;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CategoryReference {
  id: string;
  name: string;
}

export interface TimeSlot {
  id: string;
  name: string;
  label: string;
  icon: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TimeRuleSlot {
  timeSlotName: string;
  startTime: string;
  endTime: string;
  allowedCategories: CategoryReference[];
  isActive: boolean;
}

export interface TimeRulesConfig {
  [timeSlotId: string]: TimeRuleSlot;
}

export interface Vendor {
  id: string;
  name: string;
  location: string;
  commission: number;
  category: string[];
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  totalProducts: number;
  totalOrders: number;
  rating: number;
}

export interface Product {
  id: string;
  name: string;
  categories: Category[];
  price: number;
  discountedPrice?: number;
  discountPercentage?: number;
  hasDiscount: boolean;
  stock: number;
  vendors: Vendor[];
  description: string;
  tags: string[];
  available: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  imageUrl?: string;
  averageRating: number;
  totalRatings: number;
  ratingBreakdown: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface CartItem extends FirebaseDocument {
  userId: string;
  productId: string;
  quantity: number;
  variant?: string;
  product?: Product;
}

export interface CartItemWithProduct extends CartItem {
  product: Product;
}

export interface UpiPaymentMethod {
  id: string;
  name: string;
  upiId: string;
  qrImageUrl: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  imageUrl?: string;
  variant?: string | null;
  rating?: number;
}

export interface DeliverySlot {
  id: string;
  type: "immediate" | "express" | "scheduled";
  label: string;
  description: string;
  fee: number;
  estimatedMinutes: number;
  isAvailable: boolean;
  scheduledDate?: string;
  scheduledTime?: string;
}

export interface Order {
  id: string;
  orderNumber: string;

  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;

  deliveryAddress: Address;
  items: OrderItem[];

  subtotal: number;
  deliveryFee: number;
  taxes: number;
  discount: number;
  total: number;

  status: "placed" | "confirmed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled" | "refunded";
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  paymentMethod: "cash_on_delivery" | "upi_online";

  paymentDetails?: {
    // For UPI payments - all required
    upiTransactionId: string;
    paymentScreenshot: string;
    upiId: string;
    verificationStatus: "pending" | "verified" | "rejected";
  } | {
    // For COD payments - only verification status required
    verificationStatus: "pending" | "verified" | "rejected";
  };

  deliverySlot: {
    type: "immediate" | "express" | "scheduled";
    estimatedTime: Date;
    actualDeliveryTime?: Date;
    fee: number;
    // Only include these for scheduled delivery
    scheduledDate?: string;
    scheduledTime?: string;
  };

  notes?: string;
  specialInstructions?: string;

  orderTracking?: {
    placedAt: Date;
    confirmedAt?: Date;
    preparingAt?: Date;
    outForDeliveryAt?: Date;
    deliveredAt?: Date;
  };

  createdAt: Date;
  updatedAt: Date;

  isRefundable: boolean;
  isCancellable: boolean;
  estimatedDeliveryTime: Date;

  rating?: number;
  review?: string;
  reviewedAt?: Date;
}

export interface CartSummary {
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  taxes: number;
  discount: number;
  total: number;
}

export interface WishlistItem extends FirebaseDocument {
  userId: string;
  productId: string;
}

export interface Recommendation extends FirebaseDocument {
  userId: string;
  productId: string;
  score: string;
  reason?: string;
}

export type TimeSlotType = 'morning' | 'afternoon' | 'evening' | 'night';

export interface TimeSlotInfo {
  label: string;
  time: string;
  description: string;
  startsAt: Date;
  endsAt: Date;
}

export interface Notification {
  id: string;
  type: "admin_order_placed" | "customer_order_placed" | "order_update" | "offer" | "info" | "delivery_update" | "payment_verified" | "payment_rejected";
  title: string;
  message: string;
  orderId?: string;
  orderNumber?: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  total?: number;
  targetAudience: "admin" | "customer";
  isRead: boolean;
  priority: "low" | "normal" | "high";
  createdAt: Date;
  icon?: string;
  // Payment verification specific fields
  paymentMethod?: string;
  verificationStatus?: "pending" | "verified" | "rejected";
  rejectionReason?: string;
}

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

// Input types
export type CreateUser = Omit<User, keyof FirebaseDocument>;
export type CreateCategory = Omit<Category, keyof FirebaseDocument>;
export type CreateProduct = Omit<Product, keyof FirebaseDocument>;
export type CreateCartItem = Omit<CartItem, keyof FirebaseDocument>;
export type CreateOrder = Omit<Order, keyof FirebaseDocument>;
export type CreateWishlistItem = Omit<WishlistItem, keyof FirebaseDocument>;
export type CreateRecommendation = Omit<Recommendation, keyof FirebaseDocument>;

// Update types
export type UpdateUser = Partial<CreateUser>;
export type UpdateCategory = Partial<CreateCategory>;
export type UpdateProduct = Partial<CreateProduct>;
export type UpdateCartItem = Partial<CreateCartItem>;
export type UpdateOrder = Partial<CreateOrder>;
export type UpdateWishlistItem = Partial<CreateWishlistItem>;
export type UpdateRecommendation = Partial<CreateRecommendation>;
