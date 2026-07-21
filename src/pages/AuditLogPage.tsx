import React, { useState, useEffect } from 'react';
import { Shield, RefreshCw, Filter, Clock } from 'lucide-react';
import { api } from '../services/api';

interface AuditLogItem {
  id: string;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  details: any;
  ipAddress: string | null;
  createdAt: string;
}

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState('');
  const [total, setTotal] = useState(0);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const query = entityFilter ? `?entityType=${encodeURIComponent(entityFilter)}` : '';
      const data = await api.get(`/audit-logs${query}`);
      setLogs(data.items || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [entityFilter]);

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-heading flex items-center gap-2">
            <Shield className="w-6 h-6 text-accent" />
            System Audit Trail
          </h1>
          <p className="text-sm text-secondary-muted mt-1">
            Track administrative actions, entity modifications, and system events across tenants.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="btn btn-secondary text-xs flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-4 items-center bg-cardbg p-4 rounded-lg border border-border shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-secondary-muted">
          <Filter size={14} />
          Filter Entity:
        </div>
        {['', 'Product', 'Order', 'User', 'Category'].map((type) => (
          <button
            key={type}
            onClick={() => setEntityFilter(type)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
              entityFilter === type
                ? 'bg-accent text-white shadow-sm'
                : 'bg-dominant text-secondary-muted hover:text-heading border border-border'
            }`}
          >
            {type || 'All Entities'}
          </button>
        ))}
        <span className="ml-auto text-xs text-secondary-muted">
          Total Recorded Logs: <strong>{total}</strong>
        </span>
      </div>

      {/* Audit Log Table */}
      <div className="bg-cardbg rounded-lg border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-secondary-muted flex justify-center items-center gap-2">
            <RefreshCw className="animate-spin w-4 h-4 text-accent" />
            Loading audit history...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-secondary-muted">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No audit log entries recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-dominant text-secondary-muted uppercase font-semibold border-b border-border tracking-wider">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Entity</th>
                  <th className="px-4 py-3">User ID</th>
                  <th className="px-4 py-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-dominant/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-secondary-muted whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-semibold text-heading">
                      <span className="badge badge-accent px-2 py-0.5">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-heading">{log.entityType}</span>
                      {log.entityId && (
                        <span className="text-secondary-muted block font-mono text-[10px]">
                          ID: {log.entityId.substring(0, 8)}...
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-secondary-muted">
                      {log.userId ? log.userId.substring(0, 8) + '...' : 'System'}
                    </td>
                    <td className="px-4 py-3 font-mono text-secondary-muted">
                      {log.ipAddress || '127.0.0.1'}
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
