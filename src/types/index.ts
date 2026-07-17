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
  userId: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  totalAmount: string;
  shippingAddress: any;
  paymentStatus: string;
  createdAt: string;
  user?: { id: string; email: string; fullName: string };
  items?: OrderItem[];
}

export interface DashboardSummary {
  revenue: number;
  orderCount: number;
  userGrowth: { date: string; count: number }[];
  topProducts: { productId: string; name: string; price: number; totalSold: number }[];
  lowStockAlerts: { id: string; name: string; stockQuantity: number }[];
}
