
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const StudentDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { error, success } = useToast();
    const { logout } = useAuth(); // Import logout

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token'); // Use standard token key
            if (!token) {
                navigate('/student/login');
                return;
            }

            // Fetch My Results (and Profile embedded)
            const { data } = await axios.get(`${API_URL}/results/my`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if(data.success) {
                setProfile(data.data.student);
                setResults(data.data.results);
            }
        } catch (err) {
            console.error(err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                error('Session expired. Please login again.');
                handleLogout();
            } else {
                error('Failed to load dashboard.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout(); // Use context logout
        success('Logged out successfully');
        navigate('/student/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-xl text-blue-600 font-semibold animate-pulse">Loading Student Portal...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
{/* Navbar Removed - Handled by Layout */}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                
                {/* Profile Card */}
                <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white border-none shadow-lg">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        <div className="h-24 w-24 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold backdrop-blur-sm border-2 border-white/30">
                            {profile?.name?.charAt(0)}
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-2xl font-bold">{profile?.name}</h2>
                            <p className="text-blue-100 font-mono text-lg">{profile?.rollNumber}</p>
                            
                            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4 text-sm">
                                <span className="bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">
                                    {profile?.department}
                                </span>
                                <span className="bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">
                                    Batch: {profile?.batch}
                                </span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Academic Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <Card>
                        <p className="text-sm text-gray-500 font-medium">Total Semesters</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{results.length}</p>
                     </Card>
                     <Card>
                        <p className="text-sm text-gray-500 font-medium">Results Declared</p>
                        <p className="text-2xl font-bold text-green-600 mt-1">
                            {results.filter(r => r.result === 'Pass').length}
                        </p>
                     </Card>
                     <Card>
                        <p className="text-sm text-gray-500 font-medium">Latest SGPA</p>
                        <p className="text-2xl font-bold text-blue-600 mt-1">
                            {results.length > 0 ? results[0].sgpa : 'N/A'}
                        </p>
                     </Card>
                </div>

                {/* Results List */}
                <h3 className="text-xl font-bold text-gray-900 pt-4">Academic History</h3>
                
                {results.length === 0 ? (
                    <Card className="text-center py-12">
                        <p className="text-gray-500 text-lg">No results declared yet.</p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {results.map((result) => (
                            <Card key={result._id} className="hover:shadow-md transition-shadow cursor-pointer">
                                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <h4 className="text-lg font-bold text-gray-900">Semester {result.semester}</h4>
                                            <Badge variant={result.result === 'Pass' ? 'success' : 'danger'}>
                                                {result.result}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Exam: {result.examType} • Year: {result.academicYear}
                                        </p>
                                    </div>
                                    
                                    <div className="flex items-center gap-6">
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500 uppercase">SGPA</p>
                                            <p className="text-xl font-bold text-blue-600">{result.sgpa}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500 uppercase">Percentage</p>
                                            <p className="text-xl font-bold text-gray-800">{result.percentage}%</p>
                                        </div>
                                        
                                        <Button 
                                            // Navigate to result page with data in state
                                            onClick={() => navigate('/result', { 
                                                state: { 
                                                    resultData: { 
                                                        student: profile, 
                                                        result: result 
                                                    } 
                                                } 
                                            })}
                                            className="ml-4"
                                        >
                                            View Marksheet
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default StudentDashboard;
