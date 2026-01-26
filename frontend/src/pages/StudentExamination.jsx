import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const StudentExamination = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const { error } = useToast();

    useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${API_URL}/results/my`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if(data.success) {
                setResults(data.data.results);
            }
        } catch (err) {
            console.error(err);
            error('Failed to load examination history.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading Examination Records...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Examination Results</h1>
                <p className="text-sm text-gray-500 mt-1">View and download your semester grade sheets.</p>
            </div>

            {results.length === 0 ? (
                <Card className="text-center py-12">
                    <p className="text-gray-500">No examination results declared yet.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {results.map((result) => (
                        <Card key={result._id} className="hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-2">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                                        result.result === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                        {result.semester}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-gray-900">Semester {result.semester}</h3>
                                            <Badge variant={result.result === 'Pass' ? 'success' : 'danger'} size="sm">
                                                {result.result}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {result.examType} • {result.academicYear} • Held on {new Date(result.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-gray-100 pt-4 md:pt-0">
                                    <div className="text-center">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">SGPA</p>
                                        <p className="text-lg font-bold text-blue-600 font-mono">{result.sgpa}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Percentage</p>
                                        <p className="text-lg font-bold text-gray-700 font-mono">{result.percentage}%</p>
                                    </div>
                                    
                                    <Link 
                                        to={`/student/result/${result._id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center px-4 py-2 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                    >
                                        View Marksheet
                                        <svg className="ml-2 -mr-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentExamination;
