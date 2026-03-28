import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const DOCUMENT_TYPE_LABELS = {
  aadhaar: 'Aadhaar Card',
  pan_card: 'PAN Card',
  marksheet_10th: '10th Marksheet',
  marksheet_12th: '12th Marksheet',
  graduation_marksheet: 'Graduation Marksheet',
  transfer_certificate: 'Transfer Certificate',
  migration_certificate: 'Migration Certificate',
  character_certificate: 'Character Certificate',
  caste_certificate: 'Caste Certificate',
  income_certificate: 'Income Certificate',
  domicile_certificate: 'Domicile Certificate',
  passport_photo: 'Passport Photo',
  signature: 'Signature',
  other: 'Other'
};

const AdminDocumentQueue = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [filter, setFilter] = useState({ status: 'pending', documentType: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

  const getToken = () => localStorage.getItem('token');

  // Fetch documents
  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/documents/queue`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        params: {
          status: filter.status || undefined,
          documentType: filter.documentType || undefined,
          page: pagination.page,
          limit: pagination.limit
        }
      });
      setDocuments(response.data.data.documents);
      setPagination(prev => ({ ...prev, ...response.data.data.pagination }));
    } catch (err) {
      console.error('Failed to fetch documents:', err);
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [filter, pagination.page, pagination.limit]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/documents/stats`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setStats(response.data.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
    fetchStats();
  }, [fetchDocuments, fetchStats]);

  // Decrypt and preview document
  const handlePreview = async (doc) => {
    try {
      setSelectedDoc(doc);
      setPreviewLoading(true);
      setPreviewUrl(null);

      const response = await axios.get(`${API_URL}/admin/documents/${doc.id}/decrypt`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: doc.mimeType });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (err) {
      console.error('Failed to decrypt document:', err);
      setError('Failed to decrypt document');
      setSelectedDoc(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Close preview
  const closePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedDoc(null);
  };

  // Verify document
  const handleVerify = async (docId) => {
    try {
      setActionLoading(true);
      await axios.patch(
        `${API_URL}/admin/documents/${docId}/verify`,
        {},
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      closePreview();
      fetchDocuments();
      fetchStats();
    } catch (err) {
      console.error('Failed to verify document:', err);
      setError('Failed to verify document');
    } finally {
      setActionLoading(false);
    }
  };

  // Reject document
  const handleReject = async () => {
    if (!rejectReason || rejectReason.trim().length < 10) {
      setError('Please provide a reason (minimum 10 characters)');
      return;
    }

    try {
      setActionLoading(true);
      await axios.patch(
        `${API_URL}/admin/documents/${selectedDoc.id}/reject`,
        { reason: rejectReason },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setShowRejectModal(false);
      setRejectReason('');
      closePreview();
      fetchDocuments();
      fetchStats();
    } catch (err) {
      console.error('Failed to reject document:', err);
      setError('Failed to reject document');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete document
  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to permanently delete this document? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(true);
      await axios.delete(`${API_URL}/admin/documents/${docId}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      closePreview();
      fetchDocuments();
      fetchStats();
    } catch (err) {
      console.error('Failed to delete document:', err);
      setError('Failed to delete document');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending' },
      under_review: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Under Review' },
      verified: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Verified' },
      rejected: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Rejected' }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <button 
                onClick={() => navigate('/admin')}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600"
                title="Back to Dashboard"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Document Verification Queue</h1>
            </div>
            <p className="text-gray-600 ml-12">Review and verify student documents</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-lg border border-amber-200">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-sm font-medium text-amber-800">Decryption Logged</span>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Under Review</p>
              <p className="text-2xl font-bold text-blue-600">{stats.under_review}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Verified</p>
              <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Today's Uploads</p>
              <p className="text-2xl font-bold text-purple-600">{stats.todayUploads}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex justify-between"
            >
              <span>{error}</span>
              <button onClick={() => setError('')} className="hover:text-red-900">&times;</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filter.status}
                onChange={(e) => {
                  setFilter(f => ({ ...f, status: e.target.value }));
                  setPagination(p => ({ ...p, page: 1 }));
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
              <select
                value={filter.documentType}
                onChange={(e) => {
                  setFilter(f => ({ ...f, documentType: e.target.value }));
                  setPagination(p => ({ ...p, page: 1 }));
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Documents Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent" />
            </div>
          ) : documents.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              No documents found matching your filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Document</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uploaded</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{doc.student?.name || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">{doc.student?.rollNumber}</p>
                          <p className="text-xs text-gray-400">{doc.student?.department} • Sem {doc.student?.semester}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-gray-900">
                          {DOCUMENT_TYPE_LABELS[doc.documentType] || doc.documentType}
                        </p>
                        <p className="text-sm text-gray-500">{doc.originalFileName}</p>
                        <p className="text-xs text-gray-400">{(doc.fileSize / 1024).toFixed(1)} KB</p>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {new Date(doc.uploadedAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(doc.status)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handlePreview(doc)}
                            className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            Preview & Verify
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete document"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
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
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {selectedDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closePreview}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {DOCUMENT_TYPE_LABELS[selectedDoc.documentType] || selectedDoc.documentType}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedDoc.student?.name} • {selectedDoc.student?.rollNumber}
                  </p>
                </div>
                <button
                  onClick={closePreview}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Watermark Notice */}
              <div className="px-6 py-2 bg-amber-50 border-b border-amber-100 flex items-center gap-2 text-amber-800 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                This preview is logged for audit purposes. Document viewed at {new Date().toLocaleString()}
              </div>

              {/* Preview Content */}
              <div className="p-6 max-h-[60vh] overflow-auto bg-gray-100 relative">
                {previewLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="space-y-3 text-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent mx-auto" />
                      <p className="text-gray-600">Decrypting document...</p>
                    </div>
                  </div>
                ) : previewUrl ? (
                  <div className="relative">
                    {/* Watermark Overlay */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10 opacity-10">
                      <div className="text-6xl font-bold text-gray-700 rotate-[-30deg] select-none">
                        CONFIDENTIAL
                      </div>
                    </div>
                    
                    {selectedDoc.mimeType === 'application/pdf' ? (
                      <iframe
                        src={`${previewUrl}#toolbar=0`}
                        className="w-full h-[500px] rounded-lg"
                        title="Document Preview"
                      />
                    ) : (
                      <img
                        src={previewUrl}
                        alt="Document Preview"
                        className="max-w-full mx-auto rounded-lg shadow-lg"
                      />
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16 text-gray-500">
                    Failed to load document preview
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={actionLoading || selectedDoc.status === 'rejected'}
                  className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleVerify(selectedDoc.id)}
                  disabled={actionLoading || selectedDoc.status === 'verified'}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  Verify Document
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setShowRejectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Document</h3>
              <p className="text-sm text-gray-600 mb-4">
                Please provide a clear reason for rejection. This will be shown to the student.
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason (minimum 10 characters)..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows={4}
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading || rejectReason.trim().length < 10}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50"
                >
                  {actionLoading ? 'Rejecting...' : 'Reject Document'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDocumentQueue;
