import React, { useState, useEffect } from 'react';
import { Truck, Plus, Trash2, Edit, RefreshCw, CheckCircle, XCircle, MapPin } from 'lucide-react';
import { shippingServiceAPI } from '../services/shippingServiceAPI';
import type { ShippingZone } from '../types';

export const ShippingZonesPage: React.FC = () => {
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [citiesText, setCitiesText] = useState('');
  const [baseFee, setBaseFee] = useState('');
  const [freeThreshold, setFreeThreshold] = useState('');
  const [estimatedDaysMin, setEstimatedDaysMin] = useState('1');
  const [estimatedDaysMax, setEstimatedDaysMax] = useState('3');
  const [carrier, setCarrier] = useState('');
  const [isActive, setIsActive] = useState(true);

  const fetchZones = async () => {
    setLoading(true);
    try {
      const data = await shippingServiceAPI.getZones();
      setZones(data || []);
    } catch (err) {
      console.error('Failed to fetch shipping zones:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const openCreateModal = () => {
    setEditingZone(null);
    setName('');
    setCitiesText('');
    setBaseFee('');
    setFreeThreshold('');
    setEstimatedDaysMin('1');
    setEstimatedDaysMax('3');
    setCarrier('');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (zone: ShippingZone) => {
    setEditingZone(zone);
    setName(zone.name);

    let parsedCities: string[] = [];
    try {
      parsedCities = typeof zone.cities === 'string' ? JSON.parse(zone.cities) : zone.cities;
    } catch (e) {
      parsedCities = [];
    }
    setCitiesText(parsedCities.join(', '));

    setBaseFee(String(zone.baseFee));
    setFreeThreshold(zone.freeThreshold !== null ? String(zone.freeThreshold) : '');
    setEstimatedDaysMin(String(zone.estimatedDaysMin));
    setEstimatedDaysMax(String(zone.estimatedDaysMax));
    setCarrier(zone.carrier || '');
    setIsActive(zone.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const citiesArray = citiesText
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);

      const payload = {
        name,
        cities: citiesArray,
        baseFee: parseFloat(baseFee),
        freeThreshold: freeThreshold ? parseFloat(freeThreshold) : undefined,
        estimatedDaysMin: parseInt(estimatedDaysMin, 10),
        estimatedDaysMax: parseInt(estimatedDaysMax, 10),
        carrier: carrier || undefined,
        isActive,
      };

      if (editingZone) {
        await shippingServiceAPI.updateZone(editingZone.id, payload);
      } else {
        await shippingServiceAPI.createZone(payload);
      }

      setIsModalOpen(false);
      fetchZones();
    } catch (err: any) {
      alert(err.message || 'Failed to save shipping zone');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this shipping zone?')) return;
    try {
      await shippingServiceAPI.deleteZone(id);
      fetchZones();
    } catch (err: any) {
      alert(err.message || 'Failed to delete shipping zone');
    }
  };

  const handleToggleActive = async (zone: ShippingZone) => {
    try {
      await shippingServiceAPI.updateZone(zone.id, { isActive: !zone.isActive });
      fetchZones();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-200 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Truck className="w-6 h-6 text-accent" />
            Shipping Zones & Delivery Rates
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure regional delivery fees, free delivery thresholds, and carrier SLAs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchZones}
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
            Create Zone
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-cardbg-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex justify-center items-center gap-2">
            <RefreshCw className="animate-spin w-5 h-5 text-accent" />
            Loading shipping zones...
          </div>
        ) : zones.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <MapPin className="w-10 h-10 mx-auto mb-2 opacity-40 text-accent" />
            No shipping zones defined. Click "Create Zone" to set up flat rate or zone-based shipping rules.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800 tracking-wider">
                <tr>
                  <th className="px-4 py-3">Zone Name</th>
                  <th className="px-4 py-3">Cities Included</th>
                  <th className="px-4 py-3">Base Fee</th>
                  <th className="px-4 py-3">Free Delivery Threshold</th>
                  <th className="px-4 py-3">Delivery SLA</th>
                  <th className="px-4 py-3">Carrier</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {zones.map((zone) => {
                  let cityList: string[] = [];
                  try {
                    cityList = typeof zone.cities === 'string' ? JSON.parse(zone.cities) : zone.cities;
                  } catch (e) {
                    cityList = [];
                  }

                  return (
                    <tr key={zone.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                        {zone.name}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                        {cityList.length > 0 ? cityList.join(', ') : 'All Cities'}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                        LKR {Number(zone.baseFee).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-medium">
                        {zone.freeThreshold ? `Over LKR ${Number(zone.freeThreshold).toLocaleString()}` : 'None'}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {zone.estimatedDaysMin} - {zone.estimatedDaysMax} Days
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {zone.carrier || 'Standard Courier'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleActive(zone)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all ${
                            zone.isActive
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                          }`}
                        >
                          {zone.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {zone.isActive ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(zone)}
                            className="p-1.5 text-slate-400 hover:text-accent rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(zone.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-cardbg-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 text-left">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              {editingZone ? 'Edit Shipping Zone' : 'Create Shipping Zone'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Zone Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Colombo Metropolitan"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Cities Included (comma separated) *
                </label>
                <input
                  type="text"
                  required
                  value={citiesText}
                  onChange={(e) => setCitiesText(e.target.value)}
                  placeholder="colombo, nugegoda, dehiwala, maharagama"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Base Delivery Fee (LKR) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={baseFee}
                    onChange={(e) => setBaseFee(e.target.value)}
                    placeholder="e.g. 350"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Free Delivery Min Total</label>
                  <input
                    type="number"
                    step="0.01"
                    value={freeThreshold}
                    onChange={(e) => setFreeThreshold(e.target.value)}
                    placeholder="Optional (e.g. 10000)"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Min Days</label>
                  <input
                    type="number"
                    required
                    value={estimatedDaysMin}
                    onChange={(e) => setEstimatedDaysMin(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Max Days</label>
                  <input
                    type="number"
                    required
                    value={estimatedDaysMax}
                    onChange={(e) => setEstimatedDaysMax(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Carrier</label>
                  <input
                    type="text"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    placeholder="e.g. PromptX"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="zoneActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-slate-300 text-accent focus:ring-accent"
                />
                <label htmlFor="zoneActive" className="font-medium text-slate-700 dark:text-slate-300">
                  Active for checkout
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
                  {editingZone ? 'Save Changes' : 'Create Zone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
