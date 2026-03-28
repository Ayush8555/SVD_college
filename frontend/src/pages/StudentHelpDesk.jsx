import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const StudentHelpDesk = () => {
    const [queries, setQueries] = useState([]);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const { success, error } = useToast();

    useEffect(() => {
        fetchQueries();
    }, []);

    const fetchQueries = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${API_URL}/queries/my`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setQueries(data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.post(`${API_URL}/queries`, 
                { subject, message },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success) {
                success('Query submitted successfully');
                setSubject('');
                setMessage('');
                fetchQueries(); // Refresh list
            }
        } catch (err) {
            error(err.response?.data?.message || 'Failed to submit query');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Student Help Desk</h1>
                <p className="text-sm text-gray-500 mt-1">Submit your queries regarding examinations, results, or academic issues.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Submit Query Form */}
                <div className="lg:col-span-1">
                    <Card>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Ask a new query</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                label="Subject"
                                id="subject"
                                placeholder="e.g. Result Correction, Marksheet Issue"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                required
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                                <textarea
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3 min-h-[120px]"
                                    placeholder="Describe your issue in detail..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" isLoading={submitting} className="w-full">
                                Submit Query
                            </Button>
                        </form>
                    </Card>
                </div>

                {/* Past Queries List */}
                <div className="lg:col-span-2">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">My Past Queries</h2>
                    {loading ? (
                        <div className="text-gray-500">Loading queries...</div>
                    ) : queries.length === 0 ? (
                        <Card className="text-center py-12">
                            <p className="text-gray-500">You haven't submitted any queries yet.</p>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {queries.map((q) => (
                                <Card key={q._id} className="border border-gray-100">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-gray-800">{q.subject}</h3>
                                        <Badge variant={
                                            q.status === 'Resolved' ? 'success' : 
                                            q.status === 'Open' ? 'warning' : 'secondary'
                                        }>
                                            {q.status}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3 bg-gray-50 p-3 rounded-md">{q.message}</p>
                                    <p className="text-xs text-gray-400 mb-4">Submitted on {new Date(q.createdAt).toLocaleDateString()}</p>
                                    
                                    {q.adminReply && (
                                        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-md">
                                            <p className="text-xs font-bold text-blue-800 mb-1 uppercase tracking-wide">Admin Reply</p>
                                            <p className="text-sm text-blue-900">{q.adminReply}</p>
                                        </div>
                                    )}
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentHelpDesk;
