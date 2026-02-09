import React, { useState, useEffect, memo } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import noticesHeroBg from '../assets/notices-hero-bg.png';
import { getViewUrl, getFileType, getFileSize } from '../utils/fileHelpers';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const NoticesPage = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                const response = await axios.get(`${API_URL}/notices`);
                setNotices(response.data.data);
            } catch (err) {
                console.error('Failed to fetch notices:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchNotices();
    }, []);

    // Helper to format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };



    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 font-sans flex flex-col relative overflow-x-hidden text-slate-800">

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />
                
                {/* Hero / Header Section */}
                {/* Hero / Header Section */}
                {/* Hero / Header Section */}
                <div 
                    className="relative overflow-hidden bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${noticesHeroBg})` }}
                >
                    {/* Gradient Overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-900/70"></div>
                    
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                        <div className="space-y-2">
                            <h1 className="text-4xl md:text-5xl font-heading font-bold text-white tracking-wide drop-shadow-md">
                                News & Announcements
                            </h1>
                            
                            {/* Breadcrumbs */}
                            <nav className="flex items-center text-sm font-medium text-blue-100/90">
                                <Link to="/" className="hover:text-white transition-colors">Home</Link>
                                <span className="mx-3 text-blue-300">»</span>
                                <span className="text-blue-200">News & Announcements</span>
                            </nav>
                        </div>
                    </div>
                </div>

                <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
                    
                    {/* Archive Button Row */}
                    <div className="flex justify-end mb-6">
                        <button className="bg-rose-500 hover:bg-rose-600 text-white px-5 py-2 rounded shadow-md text-sm font-semibold transition-colors flex items-center gap-2">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                            Archive
                        </button>
                    </div>

                    {/* Table Container with scroll for many notices */}

                    <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200">
                        
                        {/* Mobile View: Vertical Cards (Hidden on md and up) */}
                        <div className="md:hidden divide-y divide-gray-200 bg-gray-50">
                            {loading ? (
                                // Skeleton for mobile
                                [...Array(5)].map((_, i) => (
                                    <div key={i} className="p-4 animate-pulse space-y-3">
                                        <div className="flex justify-between">
                                            <div className="h-4 bg-gray-200 rounded w-8"></div>
                                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                                        </div>
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-8 bg-gray-200 rounded w-full"></div>
                                    </div>
                                ))
                            ) : notices.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">No notices found.</div>
                            ) : (
                                notices.map((notice, index) => (
                                    <div key={notice._id} className="p-4 bg-white hover:bg-blue-50/50 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
                                                {index + 1}
                                            </span>
                                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                {formatDate(notice.createdAt)}
                                            </span>
                                        </div>
                                        
                                        <h3 className="text-sm font-bold text-gray-900 mb-2 leading-snug">
                                            {notice.title}
                                        </h3>
                                        
                                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                                            <span className="flex items-center gap-1">
                                                <svg className="w-3 h-3 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
                                                English
                                            </span>
                                            <span className="text-rose-500 font-medium">[{getFileSize()}]</span>
                                        </div>

                                        {notice.imageUrl ? (
                                            <a 
                                                href={getViewUrl(notice.imageUrl)} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded shadow-sm transition-colors gap-2"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                View / Download {getFileType(notice.imageUrl) === 'pdf' ? 'PDF' : 'Image'}
                                            </a>
                                        ) : (
                                            <div className="w-full py-2 text-center text-gray-400 text-xs bg-gray-50 rounded border border-gray-100 italic">
                                                No attachment
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Desktop View: Table (Hidden on sm, visible on md+) */}
                        <div className="hidden md:block overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-slate-800 text-white">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider w-16">Sr.No.</th>
                                        <th scope="col" className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider w-32">Date</th>
                                        <th scope="col" className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Title</th>
                                        <th scope="col" className="px-6 py-4 text-right text-sm font-bold uppercase tracking-wider w-40">View / Download</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {loading ? (
                                        // Skeleton loading UI for better perceived performance
                                        [...Array(5)].map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-8"></div></td>
                                                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                                                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-48"></div></td>
                                                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20 ml-auto"></div></td>
                                            </tr>
                                        ))
                                    ) : notices.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                                No notices found.
                                            </td>
                                        </tr>
                                    ) : (
                                        notices.map((notice, index) => (
                                            <tr 
                                                key={notice._id}
                                                className={index % 2 === 0 ? 'bg-gray-50 hover:bg-blue-50/50 transition-colors' : 'bg-white hover:bg-blue-50/50 transition-colors'}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-100">
                                                    {index + 1}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100">
                                                    {formatDate(notice.createdAt)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 border-r border-gray-100">
                                                    <div className="font-semibold text-base mb-1">{notice.title}</div>
                                                    <div className="flex items-center gap-3 text-xs">
                                                        <span className="flex items-center gap-1 text-gray-500">
                                                            <svg className="w-3 h-3 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                            </svg>
                                                            <span className="font-bold text-gray-700">Language :</span> English
                                                        </span>
                                                        <span className="text-rose-500 font-medium">
                                                            [{getFileSize()}]
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end items-center gap-3">
                                                        {notice.imageUrl ? (
                                                            <>
                                                                {/* File type indicator */}
                                                                <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                                                                    getFileType(notice.imageUrl) === 'pdf' 
                                                                        ? 'bg-red-100 text-red-600' 
                                                                        : 'bg-blue-100 text-blue-600'
                                                                }`}>
                                                                    {getFileType(notice.imageUrl) === 'pdf' ? '📄 PDF' : '🖼️ Image'}
                                                                </span>
                                                                <a 
                                                                    href={getViewUrl(notice.imageUrl)} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded shadow-sm transition-colors gap-1"
                                                                >
                                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                    </svg>
                                                                    View / Download
                                                                </a>
                                                            </>
                                                        ) : (
                                                            <span className="text-gray-400 text-xs">No file</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </div>
    );
};

export default NoticesPage;