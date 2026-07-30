import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { AdminLayout } from './components/AdminLayout';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { OrdersPage } from './pages/OrdersPage';
import { GRNPage } from './pages/GRNPage';
import { PRNPage } from './pages/PRNPage';
import { AuthPage } from './pages/AuthPage';
import { CustomersPage } from './pages/CustomersPage';
import { AdminsPage } from './pages/AdminsPage';

// New Admin Modules
import { CouponsPage } from './pages/CouponsPage';
import { OffersPage } from './pages/OffersPage';
import { PackagesPage } from './pages/PackagesPage';
import { BannersPage } from './pages/BannersPage';
import { ShippingZonesPage } from './pages/ShippingZonesPage';
import { CmsAdminPage } from './pages/CmsAdminPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { RefundsPage } from './pages/RefundsPage';
import { AuditLogPage } from './pages/AuditLogPage';

const AuthRoute: React.FC = () => {
  const admin = useAdmin();
  const navigate = useNavigate();

  if (admin.user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (email: string, pass: string) => {
    await admin.handleLogin(email, pass);
    navigate('/');
  };

  return <AuthPage onLogin={handleLogin} />;
};

const DashboardRoute: React.FC = () => {
  const admin = useAdmin();
  return (
    <DashboardPage
      summary={admin.dashboardSummary}
      productCount={admin.products.length}
    />
  );
};

const ProductsRoute: React.FC = () => {
  const admin = useAdmin();
  return (
    <ProductsPage
      products={admin.products}
      categories={admin.categories}
      onOpenCreateModal={() => {
        admin.setEditingProduct(null);
        admin.setIsProductModalOpen(true);
      }}
      onEdit={(prod) => {
        admin.setEditingProduct(prod);
        admin.setIsProductModalOpen(true);
      }}
      onDelete={admin.handleDeleteProduct}
      onToggleActive={admin.handleToggleProductActive}
    />
  );
};

const CategoriesRoute: React.FC = () => {
  const admin = useAdmin();
  return (
    <CategoriesPage
      categories={admin.categories}
      onCreate={admin.handleCreateCategory}
      onDelete={admin.handleDeleteCategory}
    />
  );
};

const OrdersRoute: React.FC = () => {
  const admin = useAdmin();
  return (
    <OrdersPage
      orders={admin.orders}
      onUpdateStatus={admin.handleUpdateOrderStatus}
      onUpdatePayment={admin.handleUpdateOrderPayment}
    />
  );
};

const GRNRoute: React.FC = () => {
  const admin = useAdmin();
  return (
    <GRNPage
      products={admin.products}
      onUpdateStock={admin.handleUpdateStock}
    />
  );
};

const PRNRoute: React.FC = () => {
  const admin = useAdmin();
  return (
    <PRNPage
      orders={admin.orders}
      products={admin.products}
      onUpdateStock={admin.handleUpdateStock}
    />
  );
};

const CustomersRoute: React.FC = () => {
  const admin = useAdmin();
  return (
    <CustomersPage
      customers={admin.customers}
      onOpenCreateModal={() => {
        admin.setEditingUser(null);
        admin.setUserModalMode('customer');
        admin.setIsUserModalOpen(true);
      }}
      onEdit={(u) => {
        admin.setEditingUser(u);
        admin.setUserModalMode('customer');
        admin.setIsUserModalOpen(true);
      }}
      onDelete={admin.handleDeleteUser}
      onToggleActive={admin.handleToggleUserActive}
    />
  );
};

const AdminsRoute: React.FC = () => {
  const admin = useAdmin();
  return (
    <AdminsPage
      admins={admin.admins}
      onOpenCreateModal={() => {
        admin.setEditingUser(null);
        admin.setUserModalMode('admin');
        admin.setIsUserModalOpen(true);
      }}
      onEdit={(u) => {
        admin.setEditingUser(u);
        admin.setUserModalMode('admin');
        admin.setIsUserModalOpen(true);
      }}
      onDelete={admin.handleDeleteUser}
      onToggleActive={admin.handleToggleUserActive}
    />
  );
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthRoute />} />
      <Route element={<AdminLayout />}>
        <Route path="/" element={<DashboardRoute />} />
        <Route path="/dashboard" element={<DashboardRoute />} />
        <Route path="/products" element={<ProductsRoute />} />
        <Route path="/categories" element={<CategoriesRoute />} />
        <Route path="/orders" element={<OrdersRoute />} />
        <Route path="/grn" element={<GRNRoute />} />
        <Route path="/prn" element={<PRNRoute />} />
        <Route path="/customers" element={<CustomersRoute />} />
        <Route path="/admins" element={<AdminsRoute />} />

        {/* New Module Routes */}
        <Route path="/coupons" element={<CouponsPage />} />
        <Route path="/offers" element={<OffersPage />} />
        <Route path="/packages" element={<PackagesPage />} />
        <Route path="/banners" element={<BannersPage />} />
        <Route path="/shipping-zones" element={<ShippingZonesPage />} />
        <Route path="/cms-pages" element={<CmsAdminPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="/refunds" element={<RefundsPage />} />
        <Route path="/audit-logs" element={<AuditLogPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AdminProvider>
        <AppRoutes />
      </AdminProvider>
    </BrowserRouter>
  );
}

export default App;
