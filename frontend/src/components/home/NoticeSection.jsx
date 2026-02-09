import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const NoticeSection = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getFileSize = () => {
    // Simulated file sizes for notices
    const sizes = ['1 KB', '2 KB', '1.5 KB', '3 KB'];
    return sizes[Math.floor(Math.random() * sizes.length)];
  };

  if (loading) {
    return (
      <section className="py-16 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        </div>
      </section>
    );
  }

  const displayNotices = notices.slice(0, 5);

  if (displayNotices.length === 0) return null;

  return (
    <section className="py-20 relative z-20 bg-white/90 backdrop-blur-3xl border-y border-white/40 overflow-hidden">
      {/* Subtle Background Glows similar to Aurora */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-400/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Left Side - Stats or Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <span className="inline-block py-1 px-3 rounded-full bg-blue-100 border border-blue-200 text-blue-600 font-medium text-sm tracking-wide uppercase">
                Stay Updated
              </span>
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 leading-tight">
                Important <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Announcements</span>
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed max-w-lg">
                Stay ahead with real-time updates on examinations, admission schedules, and campus activities directly from the administration.
              </p>
            </div>

            {/* Quick Stats Cards - Light Glass Effect */}
            <div className="grid grid-cols-2 gap-5">
              <div className="group bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white/60 hover:bg-white/80 hover:border-white transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-gray-200/50">
                <div className="flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-3xl font-bold text-gray-900 mb-1">{notices.length}+</h4>
                    <p className="text-gray-500 text-sm font-medium">Active Notices</p>
                  </div>
                </div>
              </div>

              <div className="group bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white/60 hover:bg-white/80 hover:border-white transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-gray-200/50">
                <div className="flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-3xl font-bold text-gray-900 mb-1">Daily</h4>
                    <p className="text-gray-500 text-sm font-medium">Real-time Updates</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Notice Panel (Light Premium Glass) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Glass Container */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/80 shadow-2xl shadow-blue-900/10 ring-1 ring-white/50">
              
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 backdrop-blur-sm px-8 py-5 border-b border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center border border-white/30 shadow-inner">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-wide">Notice Board</h3>
                    <p className="text-blue-100/90 text-xs font-medium">Latest official updates</p>
                  </div>
                </div>
              </div>

              {/* Notice List - Scrollable Container */}
              <div 
                ref={scrollRef}
                onMouseMove={(e) => {
                  const container = scrollRef.current;
                  if (!container) return;
                  const rect = container.getBoundingClientRect();
                  const y = e.clientY - rect.top;
                  const height = rect.height;
                  // Calculate percentage (0 to 1) of mouse position in container
                  const percentage = Math.min(Math.max(y / height, 0), 1);
                  // Scroll based on percentage
                  container.scrollTop = (container.scrollHeight - container.clientHeight) * percentage;
                }}
                onMouseLeave={() => {
                  if (scrollRef.current) {
                    scrollRef.current.scrollTo({
                      top: 0,
                      behavior: 'smooth'
                    });
                  }
                }}
                className="divide-y divide-gray-100 bg-white/40 max-h-[250px] overflow-y-auto custom-scrollbar overscroll-contain pt-2"
              >
                {notices.map((notice, index) => (
                  <motion.div
                    key={notice._id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="group px-5 py-4 hover:bg-white/60 transition-all cursor-pointer border-l-4 border-transparent hover:border-blue-500"
                  >
                    <div className="flex items-start gap-3">
                      {/* Document Icon */}
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-md transition-all">
                        <svg className="w-5 h-5 text-blue-600 transform group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-semibold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-2 leading-snug mb-2">
                          {notice.title}
                        </h4>
                        
                        {/* Metadata Row */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1.5 bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            {getFileSize()}
                          </span>
                          <span className="text-gray-300 font-light">|</span>
                          <span className="text-orange-600 font-medium flex items-center gap-1.5">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(notice.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

{/* Footer - View All */}
              <div className="px-6 py-5 bg-gray-50/80 backdrop-blur-sm border-t border-white/50">
                <Link to="/notices" className="w-full group flex items-center justify-between text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors bg-white/50 hover:bg-white py-3 px-4 rounded-xl border border-white/60 hover:border-blue-200 shadow-sm hover:shadow-md">
                  <span>VIEW ALL NOTICES</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-all">
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              </div>
            </div>

            {/* Decorative Orbs */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none mix-blend-multiply"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-500/10 rounded-full blur-[80px] pointer-events-none mix-blend-multiply"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
export default NoticeSection;