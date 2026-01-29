import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const NoticeBoard = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                const res = await axios.get(`${API_URL}/notices`);
                setNotices(res.data.data);
            } catch (err) {
                console.error("Failed to fetch notices", err);
            } finally {
                setLoading(false);
            }
        };
        fetchNotices();
    }, []);

    if (loading) return (
        <div className="flex justify-center p-8">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
    );

    if (notices.length === 0) return null;

    return (
        <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    </div>
                    <h2 className="text-3xl font-heading font-bold text-gray-900">Latest Circulars & Notices</h2>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-inner h-[400px] overflow-y-auto custom-scrollbar">
                    <div className="space-y-4">
                        {notices.map((notice, index) => (
                            <motion.div 
                                key={notice._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                            >
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                                    notice.type === 'Urgent' ? 'bg-red-500' : 
                                    notice.type === 'Exam' ? 'bg-blue-500' :
                                    notice.type === 'Holiday' ? 'bg-purple-500' :
                                    'bg-gray-300'
                                }`}></div>
                                
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-700 transition-colors">{notice.title}</h3>
                                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                                        {new Date(notice.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm whitespace-pre-wrap">{notice.content}</p>
                                <div className="mt-3 flex gap-2">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                        notice.type === 'Urgent' ? 'bg-red-50 text-red-700' : 
                                        notice.type === 'Exam' ? 'bg-blue-50 text-blue-700' :
                                        notice.type === 'Holiday' ? 'bg-purple-50 text-purple-700' :
                                        'bg-gray-100 text-gray-600'
                                    }`}>
                                        {notice.type}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default NoticeBoard;
