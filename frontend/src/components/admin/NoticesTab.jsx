import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import { useToast } from '../../context/ToastContext';

const NoticesTab = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        type: 'General',
        priority: 'Medium'
    });
    const toast = useToast();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

    const fetchNotices = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/notices/admin`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotices(res.data.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load notices');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotices();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this notice?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/notices/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotices(notices.filter(n => n._id !== id));
            toast.success('Notice deleted');
        } catch (err) {
            toast.error('Failed to delete notice');
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`${API_URL}/notices/${id}/toggle`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setNotices(notices.map(n => n._id === id ? { ...n, isActive: res.data.data.isActive } : n));
            toast.success('Notice status updated');
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/notices`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotices([res.data.data, ...notices]);
            toast.success('Notice published successfully');
            setIsModalOpen(false);
            setFormData({ title: '', content: '', type: 'General', priority: 'Medium' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to publish notice');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Digital Notice Board</h1>
                <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    Publish Notice
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notices.map((notice) => (
                    <Card key={notice._id} className={`relative border-l-4 ${notice.isActive ? 'border-l-green-500' : 'border-l-gray-300'} hover:shadow-lg transition-shadow`}>
                        <div className="absolute top-4 right-4 flex gap-2 z-10">
                             <button onClick={() => handleToggleStatus(notice._id)} title={notice.isActive ? "Hide" : "Show"} className={`p-1 rounded-full ${notice.isActive ? 'text-green-600 bg-green-100' : 'text-gray-400 bg-gray-100'}`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                             </button>
                             <button onClick={() => handleDelete(notice._id)} title="Delete" className="p-1 rounded-full text-red-600 bg-red-100 hover:bg-red-200">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                             </button>
                        </div>

                        <div className="mb-2">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                notice.type === 'Urgent' ? 'bg-red-100 text-red-800' :
                                notice.type === 'Holiday' ? 'bg-purple-100 text-purple-800' :
                                notice.type === 'Exam' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                                {notice.type}
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                                {new Date(notice.createdAt).toLocaleDateString()}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-2 pr-12">{notice.title}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{notice.content}</p>
                        
                        {!notice.isActive && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-xl">
                                <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-bold">Hidden</span>
                            </div>
                        )}
                    </Card>
                ))}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h2 className="text-xl font-bold">Publish New Notice</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <Input 
                                    label="Notice Title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    required
                                    placeholder="e.g. Navratri Holidays"
                                />
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                                    <textarea 
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                        rows="4"
                                        value={formData.content}
                                        onChange={(e) => setFormData({...formData, content: e.target.value})}
                                        required
                                        placeholder="Enter the detailed notice content here..."
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                        <select 
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                            value={formData.type}
                                            onChange={(e) => setFormData({...formData, type: e.target.value})}
                                        >
                                            <option>General</option>
                                            <option>Urgent</option>
                                            <option>Holiday</option>
                                            <option>Exam</option>
                                            <option>Event</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                        <select 
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                            value={formData.priority}
                                            onChange={(e) => setFormData({...formData, priority: e.target.value})}
                                        >
                                            <option>Low</option>
                                            <option>Medium</option>
                                            <option>High</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                    <Button type="submit" className="flex-1">Publish</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NoticesTab;
