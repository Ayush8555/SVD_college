import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { createGrievance } from '../../services/grievanceService';

const CreateGrievanceModal = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        category: 'Academic',
        subject: '',
        description: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createGrievance(formData);
            onSuccess();
            onClose();
            setFormData({ category: 'Academic', subject: '', description: '' });
        } catch (error) {
            alert('Failed to submit ticket');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-800">New Support Ticket</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select 
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.category}
                            onChange={e => setFormData({...formData, category: e.target.value})}
                        >
                            <option>Academic</option>
                            <option>Fee</option>
                            <option>Result</option>
                            <option>Infrastructure</option>
                            <option>Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                        <input 
                            type="text"
                            required
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Briefly describe the issue..."
                            value={formData.subject}
                            onChange={e => setFormData({...formData, subject: e.target.value})}
                            maxLength={100}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea 
                            required
                            rows="4"
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            placeholder="Provide detailed information..."
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            maxLength={1000}
                        ></textarea>
                        <div className="text-right text-xs text-gray-400 mt-1">
                            {formData.description.length}/1000
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                        {loading && <Loader2 className="animate-spin" size={18} />}
                        Submit Ticket
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateGrievanceModal;
