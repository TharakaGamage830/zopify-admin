import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { setAuth, clearAuth, getUser } from '../services/api';
import type { Product, Category, Order, DashboardSummary } from '../types';
import { authServiceAPI } from '../services/authServiceAPI';
import { productServiceAPI } from '../services/productServiceAPI';
import { orderServiceAPI } from '../services/orderServiceAPI';
import { dashboardServiceAPI } from '../services/dashboardServiceAPI';
import { userServiceAPI } from '../services/userServiceAPI';
import type { User } from '../services/userServiceAPI';
import { ToastContainer, type ToastItem } from '../components/ToastContainer';
import { ConfirmModal } from '../components/ConfirmModal';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
}

export interface AdminContextType {
  // Theme & User
  theme: 'light' | 'dark';
  setTheme: React.Dispatch<React.SetStateAction<'light' | 'dark'>>;
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;

  // Toast & Alert System
  toasts: ToastItem[];
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning', title?: string) => void;
  removeToast: (id: string) => void;

  // Custom Confirmation Dialog System
  requestConfirmation: (options: ConfirmOptions) => Promise<boolean>;

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

  // Toast System State
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Confirmation Modal State
  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve: ((value: boolean) => void) | null;
  }>({
    isOpen: false,
    options: { title: '', message: '' },
    resolve: null,
  });

  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'success',
    title?: string
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const requestConfirmation = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmModalState({
        isOpen: true,
        options,
        resolve,
      });
    });
  };

  const handleConfirmModalResponse = (confirmed: boolean) => {
    if (confirmModalState.resolve) {
      confirmModalState.resolve(confirmed);
    }
    if (!confirmed) {
      showToast('Action cancelled', 'warning');
    }
    setConfirmModalState({
      isOpen: false,
      options: { title: '', message: '' },
      resolve: null,
    });
  };

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
    } catch (e: any) {
      showToast(e?.message || 'Network error: Failed to fetch customers list', 'error');
    }
  };

  const loadAdmins = async () => {
    try {
      const res = await userServiceAPI.getUsers();
      const staffRoles = ['super_admin', 'admin', 'catalog_manager', 'order_manager', 'support_agent', 'staff'];
      setAdmins(res.filter((u) => staffRoles.includes(u.role)));
    } catch (e: any) {
      showToast(e?.message || 'Network error: Failed to fetch staff team list', 'error');
    }
  };

  const loadDashboardMetrics = async () => {
    try {
      const summary = await dashboardServiceAPI.getSummary();
      setDashboardSummary(summary);
    } catch (e: any) {
      showToast(e?.message || 'Network error: Unable to load dashboard analytics', 'error');
    }
  };

  const loadProducts = async () => {
    try {
      const res = await productServiceAPI.getProducts();
      setProducts(res.items);
    } catch (e: any) {
      showToast(e?.message || 'Network error: Unable to load product catalog', 'error');
    }
  };

  const loadOrders = async () => {
    try {
      const ords = await orderServiceAPI.getOrders();
      setOrders(ords);
    } catch (e: any) {
      showToast(e?.message || 'Network error: Unable to fetch customer orders', 'error');
    }
  };

  // Auth Action handlers
  const handleLogin = async (email: string, password: string) => {
    try {
      const data = await authServiceAPI.login(email, password);
      const staffRoles = ['super_admin', 'admin', 'catalog_manager', 'order_manager', 'support_agent', 'staff'];
      if (!staffRoles.includes(data.user.role)) {
        throw new Error('Not authorized to access the Admin Console');
      }
      setAuth(data.accessToken, data.refreshToken, data.user);
      setUser(data.user);
      showToast(`Welcome back, ${data.user.fullName || 'Admin'}!`, 'success');
    } catch (e: any) {
      showToast(e?.message || 'Authentication failed. Please check credentials.', 'error');
      throw e;
    }
  };

  const handleLogout = async () => {
    const confirmed = await requestConfirmation({
      title: 'Sign Out Confirmation',
      message: 'Are you sure you want to log out of the Admin Console?',
      confirmText: 'Sign Out',
      variant: 'warning',
    });

    if (!confirmed) return;

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
    showToast('Logged out successfully', 'info');
  };

  // User Management actions
  const handleUserSubmit = async (formData: any) => {
    try {
      if (editingUser) {
        await userServiceAPI.updateUser(editingUser.id, formData);
        showToast('User account updated successfully!', 'success');
      } else {
        await userServiceAPI.createUser(formData);
        showToast('New user created successfully!', 'success');
      }
      setIsUserModalOpen(false);
      setEditingUser(null);
      loadCustomers();
      loadAdmins();
      loadDashboardMetrics();
    } catch (e: any) {
      showToast(e?.message || 'Failed to save user account', 'error');
    }
  };

  const handleDeleteUser = async (id: string) => {
    const confirmed = await requestConfirmation({
      title: 'Delete User Account',
      message: 'Are you sure you want to permanently delete this user account? This action cannot be undone.',
      confirmText: 'Delete User',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      const res = await userServiceAPI.deleteUser(id);
      showToast(res.message || 'User deleted successfully', 'success');
      loadCustomers();
      loadAdmins();
      loadDashboardMetrics();
    } catch (e: any) {
      showToast(e?.message || 'Failed to delete user account', 'error');
    }
  };

  const handleToggleUserActive = async (targetUser: User) => {
    const actionText = targetUser.isActive ? 'Deactivate' : 'Activate';
    const confirmed = await requestConfirmation({
      title: `${actionText} User Account`,
      message: `Are you sure you want to ${actionText.toLowerCase()} user "${targetUser.fullName || targetUser.email}"?`,
      confirmText: actionText,
      variant: targetUser.isActive ? 'warning' : 'success',
    });

    if (!confirmed) return;

    try {
      await userServiceAPI.updateUser(targetUser.id, {
        isActive: !targetUser.isActive,
      });
      showToast(`User status updated to ${!targetUser.isActive ? 'Active' : 'Deactivated'}`, 'success');
      loadCustomers();
      loadAdmins();
      loadDashboardMetrics();
    } catch (e: any) {
      showToast(e?.message || 'Failed to update user status', 'error');
    }
  };

  // Product actions
  const handleProductSubmit = async (formData: any) => {
    try {
      if (editingProduct) {
        await productServiceAPI.updateProduct(editingProduct.id, formData);
        showToast(`Product "${formData.name || editingProduct.name}" updated successfully!`, 'success');
      } else {
        await productServiceAPI.createProduct(formData);
        showToast(`New product "${formData.name}" created successfully!`, 'success');
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
      loadProducts();
      loadDashboardMetrics();
    } catch (e: any) {
      showToast(e?.message || 'Failed to save product details', 'error');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const confirmed = await requestConfirmation({
      title: 'Delete Product Listing',
      message: 'Are you sure you want to delete or deactivate this product from the catalog?',
      confirmText: 'Delete Product',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      const res = await productServiceAPI.deleteProduct(id);
      showToast(res.message || 'Product deleted from catalog', 'success');
      loadProducts();
      loadDashboardMetrics();
    } catch (e: any) {
      showToast(e?.message || 'Failed to delete product', 'error');
    }
  };

  // Category actions
  const handleCreateCategory = async (name: string, slug: string, parentId?: string) => {
    try {
      await productServiceAPI.createCategory(name, slug, parentId);
      showToast(`Category "${name}" created successfully!`, 'success');
      detectFeaturesAndLoad();
    } catch (e: any) {
      showToast(e?.message || 'Failed to create category', 'error');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const confirmed = await requestConfirmation({
      title: 'Delete Category',
      message: 'Are you sure you want to delete this category? Associated product parent links will be cleared.',
      confirmText: 'Delete Category',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      await productServiceAPI.deleteCategory(id);
      showToast('Category deleted successfully', 'success');
      detectFeaturesAndLoad();
      loadProducts();
    } catch (e: any) {
      showToast(e?.message || 'Failed to delete category', 'error');
    }
  };

  // Order actions
  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await orderServiceAPI.updateOrderStatus(orderId, status);
      showToast(`Order status updated to ${status.toUpperCase()}`, 'success');
      loadOrders();
      loadDashboardMetrics();
    } catch (e: any) {
      showToast(e?.message || 'Failed to update order status', 'error');
    }
  };

  const handleUpdateOrderPayment = async (orderId: string, paymentStatus: string) => {
    try {
      await orderServiceAPI.updateOrderPayment(orderId, paymentStatus);
      showToast(`Payment status updated to ${paymentStatus.toUpperCase()}`, 'success');
      loadOrders();
      loadDashboardMetrics();
    } catch (e: any) {
      showToast(e?.message || 'Failed to update payment status', 'error');
    }
  };

  // Stock management actions (from GRN / PRN)
  const handleUpdateStock = async (productId: string, newStock: number) => {
    try {
      await productServiceAPI.updateProduct(productId, {
        stockQuantity: newStock,
      });
      showToast(`Inventory stock quantity updated to ${newStock}`, 'success');
      loadProducts();
      loadDashboardMetrics();
    } catch (e: any) {
      showToast(e?.message || 'Failed to update stock quantity', 'error');
    }
  };

  const handleToggleProductActive = async (product: Product) => {
    try {
      await productServiceAPI.updateProduct(product.id, {
        isActive: !product.isActive,
      });
      showToast(
        `Product "${product.name}" is now ${!product.isActive ? 'Active (Visible)' : 'Disabled'}`,
        'success'
      );
      loadProducts();
      loadDashboardMetrics();
    } catch (e: any) {
      showToast(e?.message || 'Failed to toggle product status', 'error');
    }
  };

  return (
    <AdminContext.Provider
      value={{
        theme,
        setTheme,
        user,
        setUser,
        toasts,
        showToast,
        removeToast,
        requestConfirmation,
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
      {/* Toast Alert Notification Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Customized Confirmation Popup Dialog */}
      <ConfirmModal
        isOpen={confirmModalState.isOpen}
        title={confirmModalState.options.title}
        message={confirmModalState.options.message}
        confirmText={confirmModalState.options.confirmText}
        cancelText={confirmModalState.options.cancelText}
        variant={confirmModalState.options.variant}
        onConfirm={() => handleConfirmModalResponse(true)}
        onCancel={() => handleConfirmModalResponse(false)}
      />
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
