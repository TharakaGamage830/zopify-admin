import { useState, useEffect } from 'react';
import { setAuth, clearAuth, getUser } from './services/api';
import type { Product, Category, Order, DashboardSummary } from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { OrdersPage } from './pages/OrdersPage';
import { GRNPage } from './pages/GRNPage';
import { PRNPage } from './pages/PRNPage';
import { AuthPage } from './pages/AuthPage';
import { ProductFormModal } from './components/modals/ProductFormModal';

// User Management Pages & Modals
import { CustomersPage } from './pages/CustomersPage';
import { AdminsPage } from './pages/AdminsPage';
import { UserFormModal } from './components/modals/UserFormModal';
import { ProfileModal } from './components/modals/ProfileModal';

// Import isolated domain service API layers for admin console
import { authServiceAPI } from './services/authServiceAPI';
import { productServiceAPI } from './services/productServiceAPI';
import { orderServiceAPI } from './services/orderServiceAPI';
import { dashboardServiceAPI } from './services/dashboardServiceAPI';
import { userServiceAPI } from './services/userServiceAPI';
import type { User } from './services/userServiceAPI';

function App() {
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('admin_theme') as 'light' | 'dark') || 'light'
  );

  // App Navigation States
  const [user, setUser] = useState<any>(getUser());
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'products' | 'categories' | 'orders' | 'grn' | 'prn' | 'customers' | 'admins'>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.slice(1);
      if (['dashboard', 'products', 'categories', 'orders', 'grn', 'prn', 'customers', 'admins'].includes(hash)) {
        return hash as any;
      }
    }
    return 'dashboard';
  });

  // Sync currentTab -> window.location.hash
  useEffect(() => {
    if (user) {
      window.location.hash = currentTab;
    }
  }, [currentTab, user]);

  // Sync window.location.hash -> currentTab (back/forward history support)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (['dashboard', 'products', 'categories', 'orders', 'grn', 'prn', 'customers', 'admins'].includes(hash)) {
        setCurrentTab(hash as any);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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
    // 1. Detect Category module
    try {
      const cats = await productServiceAPI.getCategories();
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
      const resAdmins = await userServiceAPI.getUsers('admin');
      const resStaff = await userServiceAPI.getUsers('staff');
      setAdmins([...resAdmins, ...resStaff]);
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
    if (!['admin', 'staff'].includes(data.user.role)) {
      throw new Error('Not authorized to access the Admin Console');
    }
    setAuth(data.accessToken, data.refreshToken, data.user);
    setUser(data.user);
    setCurrentTab('dashboard');
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
      stockQuantity: newStock
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

  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-dominant-dark transition-colors duration-300 text-slate-800 dark:text-slate-200 overflow-hidden">
      {/* Navbar */}
      <Navbar
        user={user}
        theme={theme}
        setTheme={setTheme}
        onLogout={handleLogout}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          showCategoryTab={features.category}
        />

        {/* Content Area */}
        <main className={`flex-grow p-8 bg-slate-50 dark:bg-dominant-dark max-w-7xl mx-auto w-full ${isProductModalOpen || isUserModalOpen ? 'overflow-hidden' : 'overflow-y-auto'}`}>
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
              onToggleActive={handleToggleProductActive}
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

          {currentTab === 'grn' && (
            <GRNPage
              products={products}
              onUpdateStock={handleUpdateStock}
            />
          )}

          {currentTab === 'prn' && (
            <PRNPage
              orders={orders}
              products={products}
              onUpdateStock={handleUpdateStock}
            />
          )}

          {currentTab === 'customers' && (
            <CustomersPage
              customers={customers}
              onOpenCreateModal={() => {
                setEditingUser(null);
                setUserModalMode('customer');
                setIsUserModalOpen(true);
              }}
              onEdit={(u) => {
                setEditingUser(u);
                setUserModalMode('customer');
                setIsUserModalOpen(true);
              }}
              onDelete={handleDeleteUser}
              onToggleActive={handleToggleUserActive}
            />
          )}

          {currentTab === 'admins' && (
            <AdminsPage
              admins={admins}
              onOpenCreateModal={() => {
                setEditingUser(null);
                setUserModalMode('admin');
                setIsUserModalOpen(true);
              }}
              onEdit={(u) => {
                setEditingUser(u);
                setUserModalMode('admin');
                setIsUserModalOpen(true);
              }}
              onDelete={handleDeleteUser}
              onToggleActive={handleToggleUserActive}
            />
          )}
        </main>
      </div>

      {/* Product creation modal */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        product={editingProduct}
        categories={categories}
        products={products}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleProductSubmit}
      />

      {/* User creation/edit modal */}
      <UserFormModal
        isOpen={isUserModalOpen}
        user={editingUser}
        mode={userModalMode}
        onClose={() => {
          setIsUserModalOpen(false);
          setEditingUser(null);
        }}
        onSubmit={handleUserSubmit}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        user={user}
        onClose={() => setIsProfileModalOpen(false)}
        onProfileUpdated={(updatedUser) => {
          setUser(updatedUser);
          localStorage.setItem('admin_user', JSON.stringify(updatedUser));
        }}
      />
    </div>
  );
}

export default App;
