import React, { useState, useEffect } from 'react';
import { feeAPI } from '../../utils/api';
import { DollarSign, Clock, CheckCircle, Download, CreditCard, ChevronRight } from 'lucide-react';

const StudentFeePortal = () => {
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMyDues();
    }, []);

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
        // Mock Receipt Download
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

    if (loading) return <div className="p-8 text-center text-gray-500">Loading your fee details...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="space-y-8 animate-fade-in">
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
                        disabled
                        className="bg-blue-600 text-white px-6 py-2 rounded-xl shadow-lg shadow-blue-200 opacity-80 cursor-not-allowed"
                    >
                        Pay Online (Coming Soon)
                    </button>
                    <p className="text-xs text-gray-400 mt-2">Currently accepting offline payments</p>
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
                            <div className="p-4 text-center text-sm text-gray-400 bg-white">
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
        </div>
    );
};

export default StudentFeePortal;
