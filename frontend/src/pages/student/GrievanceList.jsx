import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Plus, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';
import { getMyGrievances } from '../../services/grievanceService';
import CreateGrievanceModal from '../../components/student/CreateGrievanceModal';

const GrievanceList = () => {
    const [grievances, setGrievances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [iscreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        fetchGrievances();
    }, []);

    const fetchGrievances = async () => {
        try {
            const response = await getMyGrievances();
            setGrievances(response?.data || []);
        } catch (err) {
            console.error('Grievance fetch error:', err);
            setError('Failed to load tickets');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Resolved': return 'bg-green-100 text-green-800';
            case 'Rejected': return 'bg-red-100 text-red-800';
            case 'In Progress': return 'bg-blue-100 text-blue-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Support & Grievances</h1>
                    <p className="text-gray-500 mt-1">Track your complaints and requests</p>
                </div>
                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
                >
                    <Plus size={20} /> New Ticket
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
            ) : error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
                    <AlertCircle size={20} /> {error}
                </div>
            ) : grievances.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No Tickets Yet</h3>
                    <p className="text-gray-500">Need help? Create a new ticket above.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    <AnimatePresence>
                        {grievances.map((item) => (
                            <motion.div 
                                key={item._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                                {item.status}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-800">{item.subject}</h3>
                                        <p className="text-sm text-gray-500 font-medium bg-gray-50 inline-block px-2 py-0.5 rounded mt-1">
                                            {item.category}
                                        </p>
                                    </div>
                                </div>
                                
                                <p className="text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg text-sm">
                                    {item.description}
                                </p>

                                {item.adminReply && (
                                    <div className="mt-4 pl-4 border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                                        <div className="text-xs font-bold text-blue-800 mb-1 uppercase tracking-wider">
                                            Admin Response
                                        </div>
                                        <p className="text-gray-800 text-sm">{item.adminReply}</p>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <CreateGrievanceModal 
                isOpen={iscreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
                onSuccess={fetchGrievances} 
            />
        </div>
    );
};

export default GrievanceList;
