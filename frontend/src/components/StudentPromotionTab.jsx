import React, { useState } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { useToast } from '../context/ToastContext';
import { studentAPI } from '../utils/api';

const StudentPromotionTab = () => {
    const [formData, setFormData] = useState({
        department: 'B.A',
        currentSemester: '1',
        targetSemester: '2'
    });
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const handleSemesterChange = (e) => {
        const current = parseInt(e.target.value);
        setFormData({
            ...formData,
            currentSemester: current,
            targetSemester: current + 1
        });
    };

    const handlePromote = async () => {
        if (!confirm(`Are you sure you want to promote ALL students from ${formData.department} Sem ${formData.currentSemester} to Sem ${formData.targetSemester}? This cannot be undone easily.`)) return;
        
        setLoading(true);
        try {
            const res = await studentAPI.promote(formData);
            toast.success(res.data.message);
        } catch (err) {
            toast.error(err.response?.data?.message || "Promotion Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in-up max-w-2xl mx-auto">
            <h1 className="text-2xl font-heading font-bold text-gray-900 mb-6">Bulk Student Promotion</h1>
            
            <Card className="p-8">
                <div className="flex items-center gap-4 mb-6 bg-blue-50 p-4 rounded-lg text-blue-800 border border-blue-100">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    <div>
                        <h3 className="font-bold">Batch Promotion</h3>
                        <p className="text-sm">Move an entire batch of students to the next semester with one click.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Department</label>
                        <select 
                            className="w-full border-gray-300 rounded-lg shadow-sm p-3"
                            value={formData.department}
                            onChange={(e) => setFormData({...formData, department: e.target.value})}
                        >
                            <option value="B.A">B.A (Bachelor of Arts)</option>
                            <option value="B.Sc">B.Sc (Bachelor of Science)</option>
                            <option value="B.Com">B.Com (Bachelor of Commerce)</option>
                            <option value="B.Ed">B.Ed (Bachelor of Education)</option>
                            <option value="D.El.Ed">D.El.Ed (BTC)</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-8 items-center">
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Current Semester</label>
                            <select 
                                className="w-full border-gray-300 rounded-lg shadow-sm p-3 bg-white"
                                value={formData.currentSemester}
                                onChange={handleSemesterChange}
                            >
                                {[1,2,3,4,5,6,7].map(s => <option key={s} value={s}>Semester {s}</option>)}
                            </select>
                            <div className="absolute top-10 right-[-20px] text-gray-400 z-10">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </div>
                        </div>

                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">Target Semester</label>
                             <div className="w-full border-gray-300 rounded-lg shadow-sm p-3 bg-gray-100 font-bold text-gray-600">
                                 Semester {formData.targetSemester}
                             </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button 
                            onClick={handlePromote} 
                            isLoading={loading}
                            className="w-full py-4 text-lg bg-green-600 hover:bg-green-700 shadow-lg"
                        >
                            Promote Students
                        </Button>
                        <p className="text-center text-xs text-gray-400 mt-3">
                            This action will update the student records in the database.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default StudentPromotionTab;
