import { useState, useEffect } from 'react';
import { api, setAuth, clearAuth, getUser } from './services/api';
import type { Product, Category, Order, DashboardSummary } from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { OrdersPage } from './pages/OrdersPage';
import { AuthPage } from './pages/AuthPage';
import { ProductFormModal } from './components/modals/ProductFormModal';

function App() {
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('admin_theme') as 'light' | 'dark') || 'light'
  );

  // App Navigation States
  const [user, setUser] = useState<any>(getUser());
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'products' | 'categories' | 'orders'>('dashboard');

  // Feature support detection
  const [features, setFeatures] = useState({
    category: true,
  });

  // Admin Data states
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Modal Control states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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
    // 1. Detect Category module
    try {
      const cats = await api.get<Category[]>('/categories');
      setCategories(cats);
      setFeatures((f) => ({ ...f, category: true }));
    } catch (e: any) {
      if (e.statusCode === 404) {
        setFeatures((f) => ({ ...f, category: false }));
        if (currentTab === 'categories') {
          setCurrentTab('dashboard');
        }
      }
    }

    // 2. Load metrics, products, and orders list
    loadDashboardMetrics();
    loadProducts();
    loadOrders();
  };

  const loadDashboardMetrics = async () => {
    try {
      const summary = await api.get<DashboardSummary>('/dashboard/summary');
      setDashboardSummary(summary);
    } catch (e) {
      console.error('Error fetching analytics dashboard:', e);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await api.get('/products?limit=100');
      setProducts(res.items);
    } catch (e) {
      console.error('Error fetching products:', e);
    }
  };

  const loadOrders = async () => {
    try {
      const ords = await api.get<Order[]>('/orders');
      setOrders(ords);
    } catch (e) {
      console.error('Error fetching orders:', e);
    }
  };

  // Auth Action handlers
  const handleLogin = async (email: string, password: string) => {
    const data = await api.post('/auth/login', { email, password });
    if (!['admin', 'staff'].includes(data.user.role)) {
      throw new Error('Not authorized to access the Admin Console');
    }
    setAuth(data.accessToken, data.refreshToken, data.user);
    setUser(data.user);
    setCurrentTab('dashboard');
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout', { refreshToken: localStorage.getItem('admin_refreshToken') });
    } catch (e) {}
    clearAuth();
    setUser(null);
    setDashboardSummary(null);
    setProducts([]);
    setCategories([]);
    setOrders([]);
  };

  // Product actions
  const handleProductSubmit = async (formData: any) => {
    try {
      if (editingProduct) {
        await api.patch(`/products/${editingProduct.id}`, formData);
        alert('Product updated successfully');
      } else {
        await api.post('/products', formData);
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
      const res = await api.delete(`/products/${id}`);
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
      await api.post('/categories', { name, slug, parentId });
      alert('Category created successfully');
      detectFeaturesAndLoad();
    } catch (e: any) {
      alert(e.message || 'Failed to create category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete category? Parent associations will be unlinked.')) return;
    try {
      await api.delete(`/categories/${id}`);
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
      await api.patch(`/orders/${orderId}/status`, { status });
      alert('Order status updated');
      loadOrders();
      loadDashboardMetrics();
    } catch (e: any) {
      alert(e.message || 'Failed to update order status');
    }
  };

  const handleUpdateOrderPayment = async (orderId: string, paymentStatus: string) => {
    try {
      await api.patch(`/orders/${orderId}/payment`, { paymentStatus });
      alert('Payment status updated');
      loadOrders();
      loadDashboardMetrics();
    } catch (e: any) {
      alert(e.message || 'Failed to update payment status');
    }
  };

  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dominant-dark transition-colors duration-300 text-slate-800 dark:text-slate-200">
      {/* Navbar */}
      <Navbar
        user={user}
        theme={theme}
        setTheme={setTheme}
        onLogout={handleLogout}
      />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          showCategoryTab={features.category}
        />

        {/* Content Area */}
        <main className="flex-grow p-8 bg-slate-50 dark:bg-dominant-dark max-w-7xl mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardPage
              summary={dashboardSummary}
              productCount={products.length}
            />
          )}

          {currentTab === 'products' && (
            <ProductsPage
              products={products}
              categories={categories}
              onOpenCreateModal={() => {
                setEditingProduct(null);
                setIsProductModalOpen(true);
              }}
              onEdit={(prod) => {
                setEditingProduct(prod);
                setIsProductModalOpen(true);
              }}
              onDelete={handleDeleteProduct}
            />
          )}

          {currentTab === 'categories' && (
            <CategoriesPage
              categories={categories}
              onCreate={handleCreateCategory}
              onDelete={handleDeleteCategory}
            />
          )}

          {currentTab === 'orders' && (
            <OrdersPage
              orders={orders}
              onUpdateStatus={handleUpdateOrderStatus}
              onUpdatePayment={handleUpdateOrderPayment}
            />
          )}
        </main>
      </div>

      {/* Product creation modal */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        product={editingProduct}
        categories={categories}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleProductSubmit}
      />
    </div>
  );
}

export default App;
