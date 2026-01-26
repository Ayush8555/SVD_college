import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar'; // Assuming Admin uses common structure or custom layout
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const AdminHelpDesk = () => {
    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { success, error } = useToast();

    useEffect(() => {
        fetchQueries();
    }, []);

    const fetchQueries = async () => {
        try {
            const token = localStorage.getItem('token'); // Admin Token
            const { data } = await axios.get(`${API_URL}/queries/admin/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if(data.success) {
                setQueries(data.data);
            }
        } catch (err) {
            console.error(err);
            error('Failed to load queries');
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (queryId) => {
        if(!replyMessage.trim()) return;
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.put(`${API_URL}/queries/${queryId}/reply`, 
                { reply: replyMessage, status: 'Resolved' },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if(data.success) {
                success('Reply sent successfully');
                setReplyingTo(null);
                setReplyMessage('');
                fetchQueries();
            }
        } catch (err) {
            error('Failed to send reply');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Student Help Desk</h1>
            
            {loading ? (
                <p>Loading queries...</p>
            ) : queries.length === 0 ? (
                <Card className="text-center py-12">
                    <p className="text-gray-500">No queries found.</p>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {queries.map((q) => (
                        <Card key={q._id} className={q.status === 'Resolved' ? 'opacity-75' : 'border-l-4 border-l-blue-500'}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-lg">{q.student?.firstName} {q.student?.lastName}</h3>
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{q.student?.rollNumber}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-2">{q.student?.department} • {new Date(q.createdAt).toLocaleString()}</p>
                                    
                                    <h4 className="font-bold text-gray-800 text-sm mt-3 uppercase tracking-wide">Query: {q.subject}</h4>
                                    <p className="text-gray-700 bg-gray-50 p-3 rounded mt-1 mb-4">{q.message}</p>
                                </div>
                                <Badge variant={q.status === 'Resolved' ? 'success' : 'warning'}>{q.status}</Badge>
                            </div>

                            {q.adminReply ? (
                                <div className="bg-green-50 border border-green-100 p-3 rounded-md mt-2">
                                    <p className="text-xs text-green-700 font-bold uppercase mb-1">Your Reply</p>
                                    <p className="text-sm text-green-900">{q.adminReply}</p>
                                </div>
                            ) : (
                                <div>
                                    {replyingTo === q._id ? (
                                        <div className="mt-4 animate-fade-in">
                                            <textarea
                                                className="w-full border rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                                rows={3}
                                                placeholder="Write your reply..."
                                                value={replyMessage}
                                                onChange={(e) => setReplyMessage(e.target.value)}
                                            ></textarea>
                                            <div className="flex gap-2 mt-2 justify-end">
                                                <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>Cancel</Button>
                                                <Button size="sm" isLoading={submitting} onClick={() => handleReply(q._id)}>Send Reply</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <Button size="sm" variant="outline" onClick={() => setReplyingTo(q._id)}>
                                            Reply to Student
                                        </Button>
                                    )}
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminHelpDesk;
