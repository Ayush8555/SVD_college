import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { useToast } from '../context/ToastContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const ResultPublishingTab = () => {
    const [filters, setFilters] = useState({
        semester: '1',
        department: '',
        academicYear: '' // Default to All
    });
    const [publishedResults, setPublishedResults] = useState([]);
    const [unpublishedResults, setUnpublishedResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const { success, error } = useToast();

    useEffect(() => {
        fetchResults();
    }, [filters]); // Re-fetch when filters change

    const fetchResults = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            // Clean up empty filters
            const params = {};
            if(filters.semester) params.semester = filters.semester;
            if(filters.department) params.department = filters.department;
            if(filters.academicYear) params.academicYear = filters.academicYear;
            
            const [publishedRes, unpublishedRes] = await Promise.all([
                axios.get(`${API_URL}/admin/results/published`, {
                    params,
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${API_URL}/admin/results/unpublished`, {
                    params,
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setPublishedResults(publishedRes.data.data || []);
            setUnpublishedResults(unpublishedRes.data.data || []);
        } catch (err) {
            console.error(err);
            // Don't show toast on 404 (just empty list), only on real errors
            if (err.response?.status !== 404) {
                 error(err.response?.data?.message || 'Error fetching results');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBulkAction = async (action) => {
        if(!confirm(`Are you sure you want to ${action} ALL results for Semester ${filters.semester}?`)) return;

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const { data } = await axios.post(
                `${API_URL}/admin/results/publish/bulk`,
                { ...filters, action },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            success(data.message);
            fetchResults();
        } catch (err) {
            error(err.response?.data?.message || 'Bulk action failed');
        } finally {
            setLoading(false);
        }
    };

    const togglePublish = async (resultId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `${API_URL}/admin/results/${resultId}/publish`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            success(
                currentStatus ? 'Result unpublished successfully' : 'Result published successfully'
            );
            fetchResults();
        } catch (err) {
            error(err.response?.data?.message || 'Error updating result');
        }
    };

    const ResultCard = ({ result, isPublished }) => (
        <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h4 className="font-bold text-gray-900 text-lg">
                        {result.student?.firstName} {result.student?.lastName}
                    </h4>
                    <p className="text-sm text-gray-600 font-mono">{result.rollNumber}</p>
                </div>
                <Badge variant={isPublished ? 'success' : 'warning'}>
                    {isPublished ? 'Published' : 'Unpublished'}
                </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                <div>
                    <span className="text-gray-500">Department:</span>
                    <span className="ml-2 font-medium">{result.student?.department}</span>
                </div>
                <div>
                    <span className="text-gray-500">Program:</span>
                    <span className="ml-2 font-medium">{result.student?.program}</span>
                </div>
                <div>
                    <span className="text-gray-500">Semester:</span>
                    <span className="ml-2 font-medium">{result.semester}</span>
                </div>
                <div>
                    <span className="text-gray-500">SGPA:</span>
                    <span className="ml-2 font-medium">{result.sgpa}</span>
                </div>
            </div>

            <Button
                onClick={() => togglePublish(result._id, isPublished)}
                className={`w-full ${isPublished ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-600 hover:bg-green-700'}`}
            >
                {isPublished ? 'Unpublish Result' : 'Publish Result'}
            </Button>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Result Publishing</h1>
                <p className="text-sm text-gray-600 mt-1">Manage result visibility for students</p>
            </div>

            {/* Bulk Actions */}
            <Card className="bg-gradient-to-r from-gray-50 to-white border-2 border-indigo-100">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Bulk Actions</h3>
                        <p className="text-sm text-gray-600">Apply actions to all results in a semester</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 items-end">
                        <select 
                             className="rounded-lg border-gray-300 py-2 px-3 text-sm"
                             value={filters.academicYear}
                             onChange={(e) => setFilters({...filters, academicYear: e.target.value})}
                        >
                            <option value="">All Years</option>
                            <option>2023-2024</option>
                            <option>2024-2025</option>
                            <option>2025-2026</option>
                        </select>
                        <select 
                             className="rounded-lg border-gray-300 py-2 px-3 text-sm"
                             value={filters.semester}
                             onChange={(e) => setFilters({...filters, semester: e.target.value})}
                        >
                            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                        </select>
                        <select 
                             className="rounded-lg border-gray-300 py-2 px-3 text-sm"
                             value={filters.department}
                             onChange={(e) => setFilters({...filters, department: e.target.value})}
                        >
                            <option value="">All Departments</option>
                            <option value="Science">Science</option>
                            <option value="Arts">Arts</option>
                            <option value="Commerce">Commerce</option>
                        </select>

                        <div className="flex gap-2">
                            <Button 
                                onClick={() => handleBulkAction('publish')}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                Publish All
                            </Button>
                            <Button 
                                onClick={() => handleBulkAction('unpublish')}
                                className="bg-amber-600 hover:bg-amber-700 text-white"
                            >
                                Unpublish All
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-green-50 border-green-200">
                    <div className="text-center">
                        <p className="text-xs text-green-700 font-medium uppercase">Published</p>
                        <p className="text-3xl font-bold text-green-900 mt-1">{publishedResults.length}</p>
                    </div>
                </Card>
                <Card className="bg-amber-50 border-amber-200">
                    <div className="text-center">
                        <p className="text-xs text-amber-700 font-medium uppercase">Unpublished</p>
                        <p className="text-3xl font-bold text-amber-900 mt-1">{unpublishedResults.length}</p>
                    </div>
                </Card>
                <Card className="bg-blue-50 border-blue-200">
                    <div className="text-center">
                        <p className="text-xs text-blue-700 font-medium uppercase">Total</p>
                        <p className="text-3xl font-bold text-blue-900 mt-1">
                            {publishedResults.length + unpublishedResults.length}
                        </p>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Unpublished Results */}
                <Card className="border-t-4 border-t-amber-500">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Unpublished Results</h3>
                        <Badge variant="warning">{unpublishedResults.length}</Badge>
                    </div>

                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                        {loading ? (
                            <div className="text-center py-8 text-gray-500">Loading...</div>
                        ) : unpublishedResults.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                                No unpublished results
                            </div>
                        ) : (
                            unpublishedResults.map(result => (
                                <ResultCard key={result._id} result={result} isPublished={false} />
                            ))
                        )}
                    </div>
                </Card>

                {/* Published Results */}
                <Card className="border-t-4 border-t-green-500">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Published Results</h3>
                        <Badge variant="success">{publishedResults.length}</Badge>
                    </div>

                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                        {loading ? (
                            <div className="text-center py-8 text-gray-500">Loading...</div>
                        ) : publishedResults.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                                No published results
                            </div>
                        ) : (
                            publishedResults.map(result => (
                                <ResultCard key={result._id} result={result} isPublished={true} />
                            ))
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ResultPublishingTab;
