import React, { useState, useEffect } from 'react';
import type { Product } from '../types';
import { useAdmin } from '../context/AdminContext';
import { Plus, X, Search, FileText, Truck } from 'lucide-react';

interface GRNItem {
  productId: string;
  name: string;
  quantity: number;
  unitCost: number;
}

interface GRN {
  id: string;
  supplierName: string;
  receiveDate: string;
  status: 'Received' | 'Inspected' | 'Pending Verification';
  items: GRNItem[];
  notes?: string;
  totalCost: number;
}

interface GRNPageProps {
  products: Product[];
  onUpdateStock: (productId: string, newStock: number) => Promise<void>;
}

export const GRNPage: React.FC<GRNPageProps> = ({ products, onUpdateStock }) => {
  const [grns, setGrns] = useState<GRN[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGrn, setSelectedGrn] = useState<GRN | null>(null);

  // Form states
  const [supplierName, setSupplierName] = useState('');
  const [notes, setNotes] = useState('');
  const [grnItems, setGrnItems] = useState<GRNItem[]>([]);
  const [currentProductId, setCurrentProductId] = useState('');
  const [currentQty, setCurrentQty] = useState<number>(1);
  const [currentCost, setCurrentCost] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // Load GRNs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('zopify_grns');
    if (saved) {
      setGrns(JSON.parse(saved));
    } else {
      const dummy: GRN[] = [
        {
          id: 'GRN-20260719-082',
          supplierName: 'Hardware Tech Distributors',
          receiveDate: new Date(Date.now() - 3600000 * 24).toISOString().split('T')[0],
          status: 'Received',
          notes: 'Initial delivery of newly launched accessories. All packaging intact.',
          totalCost: 1250.00,
          items: [
            {
              productId: products[0]?.id || 'dummy-p-1',
              name: products[0]?.name || 'Ultra Mechanical Keyboard v4',
              quantity: 25,
              unitCost: 50.00
            }
          ]
        }
      ];
      setGrns(dummy);
      localStorage.setItem('zopify_grns', JSON.stringify(dummy));
    }
  }, [products]);

  // Lock background scroll when modal is open
  useEffect(() => {
    const mainEl = document.querySelector('main');
    if (mainEl) {
      if (isModalOpen || selectedGrn) {
        mainEl.style.overflow = 'hidden';
      } else {
        mainEl.style.overflow = '';
      }
    }
    return () => {
      if (mainEl) mainEl.style.overflow = '';
    };
  }, [isModalOpen, selectedGrn]);

  // Handle adding an item to the list of goods being received
  const handleAddItem = () => {
    if (!currentProductId) return;
    const prod = products.find((p) => p.id === currentProductId);
    if (!prod) return;

    // Check if item already exists in form
    const existingIndex = grnItems.findIndex((item) => item.productId === currentProductId);
    if (existingIndex >= 0) {
      const updated = [...grnItems];
      updated[existingIndex].quantity += currentQty;
      setGrnItems(updated);
    } else {
      setGrnItems([
        ...grnItems,
        {
          productId: currentProductId,
          name: prod.name,
          quantity: currentQty,
          unitCost: currentCost || parseFloat(prod.price) * 0.6 // default cost: 60% of retail
        }
      ]);
    }

    // Reset current item inputs
    setCurrentProductId('');
    setCurrentQty(1);
    setCurrentCost(0);
  };

  const handleRemoveItem = (index: number) => {
    setGrnItems(grnItems.filter((_, i) => i !== index));
  };

  const { showToast } = useAdmin();

  const handleCreateGRN = async (e: React.FormEvent) => {
    e.preventDefault();
    if (grnItems.length === 0) {
      showToast('Please add at least one product item to receive.', 'warning');
      return;
    }

    setLoading(true);
    try {
      // 1. Update the stocks in database
      for (const item of grnItems) {
        const prod = products.find((p) => p.id === item.productId);
        if (prod) {
          const newStock = prod.stockQuantity + item.quantity;
          await onUpdateStock(item.productId, newStock);
        }
      }

      // 2. Generate GRN details
      const idStr = `GRN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
      const totalCost = grnItems.reduce((sum, item) => sum + item.unitCost * item.quantity, 0);

      const newGrn: GRN = {
        id: idStr,
        supplierName,
        receiveDate: new Date().toISOString().split('T')[0],
        status: 'Received',
        notes,
        items: grnItems,
        totalCost
      };

      // 3. Save locally
      const updatedGrns = [newGrn, ...grns];
      setGrns(updatedGrns);
      localStorage.setItem('zopify_grns', JSON.stringify(updatedGrns));

      // Reset modal fields
      setSupplierName('');
      setNotes('');
      setGrnItems([]);
      setIsModalOpen(false);
      showToast(`Goods Received Note ${idStr} generated! Stock updated.`, 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Failed to update product inventory. Please check connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredGrns = grns.filter(
    (g) =>
      g.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.supplierName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="text-left animate-in fade-in duration-200">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Goods Received Notes (GRN)</h1>
          <p className="text-xs text-slate-400 mt-1">Receive new inventory shipments, document suppliers, and update stock counts.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold py-2.5 px-4 rounded-lg shadow-sm transition active:scale-95 cursor-pointer"
        >
          <Plus size={16} />
          <span>Receive Goods</span>
        </button>
      </div>

      {/* Filter and search */}
      <div className="mb-6 relative max-w-sm">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
          <Search size={16} />
        </span>
        <input
          type="text"
          placeholder="Search by Note ID or Supplier..."
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-cardbg-dark text-slate-800 dark:text-slate-200 focus:outline-none focus:border-accent"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* GRN list table */}
      <div className="bg-white dark:bg-cardbg-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Note ID</th>
                <th className="px-6 py-4">Supplier</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Total Items</th>
                <th className="px-6 py-4">Total Cost</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-600 dark:text-slate-350">
              {filteredGrns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    No Goods Received Notes found.
                  </td>
                </tr>
              ) : (
                filteredGrns.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">{g.id}</td>
                    <td className="px-6 py-4">{g.supplierName}</td>
                    <td className="px-6 py-4">{g.receiveDate}</td>
                    <td className="px-6 py-4">{g.items.reduce((sum, i) => sum + i.quantity, 0)} units</td>
                    <td className="px-6 py-4 font-bold text-accent">${g.totalCost.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
                        {g.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedGrn(g)}
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
      {selectedGrn && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-cardbg-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150 text-left">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <FileText size={18} className="text-accent" />
                <span>GRN Details: {selectedGrn.id}</span>
              </h2>
              <button
                onClick={() => setSelectedGrn(null)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="block text-slate-400 font-semibold uppercase tracking-wider">Supplier</span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1 block">{selectedGrn.supplierName}</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-semibold uppercase tracking-wider">Receive Date</span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1 block">{selectedGrn.receiveDate}</span>
                </div>
              </div>

              {selectedGrn.notes && (
                <div className="bg-slate-50 dark:bg-slate-800/30 p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 text-xs">
                  <span className="block text-slate-400 font-bold mb-1 uppercase tracking-wide">Shipment Notes</span>
                  <p className="text-slate-600 dark:text-slate-350">{selectedGrn.notes}</p>
                </div>
              )}

              {/* Items List */}
              <div>
                <span className="block text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Received Items</span>
                <div className="border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-2">Product</th>
                        <th className="px-4 py-2">Quantity</th>
                        <th className="px-4 py-2">Unit Cost</th>
                        <th className="px-4 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-slate-600 dark:text-slate-300">
                      {selectedGrn.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2 font-medium text-slate-800 dark:text-slate-200">{item.name}</td>
                          <td className="px-4 py-2">{item.quantity} units</td>
                          <td className="px-4 py-2">${item.unitCost.toFixed(2)}</td>
                          <td className="px-4 py-2 text-right font-bold text-slate-900 dark:text-slate-100">
                            ${(item.unitCost * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                <span className="text-sm font-semibold text-slate-500">Total Purchase Cost</span>
                <span className="text-lg font-extrabold text-accent">${selectedGrn.totalCost.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Goods Receipt Form Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overscroll-contain animate-in fade-in duration-150"
          onClick={() => {
            setIsModalOpen(false);
            setGrnItems([]);
          }}
        >
          <div
            className="bg-white dark:bg-cardbg-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150 text-left relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Truck size={18} className="text-accent" />
                <span>New Goods Received Note</span>
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setGrnItems([]);
                }}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateGRN} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Supplier Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Components Ltd."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-accent"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Shipment Notes</label>
                <textarea
                  placeholder="Any details on shipment condition, batch numbers..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-accent"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Add item interface */}
              <div className="border border-dashed border-slate-200 dark:border-slate-800 p-4 rounded-lg bg-slate-50/50 dark:bg-slate-900/10">
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Add Goods to Note</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Select Product</label>
                    <select
                      className="w-full px-2 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-accent"
                      value={currentProductId}
                      onChange={(e) => {
                        setCurrentProductId(e.target.value);
                        const prod = products.find((p) => p.id === e.target.value);
                        if (prod) {
                          setCurrentCost(parseFloat(prod.price) * 0.6); // default wholesale cost
                        }
                      }}
                    >
                      <option value="">-- Choose Product --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Stock: {p.stockQuantity})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        className="w-full px-2 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-accent"
                        value={currentQty}
                        onChange={(e) => setCurrentQty(parseInt(e.target.value, 10) || 1)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Unit Cost ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="w-full px-2 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-accent"
                        value={currentCost}
                        onChange={(e) => setCurrentCost(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  disabled={!currentProductId}
                  className="w-full flex items-center justify-center gap-1 bg-accent/10 border border-accent/20 hover:bg-accent/15 text-accent text-xs font-semibold py-1.5 px-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={14} />
                  <span>Add Item to Receipt</span>
                </button>
              </div>

              {/* Added items list */}
              {grnItems.length > 0 && (
                <div>
                  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Shipment Item List</span>
                  <div className="max-h-32 overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-lg">
                    <ul className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                      {grnItems.map((item, index) => (
                        <li key={index} className="flex justify-between items-center p-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block">{item.name}</span>
                            <span className="text-[10px] text-slate-400 mt-0.5 block">
                              {item.quantity} units @ ${item.unitCost.toFixed(2)} each
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              ${(item.unitCost * item.quantity).toFixed(2)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="text-red-500 hover:text-red-600 transition"
                            >
                              <X size={14} />
                            </button>
                          </div>
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
                    setGrnItems([]);
                  }}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-850 rounded-lg text-sm text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || grnItems.length === 0}
                  className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-lg shadow-sm transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? 'Processing...' : 'Confirm Goods Received'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
