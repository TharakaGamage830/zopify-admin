import React, { useState, useEffect } from 'react';
import { Star, Trash2, RefreshCw, MessageSquare, Filter } from 'lucide-react';
import { reviewServiceAPI } from '../services/reviewServiceAPI';
import { productServiceAPI } from '../services/productServiceAPI';
import type { Review, Product } from '../types';

export const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<(Review & { productTitle?: string })[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const fetchProductsAndReviews = async () => {
    setLoading(true);
    try {
      const prodRes = await productServiceAPI.getProducts();
      const allProds = prodRes.items || [];
      setProducts(allProds);

      let aggregatedReviews: (Review & { productTitle?: string })[] = [];

      // Fetch reviews for products
      for (const prod of allProds.slice(0, 20)) {
        try {
          const revs = await reviewServiceAPI.getProductReviews(prod.id);
          const mapped = revs.map((r) => ({ ...r, productTitle: prod.name }));
          aggregatedReviews = [...aggregatedReviews, ...mapped];
        } catch (e) {}
      }

      setReviews(aggregatedReviews);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsAndReviews();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer review?')) return;
    try {
      await reviewServiceAPI.deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete review');
    }
  };

  const filteredReviews = selectedProductId === 'all'
    ? reviews
    : reviews.filter((r) => r.productId === selectedProductId);

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-200 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-accent" />
            Customer Reviews Moderation
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Monitor and moderate user feedback and product ratings.
          </p>
        </div>
        <button
          onClick={fetchProductsAndReviews}
          disabled={loading}
          className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 bg-white dark:bg-cardbg-dark p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
        <Filter className="w-4 h-4 text-slate-400" />
        <span className="font-semibold text-slate-700 dark:text-slate-300">Filter Product:</span>
        <select
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
        >
          <option value="all">All Products</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <span className="ml-auto text-slate-400">
          Showing <strong>{filteredReviews.length}</strong> reviews
        </span>
      </div>

      {/* Reviews Table */}
      <div className="bg-white dark:bg-cardbg-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex justify-center items-center gap-2">
            <RefreshCw className="animate-spin w-5 h-5 text-accent" />
            Loading product reviews...
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-40 text-accent" />
            No customer reviews found for the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800 tracking-wider">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Comment</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                      {review.productTitle || review.productId.substring(0, 8)}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {review.user?.fullName || 'Anonymous Customer'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}`}
                          />
                        ))}
                        <span className="font-semibold ml-1 text-slate-700 dark:text-slate-300 text-xs">{review.rating}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 max-w-sm">
                      {review.comment || <em className="text-slate-400">No written comment</em>}
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
