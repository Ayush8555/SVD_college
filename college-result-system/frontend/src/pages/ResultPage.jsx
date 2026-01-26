import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import ResultDisplay from '../components/ResultDisplay'; 

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const ResultPage = () => {
    const [formData, setFormData] = useState({ rollNumber: '', dateOfBirth: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [resultData, setResultData] = useState(null);
    const location = useLocation();

    // Check for state passed from navigation (e.g. Student Dashboard)
    useEffect(() => {
        if (location.state && location.state.resultData) {
            setResultData(location.state.resultData);
        }
    }, [location]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResultData(null);

        try {
            const { data } = await axios.post(`${API_URL}/results/check`, formData);
            if (data.data.results && data.data.results.length > 0) {
                setResultData({
                    student: data.data.student,
                    result: data.data.results[0] // Show latest
                });
            }
        } catch (err) {
            setError(
                err.response?.data?.message || 'Result not found. Please verify your details.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setResultData(null);
        setFormData({ rollNumber: '', dateOfBirth: '' });
        setError(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 font-sans flex flex-col">
            <Navbar />

            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white py-16 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-400 rounded-full blur-3xl"></div>
                </div>
                <div className="max-w-4xl mx-auto px-4 relative z-10">
                    <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-6 group">
                        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span className="text-sm font-medium">Back to Home</span>
                    </Link>
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-bold uppercase tracking-widest mb-4">
                            <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse"></span>
                            Official Portal
                        </div>
                        <h1 className="text-4xl md:text-5xl font-heading font-extrabold mb-3 tracking-tight">
                            Examination Result Portal
                        </h1>
                        <p className="text-blue-100 text-lg max-w-2xl mx-auto">
                            Access your official semester grade sheets and academic records
                        </p>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50" style={{ clipPath: 'ellipse(70% 100% at 50% 100%)' }}></div>
            </div>

            {/* Main Content Area */}
            <main className="flex-grow flex items-start justify-center py-12 px-4 sm:px-6 -mt-8">
                <div className="w-full max-w-4xl">
                    {!resultData ? (
                        <div className="max-w-xl mx-auto animate-fade-in-up">
                            <Card className="shadow-2xl bg-white border-t-4 border-t-primary-600 relative overflow-hidden">
                                {/* Decorative corner accent */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-100 to-transparent opacity-50 rounded-bl-full"></div>
                                
                                <div className="relative z-10 p-8">
                                    <div className="text-center mb-8">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-700 mb-4">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                                            Check Your Result
                                        </h2>
                                        <p className="text-gray-600 text-sm">
                                            Enter your credentials to view your academic performance
                                        </p>
                                    </div>

                                    <form className="space-y-6" onSubmit={handleSubmit}>
                                        <div className="bg-gradient-to-r from-blue-50 to-primary-50 p-4 rounded-xl border border-blue-100/50 flex items-start gap-3">
                                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl shadow-sm">
                                                🎓
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-700 leading-relaxed">
                                                    Enter your <strong className="text-primary-700">Roll Number</strong> (e.g. SVD23001) and <strong className="text-primary-700">Date of Birth</strong> exactly as registered.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-5">
                                            <Input
                                                label="Roll Number / PRN"
                                                id="rollNumber"
                                                name="rollNumber"
                                                placeholder="Enter your Roll Number"
                                                value={formData.rollNumber}
                                                onChange={handleChange}
                                                required
                                                className="uppercase font-mono text-base tracking-wide"
                                            />
                                            
                                            <Input
                                                label="Date of Birth"
                                                id="dateOfBirth"
                                                name="dateOfBirth"
                                                type="date"
                                                value={formData.dateOfBirth}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        {error && (
                                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg animate-fade-in">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-bold text-red-800">Result Not Found</h3>
                                                        <p className="text-sm text-red-700 mt-1">{error}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <Button 
                                            type="submit" 
                                            className="w-full py-4 text-base font-bold shadow-xl bg-primary-900 hover:bg-primary-800 transition-all hover:shadow-2xl hover:-translate-y-0.5" 
                                            isLoading={loading}
                                        >
                                            {loading ? 'Searching...' : 'View Result'}
                                        </Button>
                                    </form>

                                    <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                                        <p className="text-xs text-gray-500">
                                            Having trouble? Contact the <a href="/contact" className="text-primary-600 font-semibold hover:underline">Examination Cell</a>
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            <div className="mt-6 text-center">
                                <p className="text-xs text-gray-400 uppercase tracking-widest">
                                    SVD Gurukul Mahavidyalaya • Examination Cell
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-fade-in-up">
                            <button 
                                onClick={handleClear}
                                className="mb-6 inline-flex items-center gap-2 text-primary-700 bg-white px-5 py-2.5 rounded-lg shadow-md font-medium hover:bg-primary-50 hover:shadow-lg transition-all border border-gray-200"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Search Another Result
                            </button>
                            
                            <ResultDisplay 
                                result={resultData.result} 
                                student={resultData.student} 
                                collegeName="SVD Gurukul Mahavidyalaya"
                                collegeAddress="Dumduma, Unchgaon, Jaunpur, Uttar Pradesh"
                            />
                        </div>
                    )}
                </div>
            </main>

            <footer className="bg-gradient-to-br from-primary-950 via-primary-900 to-primary-950 text-white py-8 border-t border-primary-800 mt-auto">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="font-heading font-semibold text-lg tracking-wider opacity-90">SVD Gurukul Mahavidyalaya</p>
                    <p className="text-primary-300 text-sm mt-1">Dumduma, Unchgaon, Jaunpur, Uttar Pradesh</p>
                </div>
            </footer>
        </div>
    );
};

export default ResultPage;
