import React, { useState } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import Card from '../ui/Card';
import Button from '../ui/Button';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const SettingsTab = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [errors, setErrors] = useState({});
    const toast = useToast();

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.currentPassword) {
            newErrors.currentPassword = 'Current password is required';
        }
        
        if (!formData.newPassword) {
            newErrors.newPassword = 'New password is required';
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = 'Password must be at least 6 characters';
        }
        
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your new password';
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`${API_URL}/admin/change-password`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            toast.success(res.data.message || 'Password changed successfully!');
            
            // Clear form
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setErrors({});
            
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to change password';
            toast.error(message);
            
            // Set specific field error if it's about current password
            if (message.toLowerCase().includes('current')) {
                setErrors({ currentPassword: message });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const EyeIcon = ({ show }) => (
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {show ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            ) : (
                <>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </>
            )}
        </svg>
    );

    return (
        <div className="max-w-2xl mx-auto animate-fade-in-up">
            <div className="mb-6">
                <h1 className="text-2xl font-heading font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500 mt-1">Manage your account security and preferences.</p>
            </div>

            <Card title="Change Password" className="border-t-4 border-t-primary-600">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Current Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Current Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.current ? 'text' : 'password'}
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors ${
                                    errors.currentPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="Enter your current password"
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('current')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-gray-600"
                            >
                                <EyeIcon show={showPasswords.current} />
                            </button>
                        </div>
                        {errors.currentPassword && (
                            <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>
                        )}
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.new ? 'text' : 'password'}
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors ${
                                    errors.newPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="Enter new password (min 6 characters)"
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('new')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-gray-600"
                            >
                                <EyeIcon show={showPasswords.new} />
                            </button>
                        </div>
                        {errors.newPassword && (
                            <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.confirm ? 'text' : 'password'}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors ${
                                    errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="Confirm your new password"
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('confirm')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-gray-600"
                            >
                                <EyeIcon show={showPasswords.confirm} />
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                        )}
                    </div>

                    {/* Security Tips */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex gap-3">
                            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div>
                                <h4 className="text-sm font-semibold text-amber-800">Security Tips</h4>
                                <ul className="text-sm text-amber-700 mt-1 space-y-1 list-disc list-inside">
                                    <li>Use at least 8 characters with a mix of letters, numbers & symbols</li>
                                    <li>Avoid using common words or personal information</li>
                                    <li>Don't reuse passwords from other accounts</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4 border-t">
                        <Button
                            type="submit"
                            isLoading={loading}
                            className="px-8"
                        >
                            Update Password
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default SettingsTab;
