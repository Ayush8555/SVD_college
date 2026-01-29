import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import ResultDisplay from '../../components/ResultDisplay'; // for view specific result in modal? 
// Or just reuse public check API but authenticated?

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const StudentDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('results'); // results | help | profile
    
    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Top Navigation */}
            <nav className="bg-primary-900 text-white shadow-lg sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white text-primary-900 rounded-lg flex items-center justify-center font-bold">S</div>
                            <span className="font-heading font-bold text-lg tracking-wide">Student Portal</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-primary-200 hidden md:block">
                                {user?.firstName} {user?.lastName} ({user?.rollNumber})
                            </span>
                            <Button variant="outline" size="sm" className="border-primary-600 text-white hover:bg-primary-800" onClick={logout}>
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Sidebar Nav */}
                    <div className="md:col-span-1 space-y-2">
                        <NavButton active={activeTab === 'results'} onClick={() => setActiveTab('results')} iconType="results" label="Examination Results" />
                        <NavButton active={activeTab === 'help'} onClick={() => setActiveTab('help')} iconType="help" label="Help Center" />
                        <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} iconType="profile" label="My Profile" />
                    </div>

                    {/* Content Area */}
                    <div className="md:col-span-3">
                        {activeTab === 'results' && <ResultsTab user={user} />}
                        {activeTab === 'help' && <HelpCenterTab user={user} />}
                        {activeTab === 'profile' && <ProfileTab user={user} />}
                    </div>
                </div>
            </main>
        </div>
    );
};

const NavButton = ({ active, onClick, iconType, label }) => {
    const getIcon = () => {
        switch(iconType) {
            case 'results':
                return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
            case 'help':
                return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>;
            case 'profile':
                return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
            default:
                return null;
        }
    };
    
    return (
        <button 
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-r-full border-l-4 transition-all font-medium text-left text-sm ${
                active ? 'bg-white text-primary-900 shadow-sm border-primary-600' : 'text-gray-600 border-transparent hover:bg-white/60 hover:text-primary-800'
            }`}
        >
            <span className="opacity-80">{getIcon()}</span>
            {label}
        </button>
    );
};

/* --- Sub Components --- */

const ResultsTab = ({ user }) => {
    // Ideally fetch list of results available for this Roll Number
    // For now, we can show a search box pre-filled or fetch from an endpoint if we implement "My Results".
    // Let's implement a simple "Check Latest Result" reusing the check API but auto-filled.
    
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    
    const fetchLatest = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/results/my`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if(res.data.data.results?.length > 0) {
                 setResult(res.data.data.results[0]);
            } else {
                toast.info("No results found.");
            }
        } catch(err) {
            console.error(err);
            toast.error("Could not fetch academic records.");
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchLatest();
    }, []);

    if(loading) return <div className="p-8 text-center text-gray-500">Loading academic records...</div>;

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">My Results</h2>
                 <Button size="sm" onClick={fetchLatest}>Refresh</Button>
            </div>
            
            {!result ? (
                 <Card className="text-center py-12">
                     <p className="text-gray-500">No results available to display.</p>
                 </Card>
            ) : (
                <ResultDisplay result={result} student={{...user, name: `${user.firstName} ${user.lastName}`}} />
            )}
        </div>
    );
};

const HelpCenterTab = () => {
    const [queries, setQueries] = useState([]);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    
    const fetchQueries = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/queries/my`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setQueries(res.data.data);
        } catch(err) { console.error(err); }
    };
    
    useEffect(() => { fetchQueries(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
             const token = localStorage.getItem('token');
             await axios.post(`${API_URL}/queries`, { subject, message }, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setSubject('');
            setMessage('');
            fetchQueries();
            toast.success("Query submitted successfully!");
        } catch(err) {
            toast.error("Failed to submit query");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-gray-800">Help Center</h2>
            
            <Card title="Submit a Query">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input 
                        label="Subject" 
                        placeholder="e.g. Result Correction, Details Mismatch" 
                        value={subject} 
                        onChange={(e) => setSubject(e.target.value)} 
                        required 
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                        <textarea 
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" 
                            rows="3"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                        ></textarea>
                    </div>
                    <Button type="submit" isLoading={loading}>Submit Ticket</Button>
                </form>
            </Card>

            <div className="space-y-4">
                <h3 className="font-bold text-gray-800 border-b border-gray-200 pb-2">Your Ticket History</h3>
                {queries.length === 0 && (
                    <div className="text-center py-8 bg-gray-50 rounded-lg text-gray-400 text-sm">
                        No support tickets submitted yet.
                    </div>
                )}
                {queries.map(q => (
                    <div key={q._id} className="bg-white border rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
                        <div className="p-4 border-b border-gray-50 flex justify-between items-start bg-gray-50/50">
                             <div>
                                <h4 className="font-bold text-gray-900 text-sm">{q.subject}</h4>
                                <p className="text-xs text-gray-500 mt-1">
                                    Ticket #{q._id.slice(-6).toUpperCase()} • {new Date(q.createdAt).toLocaleDateString()}
                                </p>
                             </div>
                             <Badge variant={q.status === 'Resolved' ? 'success' : 'warning'}>{q.status}</Badge>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Your Message</p>
                                <p className="text-sm text-gray-700 leading-relaxed">{q.message}</p>
                            </div>
                            
                            {q.adminReply && (
                                <div className="bg-blue-50/50 p-3 rounded-tr-lg rounded-br-lg rounded-bl-lg text-sm border-l-4 border-l-blue-500 ml-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-blue-800 uppercase">Support Team</span>
                                        <span className="text-[10px] text-blue-600 opacity-70">Official Reply</span>
                                    </div>
                                    <p className="text-gray-800 text-sm">{q.adminReply}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ProfileTab = ({ user }) => (
    <div className="space-y-6 animate-fade-in-up">
        <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Digital ID Card */}
            <div className="md:col-span-1">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden relative">
                    <div className="h-24 bg-primary-900 w-full relative">
                        <div className="absolute inset-0 bg-pattern-grid opacity-10"></div>
                        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                            <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-md flex items-center justify-center text-2xl font-bold text-primary-600 overflow-hidden">
                                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                            </div>
                        </div>
                    </div>
                    <div className="pt-14 pb-6 px-4 text-center">
                        <h3 className="text-lg font-bold text-gray-900">{user.firstName} {user.lastName}</h3>
                        <p className="text-sm text-primary-600 font-medium mb-4">{user.rollNumber}</p>
                        
                        <div className="space-y-2 text-sm text-gray-600 border-t border-gray-100 pt-4">
                            <p>{user.program || 'Bachelor of Science'}</p>
                            <p>{user.department}</p>
                            <p>Semester {user.currentSemester}</p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-dashed border-gray-300">
                             {/* Fake Barcode */}
                            <div className="h-8 bg-gray-800 w-3/4 mx-auto opacity-80" style={{background: 'repeating-linear-gradient(90deg, #000 0, #000 2px, #fff 2px, #fff 4px)'}}></div>
                            <p className="text-[10px] text-gray-400 mt-1 tracking-widest uppercase">Valid Student ID</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Info */}
            <div className="md:col-span-2">
                <Card title="Academic Details">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                        <div>
                            <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Official Email</label>
                            <p className="font-medium text-gray-900 border-b pb-2 border-gray-100">{user.email}</p>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Contact Number</label>
                            <p className="font-medium text-gray-900 border-b pb-2 border-gray-100">{user.phone || 'Not Registered'}</p>
                        </div>
                         <div>
                            <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Date of Birth</label>
                            <p className="font-medium text-gray-900 border-b pb-2 border-gray-100">
                                {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                            </p>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Student Status</label>
                             <div className="mt-1">
                                <Badge variant="success">Active / Regular</Badge>
                             </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    </div>
);

export default StudentDashboard;
