import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const ACTION_LABELS = {
  view_metadata: { label: 'Viewed Metadata', color: 'text-gray-600 bg-gray-100' },
  decrypt: { label: 'Decrypted', color: 'text-blue-600 bg-blue-100' },
  verify: { label: 'Verified', color: 'text-green-600 bg-green-100' },
  reject: { label: 'Rejected', color: 'text-red-600 bg-red-100' },
  download: { label: 'Downloaded', color: 'text-purple-600 bg-purple-100' },
  delete: { label: 'Deleted', color: 'text-orange-600 bg-orange-100' },
  restore: { label: 'Restored', color: 'text-teal-600 bg-teal-100' }
};

const AuditLogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    action: '',
    startDate: '',
    endDate: ''
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 0 });

  const getToken = () => localStorage.getItem('token');

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page: pagination.page,
        limit: pagination.limit
      };
      
      if (filters.action) params.action = filters.action;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      
      const response = await axios.get(`${API_URL}/admin/documents/logs`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        params
      });
      
      setLogs(response.data.data.logs);
      setPagination(prev => ({ ...prev, ...response.data.data.pagination }));
    } catch (err) {
      console.error('Failed to fetch logs:', err);
      setError('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Admin', 'Action', 'Document Type', 'File Name', 'Success', 'IP Address'];
    const rows = logs.map(log => [
      new Date(log.timestamp).toISOString(),
      log.admin?.name || 'Unknown',
      log.action,
      log.document?.type || 'N/A',
      log.document?.fileName || 'N/A',
      log.success ? 'Yes' : 'No',
      log.ipAddress
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
            <p className="text-gray-600">Track all document access and actions</p>
          </div>
          <button
            onClick={handleExportCSV}
            disabled={logs.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
              <select
                value={filters.action}
                onChange={(e) => {
                  setFilters(f => ({ ...f, action: e.target.value }));
                  setPagination(p => ({ ...p, page: 1 }));
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Actions</option>
                {Object.entries(ACTION_LABELS).map(([value, { label }]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => {
                  setFilters(f => ({ ...f, startDate: e.target.value }));
                  setPagination(p => ({ ...p, page: 1 }));
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => {
                  setFilters(f => ({ ...f, endDate: e.target.value }));
                  setPagination(p => ({ ...p, page: 1 }));
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => {
                setFilters({ action: '', startDate: '', endDate: '' });
                setPagination(p => ({ ...p, page: 1 }));
              }}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Logs Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent" />
            </div>
          ) : logs.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              No audit logs found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Document</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((log) => {
                    const actionInfo = ACTION_LABELS[log.action] || { label: log.action, color: 'text-gray-600 bg-gray-100' };
                    return (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900">{log.admin?.name || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">{log.admin?.designation}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${actionInfo.color}`}>
                            {actionInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {log.document ? (
                            <div>
                              <p className="text-sm text-gray-900">{log.document.type}</p>
                              <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                {log.document.fileName}
                              </p>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {log.success ? (
                            <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Success
                            </span>
                          ) : (
                            <div>
                              <span className="inline-flex items-center gap-1 text-red-600 text-sm">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Failed
                              </span>
                              {log.failureReason && (
                                <p className="text-xs text-red-500 mt-1">{log.failureReason}</p>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                          {log.ipAddress}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.pages} ({pagination.total} total logs)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                  disabled={pagination.page >= pagination.pages}
                  className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium">Security Notice</p>
            <p className="mt-1">
              All document access is logged and cannot be modified or deleted. These logs are retained for 
              compliance with regulatory requirements and may be audited.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogViewer;
