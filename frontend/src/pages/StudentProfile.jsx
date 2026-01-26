import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const StudentProfile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                // Using /my endpoint which returns populated student data including extra fields
                const { data } = await axios.get(`${API_URL}/results/my`, { 
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (data.success) {
                    setProfile(data.data.student);
                }
            } catch (error) {
                console.error("Failed to load profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return <div className="text-gray-500">Loading Profile...</div>;

    // Use fetched profile if available, otherwise fall back to auth user context
    const student = profile || user;

    // Helper to format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Header Card */}
                <div className="md:col-span-3">
                    <Card className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white border-none">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <div className="w-24 h-24 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center text-4xl font-bold backdrop-blur-sm">
                                {student?.name?.charAt(0) || student?.firstName?.charAt(0)}
                            </div>
                            <div className="text-center sm:text-left space-y-1">
                                <h2 className="text-2xl font-bold">{student?.name || `${student?.firstName} ${student?.lastName}`}</h2>
                                <p className="text-blue-100 font-mono tracking-wide">{student?.rollNumber}</p>
                                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                                    <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-medium border border-white/20">
                                        {student?.department}
                                    </span>
                                    <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-medium border border-white/20">
                                        Batch: {student?.batch || 'N/A'}
                                    </span>
                                    <span className="bg-green-500/20 text-green-50 px-3 py-1 rounded-full text-xs font-medium border border-green-400/30">
                                        Status: {student?.status || 'Active'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Personal Information */}
                <Card className="md:col-span-2">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Personal Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Full Name</p>
                            <p className="text-sm font-medium text-gray-900 mt-1">{student?.name || `${student?.firstName} ${student?.lastName}`}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Date of Birth</p>
                            <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(student?.dateOfBirth)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Gender</p>
                            <p className="text-sm font-medium text-gray-900 mt-1">{student?.gender || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Category</p>
                            <p className="text-sm font-medium text-gray-900 mt-1">{student?.category || 'General'}</p>
                        </div>
                         <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Mobile Number</p>
                            <p className="text-sm font-medium text-gray-900 mt-1">{student?.phone || 'Not Registered'}</p>
                        </div>


                    </div>
                </Card>

                {/* Academic Information */}
                <Card>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Academic Details</h3>
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Program</p>
                            <p className="text-sm font-medium text-gray-900 mt-1">{student?.program || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Current Semester</p>
                            <p className="text-sm font-medium text-gray-900 mt-1">{student?.currentSemester || 'N/A'}</p>
                        </div>


                    </div>
                </Card>
            </div>
        </div>
    );
};

export default StudentProfile;
