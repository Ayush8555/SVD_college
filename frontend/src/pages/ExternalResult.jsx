import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const ExternalResult = () => {
    const [formData, setFormData] = useState({ rollNo: '', dob: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [resultData, setResultData] = useState(null); // Stores list or detail
    const [viewingDetail, setViewingDetail] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResultData(null);
        setViewingDetail(false);

        try {
            const { data } = await axios.post(`${API_URL}/results/external`, formData);
            if (data.success) {
                setResultData(data.data);
            } else {
                setError(data.message || 'Failed to fetch result.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error connecting to result server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = async (targetUrl) => {
        setLoading(true);
        setError(null);
        
        try {
            const { data } = await axios.post(`${API_URL}/results/external`, {
                ...formData,
                targetUrl
            });

            if (data.success && data.data.type === 'detail') {
                setResultData(data.data);
                setViewingDetail(true);
            } else {
                setError('Failed to load the marksheet.');
            }
        } catch (err) {
            setError('Error loading marksheet.');
        } finally {
            setLoading(false);
        }
    };

    const resetSearch = () => {
        setResultData(null);
        setViewingDetail(false);
        setFormData({ rollNo: '', dob: '' });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Navbar />
            
            <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-gray-900">University Result Portal</h1>
                        <p className="mt-2 text-gray-600">Check your semester results (VBSPU)</p>
                    </div>

                    {!resultData ? (
                        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="rollNo" className="block text-sm font-medium text-gray-700">Roll Number</label>
                                    <input
                                        type="text"
                                        name="rollNo"
                                        id="rollNo"
                                        required
                                        value={formData.rollNo}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                                        placeholder="Enter Roll Number"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                    <input
                                        type="date"
                                        name="dob"
                                        id="dob"
                                        required
                                        value={formData.dob}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors"
                                >
                                    {loading ? 'Fetching...' : 'View Result'}
                                </button>
                                
                                <div className="mt-6 text-center border-t pt-4">
                                    <p className="text-sm text-gray-500 mb-2">Facing issues?</p>
                                    <a 
                                        href="https://vbspuresult.org.in/Home/SemesterResult?SemesterType=Odd&Session=2025-26" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors"
                                    >
                                        Visit Official University Portal →
                                    </a>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="bg-white p-6 rounded-2xl shadow-xl overflow-hidden animation-fade-in-up">
                            <div className="flex justify-between items-center mb-6">
                                <button 
                                    onClick={viewingDetail ? () => { setViewingDetail(false); handleSubmit({ preventDefault: () => {} }); } : resetSearch}
                                    className="text-sm text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1"
                                >
                                    ← {viewingDetail ? 'Back to List' : 'Check Another Result'}
                                </button>
                                {loading && <span className="text-gray-500 text-sm">Loading...</span>}
                            </div>
                            
                            {/* Render sanitized HTML for Detail View */}
                            {resultData.type === 'detail' ? (
                                <div className="prose max-w-none result-content overflow-x-auto">
                                    <div dangerouslySetInnerHTML={{ __html: resultData.htmlContent }} />
                                </div>
                            ) : (
                                /* Render List View */
                                <div className="result-list">
                                    <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Result History</h3>
                                    
                                    {resultData.results && resultData.results.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Year/Sem</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enroll/Roll No</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {resultData.results.map((result, idx) => (
                                                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                                                {result.semester || 'N/A'}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {result.rollNo}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${result.status?.includes('PASS') ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                                    {result.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                <button
                                                                    onClick={() => handleViewDetail(result.viewLink)}
                                                                    disabled={!result.viewLink || loading}
                                                                    className="text-primary-600 hover:text-primary-900 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    View Result
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 text-gray-500">
                                            No results found in the history.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
            
            <Footer />
        </div>
    );
};

export default ExternalResult;
