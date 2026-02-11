import React, { useState, useEffect } from 'react';
import { feeAPI } from '../../utils/api';
import { DollarSign, Clock, CheckCircle, Download, CreditCard, ChevronRight, CalendarClock, Send, X } from 'lucide-react';

const StudentFeePortal = () => {
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Pay Modal State
    const [showPayModal, setShowPayModal] = useState(false);
    const [selectedFee, setSelectedFee] = useState(null);
    const [payForm, setPayForm] = useState({ amount: '', paymentMode: 'Online', referenceId: '', remarks: '' });
    const [payLoading, setPayLoading] = useState(false);
    const [paySuccess, setPaySuccess] = useState(null);

    // Extension Modal State
    const [showExtendModal, setShowExtendModal] = useState(false);
    const [extendFee, setExtendFee] = useState(null);
    const [extendForm, setExtendForm] = useState({ requestedDueDate: '', reason: '' });
    const [extendLoading, setExtendLoading] = useState(false);
    const [extendSuccess, setExtendSuccess] = useState(null);

    // Toast/notification
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchMyDues();
    }, []);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const fetchMyDues = async () => {
        try {
            setLoading(true);
            const res = await feeAPI.getMyDues();
            setFees(res.data.data);
        } catch (err) {
            setError('Failed to load fee details');
        } finally {
            setLoading(false);
        }
    };

    const totalDue = fees.reduce((sum, fee) => sum + fee.dueAmount, 0);
    const totalPaid = fees.reduce((sum, fee) => sum + fee.paidAmount, 0);

    const handleDownloadReceipt = (transaction, feeName) => {
        const receiptContent = `
            RECEIPT
            --------------------------
            Receipt No: ${transaction.receiptNumber}
            Date: ${new Date(transaction.date).toLocaleDateString()}
            Fee Type: ${feeName}
            Amount Paid: ₹${transaction.amount}
            Payment Mode: ${transaction.paymentMode}
            Reference: ${transaction.referenceId || 'N/A'}
            --------------------------
            Status: SUCCESS
        `;
        const blob = new Blob([receiptContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Receipt_${transaction.receiptNumber}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // --- Pay Fees ---
    const openPayModal = (fee) => {
        setSelectedFee(fee);
        setPayForm({ amount: fee.dueAmount, paymentMode: 'Online', referenceId: '', remarks: '' });
        setPaySuccess(null);
        setShowPayModal(true);
    };

    const handlePaySubmit = async (e) => {
        e.preventDefault();
        if (!payForm.amount || payForm.amount <= 0) return;
        setPayLoading(true);
        try {
            const res = await feeAPI.studentPay({
                studentFeeId: selectedFee._id,
                amount: Number(payForm.amount),
                paymentMode: payForm.paymentMode,
                referenceId: payForm.referenceId,
                remarks: payForm.remarks
            });
            setPaySuccess(res.data.receipt);
            setToast({ type: 'success', message: 'Payment recorded successfully!' });
            fetchMyDues();
        } catch (err) {
            setToast({ type: 'error', message: err.response?.data?.message || 'Payment failed' });
        } finally {
            setPayLoading(false);
        }
    };

    // --- Extension Request ---
    const openExtendModal = (fee) => {
        setExtendFee(fee);
        setExtendForm({ requestedDueDate: '', reason: '' });
        setExtendSuccess(null);
        setShowExtendModal(true);
    };

    const handleExtendSubmit = async (e) => {
        e.preventDefault();
        if (!extendForm.requestedDueDate || !extendForm.reason) return;
        setExtendLoading(true);
        try {
            await feeAPI.createExtensionRequest({
                studentFeeId: extendFee._id,
                requestedDueDate: extendForm.requestedDueDate,
                reason: extendForm.reason
            });
            setExtendSuccess(true);
            setToast({ type: 'success', message: 'Extension request submitted!' });
        } catch (err) {
            setToast({ type: 'error', message: err.response?.data?.message || 'Request failed' });
        } finally {
            setExtendLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading your fee details...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="space-y-8 animate-fade-in relative">
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white font-medium text-sm animate-fade-in-up ${
                    toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                }`}>
                    {toast.message}
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-red-50 to-white p-6 rounded-2xl border border-red-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-2 text-red-600">
                        <Clock size={24} />
                        <h3 className="font-semibold">Total Outstanding Due</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-800">₹{totalDue.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-1">Pay before due dates to avoid penalty</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-2xl border border-green-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-2 text-green-600">
                        <CheckCircle size={24} />
                        <h3 className="font-semibold">Total Paid</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-800">₹{totalPaid.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-1">Thank you for timely payments</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border border-blue-100 shadow-sm flex flex-col justify-center items-center text-center">
                    <CreditCard size={32} className="text-blue-600 mb-2" />
                    <button 
                        onClick={() => {
                            const pendingFee = fees.find(f => f.status !== 'Paid');
                            if (pendingFee) openPayModal(pendingFee);
                            else setToast({ type: 'error', message: 'No pending fees to pay' });
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl shadow-lg shadow-blue-200 font-semibold transition-all duration-200 hover:scale-105"
                    >
                        Pay Fees
                    </button>
                    <p className="text-xs text-gray-400 mt-2">Record your offline/online payment</p>
                </div>
            </div>

            {/* Fee Breakdown */}
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <DollarSign size={20} className="text-blue-600"/> Fee Breakdown
            </h2>
            
            <div className="space-y-6">
                {fees.map(fee => (
                    <div key={fee._id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden group">
                        {/* Header */}
                        <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/50">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">{fee.feeStructure.name}</h3>
                                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                    <span>Due: {new Date(fee.feeStructure.dueDate).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span>Acad Year: {fee.feeStructure.academicYear}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Status</p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-1 ${
                                        fee.status === 'Paid' ? 'bg-green-100 text-green-700' :
                                        fee.status === 'Partial' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                        {fee.status.toUpperCase()}
                                    </span>
                                </div>
                                <div className="text-right min-w-[100px]">
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Balance</p>
                                    <p className="text-xl font-bold text-red-600">₹{fee.dueAmount.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons for unpaid fees */}
                        {fee.status !== 'Paid' && (
                            <div className="px-6 py-3 border-t border-gray-100 flex gap-3 bg-blue-50/30">
                                <button 
                                    onClick={() => openPayModal(fee)}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
                                >
                                    <CreditCard size={16} /> Pay Now
                                </button>
                                <button 
                                    onClick={() => openExtendModal(fee)}
                                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
                                >
                                    <CalendarClock size={16} /> Request Date Extension
                                </button>
                            </div>
                        )}

                        {/* Transaction History */}
                        {fee.transactions.length > 0 && (
                            <div className="border-t border-gray-100">
                                <div className="px-6 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Payment History
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {fee.transactions.map((txn, idx) => (
                                        <div key={idx} className="px-6 py-4 flex justify-between items-center hover:bg-blue-50/30 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-green-100 p-2 rounded-full text-green-600">
                                                    <CheckCircle size={16} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800">Paid ₹{txn.amount.toLocaleString()}</p>
                                                    <p className="text-xs text-gray-500">{new Date(txn.date).toLocaleDateString()} via {txn.paymentMode}</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleDownloadReceipt(txn, fee.feeStructure.name)}
                                                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                                            >
                                                <Download size={16} /> Receipt
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                         
                        {/* If no transactions */}
                        {fee.transactions.length === 0 && (
                            <div className="p-4 text-center text-sm text-gray-400 bg-white border-t border-gray-100">
                                No payments recorded yet.
                            </div>
                        )}
                    </div>
                ))}

                {fees.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                        <p className="text-gray-500">No fee records found for your account.</p>
                    </div>
                )}
            </div>

            {/* ===== Pay Fees Modal ===== */}
            {showPayModal && selectedFee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowPayModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-fade-in-up" onClick={e => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-4 flex justify-between items-center">
                            <h3 className="font-bold text-lg">Pay Fee</h3>
                            <button onClick={() => setShowPayModal(false)} className="text-white/80 hover:text-white"><X size={20} /></button>
                        </div>

                        {paySuccess ? (
                            <div className="p-8 text-center space-y-4">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle size={32} className="text-green-600" />
                                </div>
                                <h4 className="text-xl font-bold text-gray-800">Payment Recorded!</h4>
                                <p className="text-gray-500 text-sm">Receipt: <span className="font-mono font-bold">{paySuccess.receiptNumber}</span></p>
                                <button onClick={() => setShowPayModal(false)} className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors font-medium">Close</button>
                            </div>
                        ) : (
                            <form onSubmit={handlePaySubmit} className="p-6 space-y-4">
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <p className="text-sm font-medium text-blue-800">{selectedFee.feeStructure.name}</p>
                                    <p className="text-xs text-blue-600">Balance: ₹{selectedFee.dueAmount.toLocaleString()}</p>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                                    <input 
                                        type="number" min="1" max={selectedFee.dueAmount} required
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        value={payForm.amount}
                                        onChange={e => setPayForm({...payForm, amount: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
                                    <select 
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        value={payForm.paymentMode}
                                        onChange={e => setPayForm({...payForm, paymentMode: e.target.value})}
                                    >
                                        <option value="Online">Online / UPI</option>
                                        <option value="Cash">Cash</option>
                                        <option value="Cheque">Cheque</option>
                                        <option value="DD">Demand Draft</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Reference / UTR Number</label>
                                    <input 
                                        type="text" placeholder="e.g., UTR12345678"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        value={payForm.referenceId}
                                        onChange={e => setPayForm({...payForm, referenceId: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (Optional)</label>
                                    <input 
                                        type="text" placeholder="Any additional note"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        value={payForm.remarks}
                                        onChange={e => setPayForm({...payForm, remarks: e.target.value})}
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={payLoading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {payLoading ? (
                                        <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> Processing...</>
                                    ) : (
                                        <><Send size={18} /> Submit Payment</>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* ===== Extension Request Modal ===== */}
            {showExtendModal && extendFee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowExtendModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-fade-in-up" onClick={e => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-4 flex justify-between items-center">
                            <h3 className="font-bold text-lg">Request Date Extension</h3>
                            <button onClick={() => setShowExtendModal(false)} className="text-white/80 hover:text-white"><X size={20} /></button>
                        </div>

                        {extendSuccess ? (
                            <div className="p-8 text-center space-y-4">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle size={32} className="text-green-600" />
                                </div>
                                <h4 className="text-xl font-bold text-gray-800">Request Submitted!</h4>
                                <p className="text-gray-500 text-sm">Your request has been sent to the admin for review.</p>
                                <button onClick={() => setShowExtendModal(false)} className="bg-amber-500 text-white px-6 py-2 rounded-xl hover:bg-amber-600 transition-colors font-medium">Close</button>
                            </div>
                        ) : (
                            <form onSubmit={handleExtendSubmit} className="p-6 space-y-4">
                                <div className="bg-amber-50 p-3 rounded-lg">
                                    <p className="text-sm font-medium text-amber-800">{extendFee.feeStructure.name}</p>
                                    <p className="text-xs text-amber-600">Current Due Date: {new Date(extendFee.feeStructure.dueDate).toLocaleDateString()}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Requested New Due Date</label>
                                    <input 
                                        type="date" required
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                                        value={extendForm.requestedDueDate}
                                        onChange={e => setExtendForm({...extendForm, requestedDueDate: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Extension</label>
                                    <textarea 
                                        required rows={3} maxLength={500}
                                        placeholder="Please explain why you need an extension..."
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
                                        value={extendForm.reason}
                                        onChange={e => setExtendForm({...extendForm, reason: e.target.value})}
                                    />
                                    <p className="text-xs text-gray-400 text-right mt-1">{extendForm.reason.length}/500</p>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={extendLoading}
                                    className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {extendLoading ? (
                                        <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> Submitting...</>
                                    ) : (
                                        <><CalendarClock size={18} /> Submit Request</>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentFeePortal;
