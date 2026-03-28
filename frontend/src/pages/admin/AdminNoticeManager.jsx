import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const AdminNoticeManager = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    priority: 'Medium',
    eventDate: '',
    image: null
  });

  const categories = ['General', 'Urgent', 'Holiday', 'Exam', 'Event', 'Infrastructure', 'Academic', 'Admissions', 'Sports', 'Research'];

  const fetchNotices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/notices/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotices(response.data.data);
    } catch (error) {
      console.error('Error fetching notices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('title', formData.title);
      data.append('content', formData.content);
      data.append('category', formData.category);
      data.append('priority', formData.priority);
      if (formData.eventDate) data.append('eventDate', formData.eventDate);
      if (formData.image) data.append('image', formData.image);

      await axios.post(`${API_URL}/notices`, data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Reset form and refresh list
      setFormData({
        title: '',
        content: '',
        category: 'General',
        priority: 'Medium',
        eventDate: '',
        image: null
      });
      setShowForm(false);
      fetchNotices();
    } catch (error) {
      console.error('Error creating notice:', error);
      alert('Failed to create notice');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Are you sure you want to delete this notice?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/notices/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotices(notices.filter(n => n._id !== id));
    } catch (error) {
      console.error('Error deleting notice:', error);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/notices/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotices(notices.map(n => n._id === id ? { ...n, isActive: !n.isActive } : n));
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Notice Management</h1>
          <p className="text-gray-500 mt-1">Manage public announcements and circulars</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          {showForm ? 'Cancel' : '+ New Notice'}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input 
                  type="text" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleInputChange} 
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Annual Sports Meet 2026"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select 
                  name="category" 
                  value={formData.category} 
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select 
                  name="priority" 
                  value={formData.priority} 
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Date (Optional)</label>
                <input 
                  type="date" 
                  name="eventDate" 
                  value={formData.eventDate} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea 
                  name="content" 
                  value={formData.content} 
                  onChange={handleInputChange} 
                  required
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter detailed description..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={uploading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              >
                {uploading ? 'Creating...' : 'Create Notice'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Notices List */}
      <div className="space-y-4">
        {loading ? (
           <div className="text-center py-10">Loading...</div>
        ) : notices.map((notice) => (
          <div key={notice._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-6 items-start">
            <div className="w-full md:w-48 h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
              {notice.imageUrl ? (
                <img 
                  src={`${API_URL.replace('/api', '')}${notice.imageUrl}`} 
                  alt={notice.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>

            <div className="flex-grow">
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  notice.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {notice.isActive ? 'Active' : 'Hidden'}
                </span>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase">
                  {notice.category || notice.type}
                </span>
                {notice.eventDate && (
                  <span className="text-sm text-gray-500">
                    Event: {new Date(notice.eventDate).toLocaleDateString()}
                  </span>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">{notice.title}</h3>
              <p className="text-gray-600 text-sm line-clamp-2 mb-4">{notice.content}</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => handleToggleStatus(notice._id)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    notice.isActive 
                      ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' 
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  }`}
                >
                  {notice.isActive ? 'Hide' : 'Unhide'}
                </button>
                <button 
                  onClick={() => handleDelete(notice._id)}
                  className="px-4 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminNoticeManager;
