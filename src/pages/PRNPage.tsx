import React, { useState, useEffect } from 'react';
import type { Order, Product } from '../types';
import { Plus, X, Search, FileSpreadsheet, RefreshCcw, ArrowLeftRight } from 'lucide-react';

interface PRNItem {
  productId: string;
  name: string;
  quantity: number;
}

interface PRN {
  id: string;
  orderId: string;
  customerName: string;
  returnDate: string;
  reason: string;
  action: 'Refund' | 'Replace' | 'Return to Inventory';
  status: 'Requested' | 'Processed' | 'Rejected';
  items: PRNItem[];
  notes?: string;
}

interface PRNPageProps {
  orders: Order[];
  products: Product[];
  onUpdateStock: (productId: string, newStock: number) => Promise<void>;
}

export const PRNPage: React.FC<PRNPageProps> = ({ orders, products, onUpdateStock }) => {
  const [prns, setPrns] = useState<PRN[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPrn, setSelectedPrn] = useState<PRN | null>(null);

  // Form states
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [reason, setReason] = useState('Defective');
  const [action, setAction] = useState<'Refund' | 'Replace' | 'Return to Inventory'>('Return to Inventory');
  const [notes, setNotes] = useState('');
  const [prnItems, setPrnItems] = useState<PRNItem[]>([]);
  
  // Helpers for item selection
  const [selectedOrderItems, setSelectedOrderItems] = useState<any[]>([]);
  const [currentProductId, setCurrentProductId] = useState('');
  const [currentQty, setCurrentQty] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  // Load PRNs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('zopify_prns');
    if (saved) {
      setPrns(JSON.parse(saved));
    } else {
      const dummy: PRN[] = [
        {
          id: 'PRN-20260720-001',
          orderId: orders[0]?.id || 'order-123',
          customerName: orders[0]?.user?.fullName || 'Anura Wijesinghe',
          returnDate: new Date().toISOString().split('T')[0],
          reason: 'Defective Key Caps',
          action: 'Return to Inventory',
          status: 'Processed',
          notes: 'Customer returned because the spacebar stabilizer was loose. Returned to refurbish inventory.',
          items: [
            {
              productId: products[0]?.id || 'dummy-p-1',
              name: products[0]?.name || 'Ultra Mechanical Keyboard v4',
              quantity: 1
            }
          ]
        }
      ];
      setPrns(dummy);
      localStorage.setItem('zopify_prns', JSON.stringify(dummy));
    }
  }, [orders, products]);

  // Lock background scroll when modal is open
  useEffect(() => {
    const mainEl = document.querySelector('main');
    if (mainEl) {
      if (isModalOpen || selectedPrn) {
        mainEl.style.overflow = 'hidden';
      } else {
        mainEl.style.overflow = '';
      }
    }
    return () => {
      if (mainEl) mainEl.style.overflow = '';
    };
  }, [isModalOpen, selectedPrn]);

  // Sync available items when order selection changes
  useEffect(() => {
    if (selectedOrderId) {
      const order = orders.find((o) => o.id === selectedOrderId);
      if (order && order.items) {
        setSelectedOrderItems(order.items);
      } else {
        setSelectedOrderItems([]);
      }
    } else {
      setSelectedOrderItems([]);
    }
    setPrnItems([]);
    setCurrentProductId('');
    setCurrentQty(1);
  }, [selectedOrderId, orders]);

  const handleAddItem = () => {
    if (!currentProductId) return;
    const orderItem = selectedOrderItems.find((i) => i.productId === currentProductId);
    if (!orderItem) return;

    // Check cap quantity
    const maxQty = orderItem.quantity;
    if (currentQty > maxQty) {
      alert(`Cannot return more than purchased (${maxQty} units).`);
      return;
    }

    // Check if item already exists in form
    const existingIndex = prnItems.findIndex((item) => item.productId === currentProductId);
    if (existingIndex >= 0) {
      const updated = [...prnItems];
      const newQty = updated[existingIndex].quantity + currentQty;
      if (newQty > maxQty) {
        alert(`Total return quantity cannot exceed purchased count (${maxQty} units).`);
        return;
      }
      updated[existingIndex].quantity = newQty;
      setPrnItems(updated);
    } else {
      setPrnItems([
        ...prnItems,
        {
          productId: currentProductId,
          name: orderItem.product?.name || 'Selected Item',
          quantity: currentQty
        }
      ]);
    }

    setCurrentProductId('');
    setCurrentQty(1);
  };

  const handleRemoveItem = (index: number) => {
    setPrnItems(prnItems.filter((_, i) => i !== index));
  };

  const handleCreatePRN = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prnItems.length === 0) {
      alert('Please add at least one product item to return.');
      return;
    }

    setLoading(true);
    try {
      const order = orders.find((o) => o.id === selectedOrderId);
      const customerName = order?.user?.fullName || 'Walk-in Customer';

      // 1. If returning to inventory, update database stock
      if (action === 'Return to Inventory') {
        for (const item of prnItems) {
          const prod = products.find((p) => p.id === item.productId);
          if (prod) {
            const newStock = prod.stockQuantity + item.quantity;
            await onUpdateStock(item.productId, newStock);
          }
        }
      }

      // 2. Generate PRN
      const idStr = `PRN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
      const newPrn: PRN = {
        id: idStr,
        orderId: selectedOrderId,
        customerName,
        returnDate: new Date().toISOString().split('T')[0],
        reason,
        action,
        status: 'Processed',
        notes,
        items: prnItems
      };

      // 3. Save locally
      const updatedPrns = [newPrn, ...prns];
      setPrns(updatedPrns);
      localStorage.setItem('zopify_prns', JSON.stringify(updatedPrns));

      // Reset
      setSelectedOrderId('');
      setReason('Defective');
      setAction('Return to Inventory');
      setNotes('');
      setPrnItems([]);
      setIsModalOpen(false);
      alert(`Product Return Note ${idStr} registered successfully. Stock updated accordingly!`);
    } catch (err: any) {
      console.error(err);
      alert('Failed to process return. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPrns = prns.filter(
    (p) =>
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.orderId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="text-left animate-in fade-in duration-200">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Product Return Notes (PRN)</h1>
          <p className="text-xs text-slate-400 mt-1">Manage product returns, document customer complaints, issue refunds, and restock inventory.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold py-2.5 px-4 rounded-lg shadow-sm transition active:scale-95 cursor-pointer"
        >
          <Plus size={16} />
          <span>Register Return</span>
        </button>
      </div>

      {/* Filter and search */}
      <div className="mb-6 relative max-w-sm">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
          <Search size={16} />
        </span>
        <input
          type="text"
          placeholder="Search by Return ID, Customer or Order..."
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-cardbg-dark text-slate-800 dark:text-slate-200 focus:outline-none focus:border-accent"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* PRN list table */}
      <div className="bg-white dark:bg-cardbg-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Return ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Return Date</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Action Taken</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-600 dark:text-slate-350">
              {filteredPrns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    No Product Return Notes found.
                  </td>
                </tr>
              ) : (
                filteredPrns.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">{p.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{p.customerName}</div>
                      <div className="text-[10px] text-slate-400">Order: {p.orderId.slice(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4">{p.returnDate}</td>
                    <td className="px-6 py-4">{p.reason}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                        p.action === 'Refund' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400' :
                        p.action === 'Replace' ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400' :
                        'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        <ArrowLeftRight size={10} />
                        {p.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedPrn(p)}
                        className="text-accent hover:text-accent-hover font-semibold text-xs transition cursor-pointer"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details View Modal */}
      {selectedPrn && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-cardbg-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150 text-left">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <FileSpreadsheet size={18} className="text-accent" />
                <span>PRN Details: {selectedPrn.id}</span>
              </h2>
              <button
                onClick={() => setSelectedPrn(null)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="block text-slate-400 font-semibold uppercase tracking-wider">Customer Name</span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1 block">{selectedPrn.customerName}</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-semibold uppercase tracking-wider">Return Date</span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1 block">{selectedPrn.returnDate}</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-semibold uppercase tracking-wider">Order Reference</span>
                  <span className="text-sm font-medium text-slate-500 mt-1 block select-all">{selectedPrn.orderId}</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-semibold uppercase tracking-wider">Action Taken</span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1 block">{selectedPrn.action}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
                <div>
                  <span className="block text-slate-400 font-semibold uppercase tracking-wider">Reason</span>
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-1 block">{selectedPrn.reason}</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-semibold uppercase tracking-wider">Status</span>
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1 block">{selectedPrn.status}</span>
                </div>
              </div>

              {selectedPrn.notes && (
                <div className="bg-slate-50 dark:bg-slate-800/30 p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 text-xs">
                  <span className="block text-slate-400 font-bold mb-1 uppercase tracking-wide">Inspection Notes</span>
                  <p className="text-slate-600 dark:text-slate-350">{selectedPrn.notes}</p>
                </div>
              )}

              {/* Items List */}
              <div>
                <span className="block text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Returned Items</span>
                <div className="border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-2">Product Name</th>
                        <th className="px-4 py-2 text-right">Quantity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-slate-600 dark:text-slate-300">
                      {selectedPrn.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2 font-medium text-slate-800 dark:text-slate-200">{item.name}</td>
                          <td className="px-4 py-2 text-right">{item.quantity} units</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Return Note Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-cardbg-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150 text-left">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <RefreshCcw size={18} className="text-accent" />
                <span>New Product Return Note</span>
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setPrnItems([]);
                  setSelectedOrderId('');
                }}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePRN} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Select Order ID</label>
                  <select
                    required
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-accent"
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                  >
                    <option value="">-- Choose Order --</option>
                    {orders.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.id.slice(0, 8)}... ({o.user?.fullName})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Action to Take</label>
                  <select
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-accent"
                    value={action}
                    onChange={(e) => setAction(e.target.value as any)}
                  >
                    <option value="Return to Inventory">Return to Inventory</option>
                    <option value="Refund">Issue Refund</option>
                    <option value="Replace">Provide Replacement</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Return Reason</label>
                  <select
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-accent"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  >
                    <option value="Defective">Defective Product</option>
                    <option value="Wrong Item">Wrong Product Sent</option>
                    <option value="Not as Described">Not as Described</option>
                    <option value="Damaged in Transit">Damaged in Transit</option>
                    <option value="Customer Mind Change">Customer Changed Mind</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Inspection Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Scratched casing, bad key..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-accent"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              {/* Add item interface (only enabled when order is selected) */}
              <div className={`border border-dashed border-slate-200 dark:border-slate-800 p-4 rounded-lg bg-slate-50/50 dark:bg-slate-900/10 ${!selectedOrderId ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}>
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Returning Items</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Product in Order</label>
                    <select
                      className="w-full px-2 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-accent"
                      value={currentProductId}
                      onChange={(e) => setCurrentProductId(e.target.value)}
                    >
                      <option value="">-- Choose Item --</option>
                      {selectedOrderItems.map((item) => (
                        <option key={item.productId} value={item.productId}>
                          {item.product?.name} (Bought: {item.quantity})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Return Quantity</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full px-2 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-accent"
                      value={currentQty}
                      onChange={(e) => setCurrentQty(parseInt(e.target.value, 10) || 1)}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  disabled={!currentProductId}
                  className="w-full flex items-center justify-center gap-1 bg-accent/10 border border-accent/20 hover:bg-accent/15 text-accent text-xs font-semibold py-1.5 px-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add Item to Return List</span>
                </button>
              </div>

              {/* Added items list */}
              {prnItems.length > 0 && (
                <div>
                  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Returning Items</span>
                  <div className="max-h-32 overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-lg bg-white dark:bg-cardbg-dark">
                    <ul className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                      {prnItems.map((item, index) => (
                        <li key={index} className="flex justify-between items-center p-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block">{item.name}</span>
                            <span className="text-[10px] text-slate-400 mt-0.5 block">
                              Returning: {item.quantity} units
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-500 hover:text-red-600 transition"
                          >
                            <X size={14} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setPrnItems([]);
                    setSelectedOrderId('');
                  }}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-850 rounded-lg text-sm text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || prnItems.length === 0}
                  className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-lg shadow-sm transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? 'Processing...' : 'Confirm Return Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
