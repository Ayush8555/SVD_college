import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const NoticeSection = () => {
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

  const getCategoryColor = (category) => {
    const colors = {
      Academic: 'bg-blue-600',
      Infrastructure: 'bg-indigo-600',
      Admissions: 'bg-yellow-500',
      Sports: 'bg-green-600',
      Event: 'bg-purple-600',
      Urgent: 'bg-red-600',
      General: 'bg-gray-600'
    };
    return colors[category] || colors.General;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="py-12 bg-gray-50 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  // Only show first 3 cards on home page if there are many
  const displayNotices = notices.slice(0, 3);

  // If no notices are available, do not render the section
  if (displayNotices.length === 0) return null;

  return (
    <section className="py-16 bg-white text-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-6 md:mb-10">
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-gray-900">Latest News & Announcements</h2>
          {/* View All link removed as requested */}
        </div>

        {/* Mobile: Horizontal Scroll | Desktop: Grid */}
        <div className="flex overflow-x-auto pb-6 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 snap-x snap-mandatory hide-scrollbar">
          {displayNotices.length > 0 ? (
            displayNotices.map((notice, index) => (
              <motion.div
                key={notice._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex-shrink-0 w-[280px] md:w-auto snap-center bg-white rounded-xl overflow-hidden hover:transform md:hover:scale-[1.02] transition-all duration-300 shadow-md hover:shadow-xl group border border-gray-100"
              >
                <div className="relative h-40 md:h-48 overflow-hidden">
                  {notice.imageUrl ? (
                    <img 
                      src={`${API_URL.replace('/api', '')}${notice.imageUrl}`} 
                      alt={notice.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <svg className="w-10 h-10 md:w-12 md:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 md:top-4 md:left-4">
                    <span className={`${getCategoryColor(notice.category || notice.type)} text-white text-[10px] md:text-xs font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-full uppercase tracking-wider shadow-sm`}>
                      {notice.category || notice.type}
                    </span>
                  </div>
                </div>
                
                <div className="p-4 md:p-6">
                  <p className="text-gray-500 text-xs md:text-sm font-medium mb-1 md:mb-2">
                    {formatDate(notice.eventDate || notice.createdAt)}
                  </p>
                  <h3 className="text-base md:text-xl font-bold mb-2 md:mb-3 line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors">
                    {notice.title}
                  </h3>
                  <p className="text-gray-600 text-xs md:text-sm line-clamp-2 md:line-clamp-3 mb-2 md:mb-4">
                    {notice.content}
                  </p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-3 w-full text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900">No Announcements Yet</h3>
              <p className="text-gray-500 mt-1">Check back later for updates from the college.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NoticeSection;
