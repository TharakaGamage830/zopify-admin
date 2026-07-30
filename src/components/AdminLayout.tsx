import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { ProductFormModal } from './modals/ProductFormModal';
import { UserFormModal } from './modals/UserFormModal';
import { ProfileModal } from './modals/ProfileModal';

export const AdminLayout: React.FC = () => {
  const admin = useAdmin();

  if (!admin.user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-dominant-dark transition-colors duration-300 text-slate-800 dark:text-slate-200 overflow-hidden">
      {/* Navbar */}
      <Navbar
        user={admin.user}
        theme={admin.theme}
        setTheme={admin.setTheme}
        onLogout={admin.handleLogout}
        onOpenProfile={() => admin.setIsProfileModalOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar showCategoryTab={admin.features.category} />

        {/* Content Area */}
        <main
          className={`flex-grow p-8 bg-slate-50 dark:bg-dominant-dark max-w-7xl mx-auto w-full ${
            admin.isProductModalOpen || admin.isUserModalOpen ? 'overflow-hidden' : 'overflow-y-auto'
          }`}
        >
          <Outlet />
        </main>
      </div>

      {/* Product creation modal */}
      <ProductFormModal
        isOpen={admin.isProductModalOpen}
        product={admin.editingProduct}
        categories={admin.categories}
        products={admin.products}
        onClose={() => {
          admin.setIsProductModalOpen(false);
          admin.setEditingProduct(null);
        }}
        onSubmit={admin.handleProductSubmit}
      />

      {/* User creation/edit modal */}
      <UserFormModal
        isOpen={admin.isUserModalOpen}
        user={admin.editingUser}
        mode={admin.userModalMode}
        onClose={() => {
          admin.setIsUserModalOpen(false);
          admin.setEditingUser(null);
        }}
        onSubmit={admin.handleUserSubmit}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={admin.isProfileModalOpen}
        user={admin.user}
        onClose={() => admin.setIsProfileModalOpen(false)}
        onProfileUpdated={(updatedUser) => {
          admin.setUser(updatedUser);
          localStorage.setItem('admin_user', JSON.stringify(updatedUser));
        }}
      />
    </div>
  );
};
