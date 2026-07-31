import React, { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Edit, RefreshCw, CheckCircle, XCircle, Globe, X } from 'lucide-react';
import { cmsServiceAPI } from '../services/cmsServiceAPI';
import type { CmsPage } from '../types';
import { useAdmin } from '../context/AdminContext';

export const CmsAdminPage: React.FC = () => {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<CmsPage | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<'page' | 'banner' | 'faq'>('page');
  const [sortOrder, setSortOrder] = useState('0');
  const [imageUrl, setImageUrl] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const data = await cmsServiceAPI.getPages(true);
      setPages(data || []);
    } catch (err) {
      console.error('Failed to fetch CMS pages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const openCreateModal = () => {
    setEditingPage(null);
    setTitle('');
    setSlug('');
    setContent('');
    setType('page');
    setSortOrder('0');
    setImageUrl('');
    setIsPublished(true);
    setIsModalOpen(true);
  };

  const openEditModal = (page: CmsPage) => {
    setEditingPage(page);
    setTitle(page.title);
    setSlug(page.slug);
    setContent(page.content);
    setType(page.type);
    setSortOrder(String(page.sortOrder));
    setImageUrl(page.imageUrl || '');
    setIsPublished(page.isPublished);
    setIsModalOpen(true);
  };

  const { showToast, requestConfirmation } = useAdmin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title,
        slug: slug || title.toLowerCase().replace(/\s+/g, '-'),
        content,
        type,
        sortOrder: parseInt(sortOrder, 10),
        imageUrl: imageUrl || undefined,
        isPublished,
      };

      if (editingPage) {
        await cmsServiceAPI.updatePage(editingPage.id, payload);
        showToast(`CMS page "${title}" updated successfully!`, 'success');
      } else {
        await cmsServiceAPI.createPage(payload);
        showToast(`New CMS page "${title}" created!`, 'success');
      }

      setIsModalOpen(false);
      fetchPages();
    } catch (err: any) {
      showToast(err.message || 'Failed to save page', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await requestConfirmation({
      title: 'Delete CMS Page',
      message: 'Are you sure you want to delete this CMS content page?',
      confirmText: 'Delete Page',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      await cmsServiceAPI.deletePage(id);
      showToast('CMS page deleted successfully', 'success');
      fetchPages();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete page', 'error');
    }
  };

  const handleTogglePublished = async (page: CmsPage) => {
    try {
      await cmsServiceAPI.updatePage(page.id, { isPublished: !page.isPublished });
      showToast(`Page "${page.title}" is now ${!page.isPublished ? 'Published' : 'Draft'}`, 'success');
      fetchPages();
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle publish status', 'error');
    }
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-200 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <FileText className="w-6 h-6 text-accent" />
            CMS Page Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Create custom informational pages, FAQs, and footer content blocks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchPages}
            disabled={loading}
            className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-accent hover:bg-accent-hover text-white shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create CMS Page
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-cardbg-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex justify-center items-center gap-2">
            <RefreshCw className="animate-spin w-5 h-5 text-accent" />
            Loading CMS pages...
          </div>
        ) : pages.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Globe className="w-10 h-10 mx-auto mb-2 opacity-40 text-accent" />
            No CMS pages found. Click "Create CMS Page" to add Privacy Policies, Terms, FAQs etc.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800 tracking-wider">
                <tr>
                  <th className="px-4 py-3">Page Title</th>
                  <th className="px-4 py-3">URL Slug</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Sort Order</th>
                  <th className="px-4 py-3">Published</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {pages.map((page) => (
                  <tr key={page.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                      {page.title}
                    </td>
                    <td className="px-4 py-3 font-mono text-accent">
                      /{page.slug}
                    </td>
                    <td className="px-4 py-3 capitalize text-slate-600 dark:text-slate-400">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">
                        {page.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {page.sortOrder}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleTogglePublished(page)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all ${
                          page.isPublished
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                        }`}
                      >
                        {page.isPublished ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {page.isPublished ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(page)}
                          className="p-1.5 text-slate-400 hover:text-accent rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(page.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overscroll-contain animate-in fade-in duration-150"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-cardbg-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 text-left relative animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                {editingPage ? 'Edit CMS Page' : 'Create CMS Page'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg transition cursor-pointer"
                title="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!editingPage) {
                      setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
                    }
                  }}
                  placeholder="e.g. Terms and Conditions"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Slug *</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="terms-and-conditions"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  >
                    <option value="page">Standard Page</option>
                    <option value="faq">FAQ Entry</option>
                    <option value="banner">Banner Block</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Header Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Page Body Content (Markdown/HTML) *</label>
                <textarea
                  rows={6}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Full text content for the page..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="cmsPublished"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="rounded border-slate-300 text-accent focus:ring-accent"
                />
                <label htmlFor="cmsPublished" className="font-medium text-slate-700 dark:text-slate-300">
                  Publish to storefront
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white font-medium shadow-sm"
                >
                  {editingPage ? 'Save Changes' : 'Create Page'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
