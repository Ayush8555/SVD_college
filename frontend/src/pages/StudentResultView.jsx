import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ResultDisplay from '../components/ResultDisplay';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const StudentResultView = () => {
    const { id } = useParams();
    const [resultData, setResultData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const token = localStorage.getItem('token');
                const { data } = await axios.get(`${API_URL}/results/my/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if(data.success) {
                    setResultData(data.data);
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load result. Access denied or invalid ID.');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchResult();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
                    <div className="p-3 bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Result</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link to="/student/dashboard" className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text- white bg-blue-600 hover:bg-blue-700 text-white">
                        Return to Student Portal
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto mb-6">
                <Link to="/student/dashboard" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Student Portal
                </Link>
            </div>
            
            <ResultDisplay 
                result={resultData.result} 
                student={resultData.student} 
                collegeName="SVD Gurukul Mahavidyalaya"
                collegeAddress="Dumduma, Unchgaon, Jaunpur, Uttar Pradesh - 223102"
            />
        </div>
    );
};

export default StudentResultView;
