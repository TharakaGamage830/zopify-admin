import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { setAuth, clearAuth, getUser } from '../services/api';
import type { Product, Category, Order, DashboardSummary } from '../types';
import { authServiceAPI } from '../services/authServiceAPI';
import { productServiceAPI } from '../services/productServiceAPI';
import { orderServiceAPI } from '../services/orderServiceAPI';
import { dashboardServiceAPI } from '../services/dashboardServiceAPI';
import { userServiceAPI } from '../services/userServiceAPI';
import type { User } from '../services/userServiceAPI';

export interface AdminContextType {
  // Theme & User
  theme: 'light' | 'dark';
  setTheme: React.Dispatch<React.SetStateAction<'light' | 'dark'>>;
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;

  // Feature Flags
  features: {
    category: boolean;
  };

  // Data States
  dashboardSummary: DashboardSummary | null;
  products: Product[];
  categories: Category[];
  orders: Order[];
  customers: User[];
  admins: User[];

  // Modal Control States
  isProductModalOpen: boolean;
  setIsProductModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editingProduct: Product | null;
  setEditingProduct: React.Dispatch<React.SetStateAction<Product | null>>;

  isUserModalOpen: boolean;
  setIsUserModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editingUser: User | null;
  setEditingUser: React.Dispatch<React.SetStateAction<User | null>>;
  userModalMode: 'customer' | 'admin';
  setUserModalMode: React.Dispatch<React.SetStateAction<'customer' | 'admin'>>;

  isProfileModalOpen: boolean;
  setIsProfileModalOpen: React.Dispatch<React.SetStateAction<boolean>>;

  // Handlers
  handleLogin: (email: string, password: string) => Promise<void>;
  handleLogout: () => Promise<void>;
  loadDashboardMetrics: () => Promise<void>;
  loadProducts: () => Promise<void>;
  loadOrders: () => Promise<void>;
  loadCustomers: () => Promise<void>;
  loadAdmins: () => Promise<void>;
  handleUserSubmit: (formData: any) => Promise<void>;
  handleDeleteUser: (id: string) => Promise<void>;
  handleToggleUserActive: (targetUser: User) => Promise<void>;
  handleProductSubmit: (formData: any) => Promise<void>;
  handleDeleteProduct: (id: string) => Promise<void>;
  handleCreateCategory: (name: string, slug: string, parentId?: string) => Promise<void>;
  handleDeleteCategory: (id: string) => Promise<void>;
  handleUpdateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  handleUpdateOrderPayment: (orderId: string, paymentStatus: string) => Promise<void>;
  handleUpdateStock: (productId: string, newStock: number) => Promise<void>;
  handleToggleProductActive: (product: Product) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('admin_theme') as 'light' | 'dark') || 'light'
  );

  // App Navigation States
  const [user, setUser] = useState<any>(getUser());

  // Feature support detection
  const [features, setFeatures] = useState({
    category: true,
  });

  // Admin Data states
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);

  // Modal Control states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userModalMode, setUserModalMode] = useState<'customer' | 'admin'>('customer');

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Sync theme configurations
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('admin_theme', theme);
  }, [theme]);

  // Load admin data on startup / user change
  useEffect(() => {
    if (user) {
      detectFeaturesAndLoad();
    }
  }, [user]);

  const detectFeaturesAndLoad = async () => {
    try {
      const cats = await productServiceAPI.getCategories();
      setCategories(cats);
      setFeatures((f) => ({ ...f, category: true }));
    } catch (e: any) {
      if (e?.statusCode === 404) {
        setFeatures((f) => ({ ...f, category: false }));
      }
    }

    loadDashboardMetrics();
    loadProducts();
    loadOrders();
    loadCustomers();
    loadAdmins();
  };

  const loadCustomers = async () => {
    try {
      const res = await userServiceAPI.getUsers('customer');
      setCustomers(res);
    } catch (e) {
      console.error('Error fetching customers:', e);
    }
  };

  const loadAdmins = async () => {
    try {
      const res = await userServiceAPI.getUsers();
      const staffRoles = ['super_admin', 'admin', 'catalog_manager', 'order_manager', 'support_agent', 'staff'];
      setAdmins(res.filter((u) => staffRoles.includes(u.role)));
    } catch (e) {
      console.error('Error fetching admins/staff:', e);
    }
  };

  const loadDashboardMetrics = async () => {
    try {
      const summary = await dashboardServiceAPI.getSummary();
      setDashboardSummary(summary);
    } catch (e) {
      console.error('Error fetching analytics dashboard:', e);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await productServiceAPI.getProducts();
      setProducts(res.items);
    } catch (e) {
      console.error('Error fetching products:', e);
    }
  };

  const loadOrders = async () => {
    try {
      const ords = await orderServiceAPI.getOrders();
      setOrders(ords);
    } catch (e) {
      console.error('Error fetching orders:', e);
    }
  };

  // Auth Action handlers
  const handleLogin = async (email: string, password: string) => {
    const data = await authServiceAPI.login(email, password);
    const staffRoles = ['super_admin', 'admin', 'catalog_manager', 'order_manager', 'support_agent', 'staff'];
    if (!staffRoles.includes(data.user.role)) {
      throw new Error('Not authorized to access the Admin Console');
    }
    setAuth(data.accessToken, data.refreshToken, data.user);
    setUser(data.user);
  };

  const handleLogout = async () => {
    try {
      await authServiceAPI.logout(localStorage.getItem('admin_refreshToken'));
    } catch (e) {}
    clearAuth();
    setUser(null);
    setDashboardSummary(null);
    setProducts([]);
    setCategories([]);
    setOrders([]);
    setCustomers([]);
    setAdmins([]);
  };

  // User Management actions
  const handleUserSubmit = async (formData: any) => {
    try {
      if (editingUser) {
        await userServiceAPI.updateUser(editingUser.id, formData);
        alert('User updated successfully');
      } else {
        await userServiceAPI.createUser(formData);
        alert('User created successfully');
      }
      setIsUserModalOpen(false);
      setEditingUser(null);
      loadCustomers();
      loadAdmins();
      loadDashboardMetrics();
    } catch (e: any) {
      alert(e.message || 'Failed to save user');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await userServiceAPI.deleteUser(id);
      alert(res.message || 'User deleted');
      loadCustomers();
      loadAdmins();
      loadDashboardMetrics();
    } catch (e: any) {
      alert(e.message || 'Failed to delete user');
    }
  };

  const handleToggleUserActive = async (targetUser: User) => {
    try {
      await userServiceAPI.updateUser(targetUser.id, {
        isActive: !targetUser.isActive,
      });
      loadCustomers();
      loadAdmins();
      loadDashboardMetrics();
    } catch (e: any) {
      alert(e.message || 'Failed to update user status');
    }
  };

  // Product actions
  const handleProductSubmit = async (formData: any) => {
    try {
      if (editingProduct) {
        await productServiceAPI.updateProduct(editingProduct.id, formData);
        alert('Product updated successfully');
      } else {
        await productServiceAPI.createProduct(formData);
        alert('Product created successfully');
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
      loadProducts();
      loadDashboardMetrics();
    } catch (e: any) {
      alert(e.message || 'Failed to save product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete/deactivate this product?')) return;
    try {
      const res = await productServiceAPI.deleteProduct(id);
      alert(res.message || 'Product deleted');
      loadProducts();
      loadDashboardMetrics();
    } catch (e: any) {
      alert(e.message || 'Failed to delete product');
    }
  };

  // Category actions
  const handleCreateCategory = async (name: string, slug: string, parentId?: string) => {
    try {
      await productServiceAPI.createCategory(name, slug, parentId);
      alert('Category created successfully');
      detectFeaturesAndLoad();
    } catch (e: any) {
      alert(e.message || 'Failed to create category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete category? Parent associations will be unlinked.')) return;
    try {
      await productServiceAPI.deleteCategory(id);
      alert('Category deleted');
      detectFeaturesAndLoad();
      loadProducts();
    } catch (e: any) {
      alert(e.message || 'Failed to delete category');
    }
  };

  // Order actions
  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await orderServiceAPI.updateOrderStatus(orderId, status);
      alert('Order status updated');
      loadOrders();
      loadDashboardMetrics();
    } catch (e: any) {
      alert(e.message || 'Failed to update order status');
    }
  };

  const handleUpdateOrderPayment = async (orderId: string, paymentStatus: string) => {
    try {
      await orderServiceAPI.updateOrderPayment(orderId, paymentStatus);
      alert('Payment status updated');
      loadOrders();
      loadDashboardMetrics();
    } catch (e: any) {
      alert(e.message || 'Failed to update payment status');
    }
  };

  // Stock management actions (from GRN / PRN)
  const handleUpdateStock = async (productId: string, newStock: number) => {
    await productServiceAPI.updateProduct(productId, {
      stockQuantity: newStock,
    });
    loadProducts();
    loadDashboardMetrics();
  };

  const handleToggleProductActive = async (product: Product) => {
    try {
      await productServiceAPI.updateProduct(product.id, {
        isActive: !product.isActive,
      });
      loadProducts();
      loadDashboardMetrics();
    } catch (e: any) {
      alert(e.message || 'Failed to toggle product status');
    }
  };

  return (
    <AdminContext.Provider
      value={{
        theme,
        setTheme,
        user,
        setUser,
        features,
        dashboardSummary,
        products,
        categories,
        orders,
        customers,
        admins,
        isProductModalOpen,
        setIsProductModalOpen,
        editingProduct,
        setEditingProduct,
        isUserModalOpen,
        setIsUserModalOpen,
        editingUser,
        setEditingUser,
        userModalMode,
        setUserModalMode,
        isProfileModalOpen,
        setIsProfileModalOpen,
        handleLogin,
        handleLogout,
        loadDashboardMetrics,
        loadProducts,
        loadOrders,
        loadCustomers,
        loadAdmins,
        handleUserSubmit,
        handleDeleteUser,
        handleToggleUserActive,
        handleProductSubmit,
        handleDeleteProduct,
        handleCreateCategory,
        handleDeleteCategory,
        handleUpdateOrderStatus,
        handleUpdateOrderPayment,
        handleUpdateStock,
        handleToggleProductActive,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
