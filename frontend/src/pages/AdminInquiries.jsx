import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Available courses (matching AdmissionInquiry page)
  const courses = [
    'Bachelor of Arts (B.A)',
    'Bachelor of Science (B.Sc)',
    'D.El.Ed. (BTC)',
    'Bachelor of Law (LL.B)'
  ];

  // Status options with colors
  const statusConfig = {
    Pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
    Contacted: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Contacted' },
    Admitted: { bg: 'bg-green-100', text: 'text-green-800', label: 'Admitted' },
    Rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' }
  };

  // Function to fetch inquiries
  const fetchInquiries = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/inquiry`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setInquiries(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching inquiries:', err);
      setError('Failed to load inquiries.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      total: inquiries.length,
      pending: inquiries.filter(i => i.status === 'Pending').length,
      contacted: inquiries.filter(i => i.status === 'Contacted').length,
      admitted: inquiries.filter(i => i.status === 'Admitted').length,
      rejected: inquiries.filter(i => i.status === 'Rejected').length
    };
  }, [inquiries]);

  // Course-wise statistics
  const courseStats = useMemo(() => {
    const stats = {};
    courses.forEach(course => {
      stats[course] = inquiries.filter(i => i.courseOfInterest === course).length;
    });
    return stats;
  }, [inquiries]);

  // Filtered and sorted inquiries
  const filteredInquiries = useMemo(() => {
    let result = [...inquiries];

    // Apply course filter
    if (courseFilter !== 'all') {
      result = result.filter(i => i.courseOfInterest === courseFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(i => i.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(i =>
        i.name?.toLowerCase().includes(query) ||
        i.email?.toLowerCase().includes(query) ||
        i.phone?.includes(query)
      );
    }

    // Sort: Pending first, then by date (newest first within each group)
    result.sort((a, b) => {
      // Priority order: Pending > Contacted > Admitted > Rejected
      const priorityOrder = { Pending: 0, Contacted: 1, Admitted: 2, Rejected: 3 };
      const priorityDiff = priorityOrder[a.status] - priorityOrder[b.status];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      // Within same status, sort by date (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return result;
  }, [inquiries, courseFilter, statusFilter, searchQuery]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/inquiry/${id}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      // Optimistic update
      setInquiries(inquiries.map(inq =>
        inq._id === id ? { ...inq, status: newStatus } : inq
      ));
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Name', 'Email', 'Phone', 'Course', 'Status', 'Message'];
    const rows = filteredInquiries.map(i => [
      new Date(i.createdAt).toLocaleDateString(),
      i.name,
      i.email,
      i.phone,
      i.courseOfInterest,
      i.status,
      i.message || ''
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `inquiries_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const clearFilters = () => {
    setCourseFilter('all');
    setStatusFilter('all');
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 text-lg mb-4">{error}</div>
        <button
          onClick={fetchInquiries}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admission Inquiries</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and track student admission inquiries</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setStatusFilter('all'); setCourseFilter('all'); }}
          className={`p-4 rounded-xl border-2 transition-all ${
            statusFilter === 'all' && courseFilter === 'all'
              ? 'border-gray-800 bg-gray-50'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <div className="text-3xl font-bold text-gray-800">{stats.total}</div>
          <div className="text-sm text-gray-500 font-medium">Total</div>
        </motion.button>

        {Object.entries(statusConfig).map(([status, config]) => (
          <motion.button
            key={status}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setStatusFilter(status)}
            className={`p-4 rounded-xl border-2 transition-all ${
              statusFilter === status
                ? `border-gray-800 ${config.bg}`
                : `border-gray-200 hover:border-gray-300 bg-white`
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${config.text}`}>
                {stats[status.toLowerCase()]}
              </span>
            </div>
            <div className={`text-sm font-medium ${config.text}`}>{config.label}</div>
          </motion.button>
        ))}
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Course Filter */}
          <div className="w-full md:w-64">
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition appearance-none bg-white"
            >
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course} value={course}>
                  {course} ({courseStats[course]})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition appearance-none bg-white"
            >
              <option value="all">All Status</option>
              {Object.keys(statusConfig).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {(courseFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Active Filters Summary */}
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
          <span>Showing</span>
          <span className="font-semibold text-gray-800">{filteredInquiries.length}</span>
          <span>of</span>
          <span className="font-semibold text-gray-800">{inquiries.length}</span>
          <span>inquiries</span>
          {statusFilter !== 'all' && (
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[statusFilter]?.bg} ${statusConfig[statusFilter]?.text}`}>
              {statusFilter}
            </span>
          )}
          {courseFilter !== 'all' && (
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              {courseFilter}
            </span>
          )}
        </div>
      </div>

      <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100">
        
        {/* Mobile View (Cards) */}
        <div className="md:hidden grid grid-cols-1 divide-y divide-gray-100">
          {loading ? (
             <div className="p-8 text-center text-gray-500">Loading inquiries...</div>
          ) : filteredInquiries.length === 0 ? (
             <div className="p-8 text-center text-gray-500">No inquiries found.</div>
          ) : (
            filteredInquiries.map(inquiry => (
              <div key={inquiry._id} className="p-4 bg-white hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900">{inquiry.name}</h3>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {new Date(inquiry.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {inquiry.courseOfInterest}
                  </span>
                </div>

                <div className="text-sm text-gray-600 mb-3 line-clamp-3">
                  {inquiry.message || "No message provided."}
                </div>

                <div className="flex flex-wrap gap-y-2 justify-between items-center text-xs text-gray-500 pt-2 border-t border-gray-100">
                   <div className="space-x-3">
                      <span>{inquiry.email}</span>
                      <span>{inquiry.phone}</span>
                   </div>
                   
                   <div className="relative">
                      <select
                        value={inquiry.status}
                        onChange={(e) => handleStatusChange(inquiry._id, e.target.value)}
                        className={`appearance-none pl-2 pr-6 py-1 rounded-md text-xs font-medium border-0 ring-1 ring-inset ${statusConfig[inquiry.status]?.bg} ${statusConfig[inquiry.status]?.text} focus:ring-2 focus:ring-brand cursor-pointer`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Admitted">Admitted</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                   </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View (Table) */}
        <div className="hidden md:block overflow-x-auto relative">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name/Contact</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Message</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <AnimatePresence>
                {filteredInquiries.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      <svg className="w-10 h-10 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                      <div className="font-medium">No inquiries found</div>
                      <div className="text-sm">Try adjusting your filters</div>
                    </td>
                  </tr>
                ) : (
                  filteredInquiries.map((inquiry, index) => (
                    <motion.tr
                      key={inquiry._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      layout
                      className={`hover:bg-gray-50 transition-colors ${
                        inquiry.status === 'Pending' ? 'bg-yellow-50/30' : ''
                      } ${index % 2 === 0 ? '' : 'bg-gray-50/50'}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{new Date(inquiry.createdAt).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(inquiry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{inquiry.name}</div>
                        <div className="text-sm text-gray-500">{inquiry.email}</div>
                        <div className="text-sm text-blue-600 font-medium">{inquiry.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-100 text-purple-800">
                          {inquiry.courseOfInterest}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 min-w-[300px]">
                        <div title={inquiry.message}>
                          {inquiry.message || <span className="text-gray-400 italic">No message</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusConfig[inquiry.status]?.bg} ${statusConfig[inquiry.status]?.text}`}>
                          {inquiry.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-y-2">
                        <select
                          className="block w-full text-xs border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 py-1.5"
                          value={inquiry.status}
                          onChange={(e) => handleStatusChange(inquiry._id, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Admitted">Admitted</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                        <div className="flex gap-2 mt-1">
                          <a
                            href={`mailto:${inquiry.email}`}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Email
                          </a>
                          <span className="text-gray-300">|</span>
                          <a
                            href={`tel:${inquiry.phone}`}
                            className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 text-xs font-medium"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            Call
                          </a>
                          <span className="text-gray-300">|</span>
                          <a
                            href={`https://wa.me/91${inquiry.phone?.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 text-xs font-medium"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                            WhatsApp
                          </a>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend / Info */}
      <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <div className="text-sm text-blue-700">
            <strong>Pro Tip:</strong> Pending inquiries are shown first. When you mark an inquiry as "Contacted", it will automatically move below pending ones so you can focus on new inquiries.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminInquiries;
