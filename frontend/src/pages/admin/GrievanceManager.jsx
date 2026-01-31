import React, { useState, useEffect } from 'react';
import { Loader2, RefreshCw, Send, CheckCircle, XCircle } from 'lucide-react';
import { getAllGrievances, resolveGrievance } from '../../services/grievanceService';

const GrievanceManager = () => {
    const [grievances, setGrievances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchGrievances();
    }, [filter]);

    const fetchGrievances = async () => {
        setLoading(true);
        try {
            const query = filter ? { status: filter } : {};
            const data = await getAllGrievances(query);
            setGrievances(data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (status) => {
        if (!selectedTicket || !replyText.trim()) return;
        
        setActionLoading(true);
        try {
            await resolveGrievance(selectedTicket._id, {
                status,
                adminReply: replyText
            });
            setSelectedTicket(null);
            setReplyText('');
            fetchGrievances();
        } catch (error) {
            alert('Failed to update ticket');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="p-6 h-[calc(100vh-80px)] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Grievance Portal</h1>
                <div className="flex gap-2">
                    {['', 'Pending', 'Resolved'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                filter === status 
                                ? 'bg-blue-600 text-white shadow-md' 
                                : 'bg-white text-gray-600 border hover:bg-gray-50'
                            }`}
                        >
                            {status || 'All'}
                        </button>
                    ))}
                    <button onClick={fetchGrievances} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            <div className="flex gap-6 h-full overflow-hidden">
                {/* List View */}
                <div className="w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {grievances.map(ticket => (
                                <div 
                                    key={ticket._id}
                                    onClick={() => setSelectedTicket(ticket)}
                                    className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
                                        selectedTicket?._id === ticket._id ? 'bg-blue-50 border-l-4 border-blue-500' : 'border-l-4 border-transparent'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                            ticket.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {ticket.status}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(ticket.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-gray-800 truncate">{ticket.subject}</h3>
                                    <p className="text-sm text-gray-500 mt-1 truncate">{ticket.student?.firstName} {ticket.student?.lastName}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Detail View */}
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
                    {selectedTicket ? (
                        <>
                            <div className="p-6 border-b bg-gray-50">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">{selectedTicket.subject}</h2>
                                        <div className="text-sm text-gray-500 mt-1 space-x-4">
                                            <span>
                                                From: <span className="font-medium text-gray-900">{selectedTicket.student?.firstName} {selectedTicket.student?.lastName}</span>
                                            </span>
                                            <span>•</span>
                                            <span>Dept: {selectedTicket.student?.department}</span>
                                        </div>
                                    </div>
                                    <span className="bg-white border px-3 py-1 rounded-md text-sm font-medium text-gray-600">
                                        {selectedTicket.category}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex-1 p-6 overflow-y-auto">
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {selectedTicket.description}
                                </p>

                                {selectedTicket.adminReply && (
                                    <div className="mt-8 bg-blue-50 p-6 rounded-xl border border-blue-100">
                                        <h4 className="text-sm font-bold text-blue-900 uppercase mb-2">Previous Response</h4>
                                        <p className="text-gray-800">{selectedTicket.adminReply}</p>
                                        <div className="mt-2 text-xs text-gray-500 text-right">
                                            {selectedTicket.updatedAt && new Date(selectedTicket.updatedAt).toLocaleString()}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t bg-gray-50">
                                <textarea
                                    className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-white mb-4"
                                    rows="3"
                                    placeholder="Type your reply here..."
                                    value={replyText}
                                    onChange={e => setReplyText(e.target.value)}
                                ></textarea>
                                <div className="flex justify-end gap-3">
                                    <button 
                                        disabled={actionLoading}
                                        onClick={() => handleResolve('Resolved')}
                                        className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition shadow-sm disabled:opacity-50"
                                    >
                                        <CheckCircle size={18} /> Resolve & Reply
                                    </button>
                                    <button 
                                        disabled={actionLoading}
                                        onClick={() => handleResolve('In Progress')}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition"
                                    >
                                        Mark In Progress
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <Send size={48} className="mb-4 text-gray-200" />
                            <p>Select a ticket to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GrievanceManager;
