import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Table from '../components/ui/Table';
import { useToast } from '../context/ToastContext';
import { resultAPI } from '../utils/api';
import StudentManagementTab from '../components/StudentManagementTab';
import ResultPublishingTab from '../components/ResultPublishingTab';
import StudentPromotionTab from '../components/StudentPromotionTab';
import ReportsTab from '../components/ReportsTab';
import AdminInquiries from './AdminInquiries';
import NoticesTab from '../components/admin/NoticesTab';
import SettingsTab from '../components/admin/SettingsTab';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
      { id: 'overview', label: 'Overview', iconType: 'chart' },
      { id: 'students', label: 'Student Management', iconType: 'users' },
      { id: 'upload', label: 'Upload Results', iconType: 'upload' },
      { id: 'results', label: 'Manage Results', iconType: 'document' },
      { id: 'publishing', label: 'Result Publishing', iconType: 'publish' },
      { id: 'promote', label: 'Promote Students', iconType: 'promote' },
      { id: 'reports', label: 'Reports Center', iconType: 'reports' },
      { id: 'queries', label: 'Help Desk', iconType: 'help' },
      { id: 'inquiries', label: 'Admission Inquiries', iconType: 'clipboard' },
      { id: 'documents', label: 'Document Verification', iconType: 'file', isLink: true, href: '/admin/documents' },
      { id: 'notices', label: 'Circulars & Notices', iconType: 'bell' },
      { id: 'settings', label: 'Settings', iconType: 'settings' },
  ];

  const getMenuIcon = (iconType) => {
    const icons = {
      chart: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
      users: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
      upload: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
      document: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
      publish: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>,
      promote: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
      reports: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
      help: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>,
      clipboard: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
      file: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
      bell: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
      settings: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
      support: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" /></svg>
    };
    return icons[iconType] || null;
  };  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-gray-200 w-64 flex flex-col fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
              SVD
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900">SVD Gurukul</div>
              <div className="text-xs text-gray-500">Admin Panel</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {menuItems.map(item => (
                item.isLink ? (
                    <button
                        key={item.id}
                        onClick={() => { navigate(item.href); setSidebarOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors text-gray-700 hover:bg-gray-100"
                    >
                        <span>{getMenuIcon(item.iconType)}</span>
                        <span>{item.label}</span>
                        <svg className="w-4 h-4 ml-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </button>
                ) : (
                    <button
                        key={item.id}
                        onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                            activeTab === item.id 
                            ? 'bg-primary-50 text-primary-700' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <span>{getMenuIcon(item.iconType)}</span>
                        <span>{item.label}</span>
                    </button>
                )
            ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">
                    {user?.firstName?.[0] || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.designation || 'Administrator'}</p>
                </div>
            </div>
            <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white h-16 shadow-sm flex items-center justify-between px-4 z-20 border-b border-gray-200">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-600 text-white rounded-lg flex items-center justify-center font-bold text-xs">SVD</div>
                <span className="font-bold text-gray-900">Admin Panel</span>
            </div>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
            </button>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {activeTab === 'overview' && <OverviewTab setActiveTab={setActiveTab} />}
                {activeTab === 'students' && <StudentManagementTab />}
                {activeTab === 'upload' && <UploadResultsTab />}
                {activeTab === 'results' && <ManageResultsTab />}
                {activeTab === 'publishing' && <ResultPublishingTab />}
                {activeTab === 'promote' && <StudentPromotionTab />}
                {activeTab === 'reports' && <ReportsTab />}
                {activeTab === 'queries' && <QueriesTab />}
                {activeTab === 'inquiries' && <AdminInquiries />}
                {activeTab === 'notices' && <NoticesTab />}
                {activeTab === 'settings' && <SettingsTab />}
            </div>
        </main>
      </div>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black opacity-50 z-20 md:hidden" onClick={() => setSidebarOpen(false)}></div>}
    </div>
  );
};

/* --- Sub Components --- */

const OverviewTab = ({ setActiveTab }) => {
    const [stats, setStats] = useState({ totalStudents: 0, totalResults: 0, publishedResults: 0, pendingResults: 0 });
    const [activity, setActivity] = useState([]);
    
    useEffect(() => {
        const loadDashboardData = async () => {
             try {
                 const [statsRes, activityRes] = await Promise.all([
                     resultAPI.getStats(),
                     resultAPI.getActivity()
                 ]);
                 
                 if(statsRes.data.success) setStats(statsRes.data.data);
                 if(activityRes.data.success) setActivity(activityRes.data.data);
            } catch(err) { console.error(err); }
        };
        loadDashboardData();
    }, []);

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div>
                <h1 className="text-2xl font-heading font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-500 mt-1">Welcome back, get insights into the examination data.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Students" value={stats.totalStudents} iconType="students" color="bg-primary-50 text-primary-700 border-primary-200" />
                <StatCard title="Total Results" value={stats.totalResults} iconType="results" color="bg-blue-50 text-blue-700 border-blue-200" />
                <StatCard title="Published" value={stats.publishedResults} iconType="published" color="bg-green-50 text-green-700 border-green-200" />
                <StatCard title="Pending Review" value={stats.pendingResults} iconType="pending" color="bg-amber-50 text-amber-700 border-amber-200" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card title="Quick Actions">
                    <div className="grid grid-cols-2 gap-4">
                         <button 
                            onClick={() => setActiveTab('upload')}
                            className="p-4 border rounded-xl hover:bg-gray-50 transition text-left group"
                         >
                            <span className="block mb-2 group-hover:scale-110 transition-transform duration-200">
                                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            </span>
                            <span className="font-semibold text-gray-900">Upload CSV</span>
                            <span className="block text-xs text-gray-500 mt-1">Bulk upload results</span>
                         </button>
                         <button 
                            onClick={() => setActiveTab('publishing')}
                            className="p-4 border rounded-xl hover:bg-gray-50 transition text-left group"
                         >
                            <span className="block mb-2 group-hover:scale-110 transition-transform duration-200">
                                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                            </span>
                            <span className="font-semibold text-gray-900">Announce Results</span>
                            <span className="block text-xs text-gray-500 mt-1">Publish pending results</span>
                         </button>
                    </div>
                </Card>
                <Card title="Recent Activity">
                    <div className="space-y-4">
                        {activity.length > 0 ? (
                            activity.map((item) => (
                                <div key={item.id} className="flex items-start gap-3 text-sm pb-3 border-b border-gray-100 last:border-0">
                                    <div className="w-2 h-2 mt-1.5 rounded-full bg-green-500 flex-shrink-0 animate-pulse"></div>
                                    <div>
                                        <p className="font-medium text-gray-900">{item.description}</p>
                                        <p className="text-gray-500 text-xs mt-0.5">
                                            {item.meta} • {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                <p>No recent activity</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, iconType, color }) => {
    const getIcon = () => {
        switch(iconType) {
            case 'students':
                return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>;
            case 'results':
                return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
            case 'published':
                return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>;
            case 'pending':
                return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
            default:
                return null;
        }
    };
    
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex items-center space-x-4 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${color}`}>
                {getIcon()}
            </div>
            <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1 font-mono">{value}</p>
            </div>
        </div>
    );
};

const UploadResultsTab = () => {
    const [mode, setMode] = useState('bulk'); // 'bulk' or 'manual'

    return (
        <div className="max-w-4xl mx-auto animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-heading font-bold text-gray-900">Upload Examination Results</h1>
                <div className="bg-white p-1 rounded-lg border border-gray-200 flex">
                    <button 
                        onClick={() => setMode('bulk')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'bulk' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        Bulk Upload (CSV)
                    </button>
                    <button 
                        onClick={() => setMode('manual')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'manual' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        Manual Entry
                    </button>
                </div>
            </div>
            
            {mode === 'bulk' ? <BulkUploadPanel /> : <ManualEntryPanel />}
        </div>
    );
};

const BulkUploadPanel = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [errors, setErrors] = useState([]);
    const toast = useToast();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setStatus(null);
        setErrors([]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        
        setLoading(true);
        setStatus(null);
        
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/admin/results/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
            });
            setStatus({ type: 'success', msg: res.data.message });
            toast.success("Bulk upload processed successfully");
            if(res.data.errors?.length) setErrors(res.data.errors);
        } catch (err) {
            const msg = err.response?.data?.message || 'Upload failed';
            setStatus({ type: 'error', msg });
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <Card className="mb-6 border-t-4 border-t-primary-800" title="Bulk Result Upload">
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-12 bg-gray-50 hover:bg-white hover:border-primary-400 transition-all cursor-pointer group">
                    <div className="w-16 h-16 bg-white text-primary-600 rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform border border-gray-100">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                    </div>
                    <label htmlFor="file-upload" className="cursor-pointer text-center">
                        <span className="mt-2 block text-lg font-bold text-gray-900">
                            Drop your CSV file here
                        </span>
                        <span className="text-sm text-gray-500 mt-1 block">
                            or <span className="text-primary-600 font-semibold hover:underline">browse from computer</span>
                        </span>
                        <input id="file-upload" name="file-upload" type="file" accept=".csv, .xlsx" className="sr-only" onChange={handleFileChange} />
                    </label>
                    <p className="mt-4 text-xs text-gray-400 uppercase tracking-wide font-medium">Supported Formats: csv, xlsx</p>
                    {file && (
                        <div className="mt-6 flex items-center gap-3 bg-primary-50 px-4 py-2 rounded-lg border border-primary-100 text-sm text-primary-800 font-medium animate-fade-in">
                            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                            {file.name}
                            <button onClick={() => setFile(null)} className="ml-2 text-primary-400 hover:text-primary-700">✕</button>
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-end">
                    <Button 
                        onClick={handleUpload} 
                        disabled={!file} 
                        isLoading={loading}
                        className="px-8 shadow-md"
                    >
                        Process Upload
                    </Button>
                </div>
            </Card>

            {(status || errors.length > 0) && (
                <div className={`rounded-xl p-6 ${status?.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    {status && (
                        <div className="flex items-start">
                             {status.type === 'success' ? (
                                 <svg className="w-6 h-6 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                             ) : (
                                 <svg className="w-6 h-6 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                             )}
                             <div>
                                 <h3 className={`font-bold ${status.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                                     {status.type === 'success' ? 'Upload Successful' : 'Processing Failed'}
                                 </h3>
                                 <p className={`text-sm mt-1 ${status.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>{status.msg}</p>
                             </div>
                        </div>
                    )}
                    
                    {errors.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-red-200">
                             <p className="font-semibold text-red-800 text-sm mb-2">Rows with errors:</p>
                             <ul className="space-y-1 text-sm text-red-700 max-h-40 overflow-y-auto">
                                 {errors.map((e, i) => <li key={i}>Row {e.row}: {e.error}</li>)}
                             </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const ManualEntryPanel = () => {
    const toast = useToast();
    const handleSubmit = async (data) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/admin/results/create`, data, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Result created successfully!");
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to create result");
        }
    };

    return <ResultForm onSubmit={handleSubmit} />;
};

const ManageResultsTab = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [editingResult, setEditingResult] = useState(null);
    const toast = useToast();

    const sortResults = (data) => {
        return [...data].sort((a, b) => {
            // Sort by isPublished (false/Draft first, true/Published last)
            if (a.isPublished !== b.isPublished) {
                return a.isPublished ? 1 : -1; 
            }
            // Secondary sort by Roll Number
            return (a.rollNumber || '').localeCompare(b.rollNumber || '');
        });
    };

    const fetchResults = async (keyword = '') => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/admin/results?keyword=${keyword}`, { headers: { Authorization: `Bearer ${token}` } });
            setResults(sortResults(res.data.data));
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    };

    useEffect(() => { fetchResults(); }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchResults(search);
    };

    const togglePublish = async (id, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            // Optimistic update
            const updatedResults = results.map(r => 
                r._id === id ? { ...r, isPublished: !currentStatus } : r
            );
            setResults(sortResults(updatedResults));

            await axios.patch(`${API_URL}/admin/results/${id}/publish`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(currentStatus ? "Result Unpublished (Moved to top)" : "Result Published (Moved to bottom)");
        } catch (err) { 
            toast.error("Failed to update status"); 
            fetchResults(search); // Revert on error
        }
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Are you sure you want to delete this result?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/admin/results/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            setResults(results.filter(r => r._id !== id));
            toast.success("Result deleted");
        } catch (err) { toast.error("Delete failed"); }
    };

    const handleUpdate = async (data) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/admin/results/${editingResult._id}`, data, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Result updated successfully!");
            setEditingResult(null);
            fetchResults(search);
        } catch (err) {
            console.error(err);
            toast.error("Update failed");
        }
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-heading font-bold text-gray-900">Manage Results</h1>
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Search by Roll No..." 
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button type="submit" size="sm">Search</Button>
                </form>
            </div>

            <Card className="p-0 overflow-hidden">
                <Table 
                    headers={['Student Name', 'Roll No', 'Semester', 'SGPA', 'Status', 'Actions']}
                    emptyMessage={loading ? "Loading records..." : "No results found."}
                >
                    {!loading && results.map((r) => (
                        <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900">{r.student?.firstName} {r.student?.lastName}</div>
                                <div className="text-xs text-gray-500">{r.student?.department}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 font-mono">{r.rollNumber}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{r.semester}</td>
                            <td className="px-6 py-4 text-sm font-bold text-gray-900">{r.sgpa}</td>
                            <td className="px-6 py-4">
                                <Badge variant={r.isPublished ? 'success' : 'warning'}>
                                    {r.isPublished ? 'Published' : 'Draft'}
                                </Badge>
                            </td>
                            <td className="px-6 py-4 text-right text-sm font-medium">
                                <div className="flex justify-end gap-3">
                                    <button 
                                        onClick={() => setEditingResult(r)}
                                        className="text-xs font-semibold text-blue-600 hover:text-blue-900"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => togglePublish(r._id, r.isPublished)}
                                        className={`text-xs font-semibold ${r.isPublished ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}`}
                                    >
                                        {r.isPublished ? 'Unpublish' : 'Publish'}
                                    </button>
                                    <button onClick={() => handleDelete(r._id)} className="text-xs font-semibold text-red-600 hover:text-red-900">
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </Table>
            </Card>

            {/* Edit Modal */}
            {editingResult && (
                 <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 animate-fade-in-up">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                             <h2 className="text-xl font-bold">Edit Result</h2>
                             <button onClick={() => setEditingResult(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <ResultForm 
                            initialData={editingResult} 
                            onSubmit={handleUpdate} 
                            onCancel={() => setEditingResult(null)} 
                            isEdit 
                        />
                    </div>
                 </div>
            )}
        </div>
    );
};

const QueriesTab = () => {
    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedQuery, setSelectedQuery] = useState(null);
    const [replyText, setReplyText] = useState('');
    const toast = useToast();

    const fetchQueries = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/queries/admin/all`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setQueries(res.data.data);
        } catch(err) { console.error(err); } 
        finally { setLoading(false); }
    };

    useEffect(() => { fetchQueries(); }, []);

    const handleResolve = async (id) => {
        if(!replyText.trim()) return toast.warning("Enter a reply message");
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/queries/${id}/reply`, { reply: replyText }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReplyText('');
            setSelectedQuery(null);
            toast.success("Query resolved!");
            fetchQueries(); // refresh
        } catch(err) {
            toast.error("Failed to resolve query");
        }
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-heading font-bold text-gray-900">Student Help Desk</h1>
                <Button variant="outline" size="sm" onClick={fetchQueries}>Refresh</Button>
            </div>

            <Card className="p-0 overflow-hidden">
                <Table 
                    headers={['Student', 'Roll No', 'Subject', 'Status', 'Date', 'Action']}
                    emptyMessage={loading ? "Loading..." : "No queries found"}
                >
                    {!loading && queries.map(q => (
                        <tr key={q._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900">{q.student?.firstName} {q.student?.lastName}</div>
                                <div className="text-xs text-gray-500">{q.student?.email}</div>
                            </td>
                            <td className="px-6 py-4 font-mono text-sm">{q.rollNumber || 'N/A'}</td>
                            <td className="px-6 py-4 text-sm truncate max-w-xs">{q.subject}</td>
                            <td className="px-6 py-4">
                                <Badge variant={q.status === 'Resolved' ? 'success' : 'warning'}>{q.status}</Badge>
                            </td>
                             <td className="px-6 py-4 text-xs text-gray-500">
                                {new Date(q.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <Button size="sm" variant="secondary" onClick={() => setSelectedQuery(q)}>
                                    View / Reply
                                </Button>
                            </td>
                        </tr>
                    ))}
                </Table>
            </Card>

            {/* View/Reply Modal - Inline for simplicity or use Modal comp */}
            {selectedQuery && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-fade-in-up">
                        <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                             <h3 className="font-bold text-lg">Query Details</h3>
                             <button onClick={() => setSelectedQuery(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <div className="space-y-4">
                             <div>
                                 <p className="text-xs text-gray-500 uppercase font-bold">Subject</p>
                                 <p className="font-medium">{selectedQuery.subject}</p>
                             </div>
                             <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                 <p className="text-sm text-gray-700">{selectedQuery.message}</p>
                             </div>
                             
                             {selectedQuery.status === 'Resolved' || selectedQuery.status === 'Closed' ? (
                                 <div>
                                     <p className="text-xs text-gray-500 uppercase font-bold mb-1">Response</p>
                                     <p className="text-sm text-gray-700 bg-green-50 p-2 rounded-lg border border-green-100">
                                         {selectedQuery.adminReply}
                                     </p>
                                     <div className="mt-4 text-right">
                                         <Button variant="ghost" size="sm" onClick={() => setSelectedQuery(null)}>Close</Button>
                                     </div>
                                 </div>
                             ) : (
                                 <div>
                                     <label className="text-sm font-medium text-gray-700 mb-1 block">Your Reply</label>
                                     <textarea 
                                        className="w-full border-gray-300 rounded-lg shadow-sm"
                                        rows="3"
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Type your reply here..."
                                     ></textarea>
                                     <div className="mt-4 flex justify-end gap-2">
                                         <Button variant="ghost" onClick={() => setSelectedQuery(null)}>Cancel</Button>
                                         <Button onClick={() => handleResolve(selectedQuery._id)}>Send Reply</Button>
                                     </div>
                                 </div>
                             )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


const ResultForm = ({ initialData, onSubmit, onCancel, isEdit }) => {
    const [formData, setFormData] = useState({
        rollNumber: '',
        studentName: '',
        dateOfBirth: '',
        academicYear: '2023-2024',
        semester: '1',
        examType: 'Regular',
        subjects: [{ name: '', marks: { internal: 0, external: 0 }, credits: 4 }]
    });

    useEffect(() => {
        if(initialData) {
            setFormData({
                rollNumber: initialData.rollNumber,
                academicYear: initialData.academicYear,
                semester: initialData.semester,
                examType: initialData.examType,
                subjects: initialData.subjects || []
            });
        }
    }, [initialData]);

    const handleSubjectChange = (index, field, value) => {
        const newSubjects = [...formData.subjects];
        if(field.includes('.')) {
            const [parent, child] = field.split('.');
            newSubjects[index][parent][child] = value;
        } else {
            newSubjects[index][field] = value;
        }
        setFormData({ ...formData, subjects: newSubjects });
    };

    const addSubject = () => {
        setFormData({
            ...formData,
            subjects: [...formData.subjects, { name: '', marks: { internal: 0, external: 0 }, credits: 4 }]
        });
    };

    const removeSubject = (index) => {
        const newSubjects = formData.subjects.filter((_, i) => i !== index);
        setFormData({ ...formData, subjects: newSubjects });
    };

    return (
        <Card>
            <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Student Name (New Student)</label>
                        <input 
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-500 focus:ring-brand-500"
                            value={formData.studentName}
                            onChange={e => setFormData({ ...formData, studentName: e.target.value })}
                            placeholder="Full Name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                        <input 
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-500 focus:ring-brand-500"
                            value={formData.rollNumber}
                            onChange={e => setFormData({ ...formData, rollNumber: e.target.value })}
                            disabled={isEdit}
                            required
                        />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth (New Student)</label>
                         <input 
                            type="date"
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-500 focus:ring-brand-500"
                            value={formData.dateOfBirth}
                            onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                            placeholder="Required for new students"
                        />
                         <p className="text-xs text-gray-400 mt-1">Required if student is not registered</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                        <select 
                            className="w-full border-gray-300 rounded-lg shadow-sm"
                            value={formData.academicYear}
                            onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
                        >
                            <option>2023-2024</option>
                            <option>2024-2025</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                        <select 
                            className="w-full border-gray-300 rounded-lg shadow-sm"
                            value={formData.semester}
                            onChange={e => setFormData({ ...formData, semester: e.target.value })}
                        >
                            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
                        <select 
                            className="w-full border-gray-300 rounded-lg shadow-sm"
                            value={formData.examType}
                            onChange={e => setFormData({ ...formData, examType: e.target.value })}
                        >
                            <option>Regular</option>
                            <option>Backlog</option>
                            <option>Re-evaluation</option>
                        </select>
                    </div>
                </div>

                <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Subjects & Marks</h3>
                        <Button type="button" size="sm" variant="outline" onClick={addSubject}>+ Add Subject</Button>
                    </div>
                    <div className="space-y-4">
                        {formData.subjects.map((sub, index) => (
                            <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200 grid grid-cols-2 md:grid-cols-12 gap-3 items-end relative hover:shadow-sm transition-shadow">
                                <div className="col-span-2 md:col-span-6">
                                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Subject Name</label>
                                    <input 
                                        className="w-full text-sm rounded-md border-gray-300 focus:border-brand-500 focus:ring-brand-500"
                                        value={sub.name}
                                        onChange={e => handleSubjectChange(index, 'name', e.target.value)}
                                        placeholder="e.g. Mathematics"
                                        required
                                    />
                                </div>
                                {/* Code field removed */}
                                {/* Credits field removed per user request */}
                                
                                <div className="col-span-1 md:col-span-2">
                                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Int. Marks</label>
                                    <input 
                                        type="number"
                                        className="w-full text-sm rounded-md border-gray-300 focus:border-brand-500 focus:ring-brand-500"
                                        value={sub.marks.internal}
                                        onChange={e => handleSubjectChange(index, 'marks.internal', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="col-span-1 md:col-span-2">
                                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Ext. Marks</label>
                                    <input 
                                        type="number"
                                        className="w-full text-sm rounded-md border-gray-300 focus:border-brand-500 focus:ring-brand-500"
                                        value={sub.marks.external}
                                        onChange={e => handleSubjectChange(index, 'marks.external', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="col-span-1 md:col-span-2">
                                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Max Marks</label>
                                    <input 
                                        type="number"
                                        className="w-full text-sm rounded-md border-gray-300 focus:border-brand-500 focus:ring-brand-500"
                                        value={sub.marks.maxMarks || 100}
                                        onChange={e => handleSubjectChange(index, 'marks.maxMarks', e.target.value)}
                                        required
                                        placeholder="100"
                                    />
                                </div>
                                <div className="col-span-1 md:col-span-2">
                                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Total</label>
                                    <input 
                                        className="w-full text-sm rounded-md border-gray-300 bg-gray-100 text-gray-700 cursor-not-allowed"
                                        value={parseInt(sub.marks.internal || 0) + parseInt(sub.marks.external || 0)}
                                        readOnly
                                    />
                                </div>
                                <div className="col-span-2 md:col-span-1 flex justify-end md:justify-center mt-2 md:mt-0">
                                    <button 
                                        type="button" 
                                        onClick={() => removeSubject(index)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                        title="Remove Subject"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>


                </div>

                <div className="mt-8 flex justify-end gap-3">
                    {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>}
                    <Button type="submit">Save Result</Button>
                </div>
            </form>
        </Card>
    );
};

export default AdminDashboard;
