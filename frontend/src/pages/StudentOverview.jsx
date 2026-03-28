import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import Card from '../components/ui/Card';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const StudentOverview = () => {
    const [profile, setProfile] = useState(null);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const { error } = useToast();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${API_URL}/results/my`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if(data.success) {
                setProfile(data.data.student);
                setResults(data.data.results);
            }
        } catch (err) {
            console.error(err);
             // Silent fail on overview or show minimalist error
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-gray-500">Loading Overview...</div>;
    }

    return (
        <div className="space-y-6">
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

            {/* Quick Action / Recent */}
            <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Latest Updates</h3>
                {results.length > 0 ? (
                    <Card className="bg-blue-50 border-blue-100">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-bold text-blue-900">Result Declared: Semester {results[0].semester}</p>
                                <p className="text-sm text-blue-700 mt-1">
                                    Your result for {results[0].examType} {results[0].academicYear} is now available.
                                </p>
                            </div>
                            <Link to="/student/examination" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
                                Check Result
                            </Link>
                        </div>
                    </Card>
                ) : (
                    <p className="text-gray-500 text-sm">No recent updates.</p>
                )}
            </div>
        </div>
    );
};

export default StudentOverview;
