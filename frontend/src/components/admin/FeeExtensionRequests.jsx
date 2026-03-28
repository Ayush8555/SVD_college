import React, { useState, useEffect } from 'react';
import { feeAPI } from '../../utils/api';
import { CalendarClock, CheckCircle, XCircle, Clock, Filter, ChevronDown, User } from 'lucide-react';

const FeeExtensionRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');
    const [resolving, setResolving] = useState(null);
    const [adminRemarks, setAdminRemarks] = useState('');
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, [filterStatus]);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const params = filterStatus ? { status: filterStatus } : {};
            const res = await feeAPI.getExtensionRequests(params);
            setRequests(res.data.data);
        } catch (err) {
            console.error('Failed to load extension requests', err);
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (id, status) => {
        setResolving(id);
        try {
            await feeAPI.resolveExtensionRequest(id, { status, adminRemarks });
            setToast({ type: 'success', message: `Request ${status.toLowerCase()} successfully` });
            setAdminRemarks('');
            fetchRequests();
        } catch (err) {
            setToast({ type: 'error', message: err.response?.data?.message || 'Failed to update request' });
        } finally {
            setResolving(null);
        }
    };

    const statusBadge = (status) => {
        const styles = {
            Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            Approved: 'bg-green-100 text-green-800 border-green-200',
            Rejected: 'bg-red-100 text-red-800 border-red-200'
        };
        return `inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles[status] || ''}`;
    };

    const statusIcon = (status) => {
        if (status === 'Approved') return <CheckCircle size={12} />;
        if (status === 'Rejected') return <XCircle size={12} />;
        return <Clock size={12} />;
    };

    const pendingCount = requests.filter(r => r.status === 'Pending').length;

    return (
        <div className="space-y-6">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white font-medium text-sm ${
                    toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                }`}>
                    {toast.message}
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <CalendarClock size={24} className="text-amber-500" />
                        Fee Extension Requests
                    </h2>
                    {pendingCount > 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                            <span className="font-bold text-amber-600">{pendingCount}</span> pending request{pendingCount > 1 ? 's' : ''} require your attention
                        </p>
                    )}
                </div>

                {/* Filter */}
                <div className="relative">
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
                    >
                        <option value="">All Requests</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-400">Loading requests...</div>
            ) : requests.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                    <CalendarClock size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No extension requests found</p>
                    <p className="text-gray-400 text-sm mt-1">{filterStatus ? `No ${filterStatus.toLowerCase()} requests` : 'Students haven\'t submitted any requests yet'}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map(req => (
                        <div key={req._id} className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${
                            req.status === 'Pending' ? 'border-amber-200' : 'border-gray-100'
                        }`}>
                            <div className="p-5">
                                <div className="flex flex-col lg:flex-row justify-between gap-4">
                                    {/* Student & Fee Info */}
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                                                {req.student?.firstName?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">
                                                    {req.student?.firstName} {req.student?.lastName}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Roll: {req.student?.rollNumber} • {req.student?.department}
                                                </p>
                                            </div>
                                            <span className={statusBadge(req.status)}>
                                                {statusIcon(req.status)} {req.status}
                                            </span>
                                        </div>

                                        <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                            <div>
                                                <p className="text-xs text-gray-500 font-semibold uppercase">Fee</p>
                                                <p className="font-medium text-gray-800 mt-0.5">{req.studentFee?.feeStructure?.name || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-semibold uppercase">Current Due</p>
                                                <p className="font-medium text-gray-800 mt-0.5">{new Date(req.currentDueDate).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-semibold uppercase">Requested Date</p>
                                                <p className="font-bold text-amber-700 mt-0.5">{new Date(req.requestedDueDate).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-semibold uppercase">Submitted</p>
                                                <p className="font-medium text-gray-800 mt-0.5">{new Date(req.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Reason</p>
                                            <p className="text-sm text-gray-700 bg-amber-50 p-2.5 rounded-lg border border-amber-100 italic">"{req.reason}"</p>
                                        </div>

                                        {req.adminRemarks && (
                                            <div>
                                                <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Admin Remarks</p>
                                                <p className="text-sm text-gray-700 bg-blue-50 p-2.5 rounded-lg border border-blue-100">{req.adminRemarks}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons (only for pending) */}
                                    {req.status === 'Pending' && (
                                        <div className="lg:w-64 flex flex-col gap-3 lg:border-l lg:pl-5 border-gray-100">
                                            <div>
                                                <label className="block text-xs text-gray-500 font-semibold uppercase mb-1">Admin Remarks</label>
                                                <textarea
                                                    rows={2}
                                                    placeholder="Optional remarks..."
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                                    value={resolving === req._id ? adminRemarks : ''}
                                                    onFocus={() => setResolving(req._id)}
                                                    onChange={e => { setResolving(req._id); setAdminRemarks(e.target.value); }}
                                                />
                                            </div>
                                            <button
                                                onClick={() => handleResolve(req._id, 'Approved')}
                                                disabled={resolving === req._id + '-loading'}
                                                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-all shadow-sm"
                                            >
                                                <CheckCircle size={16} /> Approve
                                            </button>
                                            <button
                                                onClick={() => handleResolve(req._id, 'Rejected')}
                                                disabled={resolving === req._id + '-loading'}
                                                className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-all shadow-sm"
                                            >
                                                <XCircle size={16} /> Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FeeExtensionRequests;
