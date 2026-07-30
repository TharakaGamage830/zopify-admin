export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  stockQuantity: number;
  images: string; // JSON array of strings
  isActive: boolean;
  categoryId: string | null;
  category?: { id: string; name: string } | null;
}

export interface Category {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  children?: Category[];
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  product: Product;
}

export interface Order {
  id: string;
  orderNumber?: string;
  userId: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  totalAmount: string;
  shippingAddress: any;
  paymentStatus: string;
  createdAt: string;
  user?: { id: string; email: string; fullName: string };
  items?: OrderItem[];
}

export interface ProductSalesStat {
  productId: string;
  name: string;
  slug: string;
  categoryName: string;
  price: number;
  stockQuantity: number;
  totalSold: number;
  totalRevenue: number;
  orderCount: number;
}

export interface CategorySalesStat {
  categoryId: string;
  name: string;
  totalRevenue: number;
  totalSold: number;
  productCount: number;
  percentage: number;
}

export interface CustomerSalesStat {
  userId: string;
  fullName: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  lastOrderDate: string;
}

export interface RevenueTrendStat {
  date: string;
  revenue: number;
  orders: number;
}

export interface OrderStatusStat {
  status: string;
  count: number;
  totalAmount: number;
}

export interface DashboardSummary {
  revenue: number;
  orderCount: number;
  averageOrderValue?: number;
  userGrowth: { date: string; count: number }[];
  revenueTrend?: RevenueTrendStat[];
  topProducts: { productId: string; name: string; price: number; totalSold: number }[];
  salesByProduct?: ProductSalesStat[];
  salesByCategory?: CategorySalesStat[];
  salesByCustomer?: CustomerSalesStat[];
  orderStatusDistribution?: OrderStatusStat[];
  lowStockAlerts: { id: string; name: string; stockQuantity: number }[];
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: string | number;
  minOrderValue: string | number | null;
  maxDiscount: string | number | null;
  startDate: string | null;
  endDate: string | null;
  usageLimit: number | null;
  usageCount: number;
  targeting: 'all' | 'new_users' | 'selected';
  isActive: boolean;
  description: string | null;
  createdAt: string;
}

export interface Offer {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: string | number;
  minOrderValue: string | number | null;
  maxDiscount: string | number | null;
  startDate: string | null;
  endDate: string | null;
  productIds: string; // JSON array of string IDs
  isActive: boolean;
  description: string | null;
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string | null;
  imageUrl: string;
  linkUrl: string | null;
  placement: string;
  sortOrder: number;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingZone {
  id: string;
  name: string;
  cities: string; // JSON array of strings
  baseFee: string | number;
  freeThreshold: string | number | null;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  carrier: string | null;
  isActive: boolean;
}

export interface CmsPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  type: 'page' | 'banner' | 'faq';
  isPublished: boolean;
  sortOrder: number;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PackageProduct {
  id: string;
  packageId: string;
  productId: string;
  quantity: number;
  product?: Product;
}

export interface Package {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: string | number;
  images: string; // JSON array of strings
  addonLimitType: 'count' | 'amount';
  addonLimitValue: string | number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  products?: PackageProduct[];
}

export interface RefundRequest {
  id: string;
  orderId: string;
  userId: string;
  reason: string;
  status: 'requested' | 'approved' | 'rejected' | 'completed';
  refundAmount: string | number | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  order?: Order;
  user?: { id: string; email: string; fullName: string };
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string | null;
  images: string; // JSON array
  isApproved: boolean;
  createdAt: string;
  product?: Product;
  user?: { id: string; fullName: string; email?: string };
}

export type PlacementKey =
  | 'home_top'
  | 'home_bottom'
  | 'storefront_top'
  | 'storefront_middle'
  | 'storefront_bottom'
  | 'category_banner'
  | 'product_detail'
  | 'cart_promo';

export interface PredefinedPlacement {
  key: PlacementKey;
  title: string;
  pageName: string;
  location: string;
  aspectRatio: string;
  description: string;
  recommendedSize: string;
  sketchType: PlacementKey;
}

export interface AdBanner {
  id: string;
  placementKey: PlacementKey;
  title: string;
  subtitle?: string;
  badgeText?: string;
  buttonText?: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
  priority?: number;
  startDate?: string;
  endDate?: string;
}

export type TargetAudience = 'all' | 'active' | 'vip' | 'inactive';

export interface BroadcastNotification {
  id: string;
  title: string;
  message: string;
  type: 'promo' | 'system' | 'order' | 'security';
  targetAudience: TargetAudience;
  targetAudienceLabel: string;
  scheduledAt: string | null;
  status: 'sent' | 'scheduled' | 'draft';
  recipientCount: number;
  createdAt: string;
}



