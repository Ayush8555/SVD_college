import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const StudentSignup = () => {
    const [step, setStep] = useState(1); // 1: Info, 2: Verification
    const [formData, setFormData] = useState({ rollNumber: '', email: '', password: '', otp: '' });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/student/auth/signup`, {
                rollNumber: formData.rollNumber,
                email: formData.email,
                password: formData.password
            });
            if(res.data.success) {
                setStep(2);
                setMsg({ type: 'success', text: 'OTP has been sent to your email.' });
            }
        } catch (err) {
            setMsg({ type: 'error', text: err.response?.data?.message || 'Signup failed' });
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/student/auth/verify`, {
                email: formData.email,
                otp: formData.otp
            });
            if(res.data.success) {
                // Store and Redirect
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify({...res.data.student, role: 'student'}));
                // Hard reload to refresh context
                window.location.href = '/student'; 
            }
        } catch (err) {
            setMsg({ type: 'error', text: err.response?.data?.message || 'Invalid OTP' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 font-sans flex flex-col">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white py-12 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
                </div>
                <div className="max-w-4xl mx-auto px-4 relative z-10">
                    <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4 group">
                        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span className="text-sm font-medium">Back to Home</span>
                    </Link>
                    <div className="text-center">
                        <h1 className="text-3xl md:text-4xl font-heading font-extrabold mb-2 tracking-tight">
                            Activate Your Account
                        </h1>
                        <p className="text-blue-100">
                            Verify your details to access the student portal
                        </p>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50" style={{ clipPath: 'ellipse(70% 100% at 50% 100%)' }}></div>
            </div>

            <div className="flex-grow flex items-start justify-center py-12 px-4 sm:px-6 -mt-6">
                <div className="w-full max-w-md">
                    <Card className="shadow-2xl bg-white border-t-4 border-t-primary-600 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-100 to-transparent opacity-50 rounded-bl-full"></div>
                        
                        <div className="relative z-10 p-8">
                            {msg && (
                                <div className={`mb-6 p-4 rounded-lg text-sm border flex items-start gap-3 animate-fade-in ${msg.type === 'success' ? 'bg-green-50 text-green-800 border-green-100' : 'bg-red-50 text-red-800 border-red-100'}`}>
                                    <span className="text-lg">{msg.type === 'success' ? '✅' : '⚠️'}</span>
                                    <p>{msg.text}</p>
                                </div>
                            )}

                            {step === 1 ? (
                                <>
                                    <div className="text-center mb-6">
                                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-100 text-primary-700 mb-3">
                                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                            </svg>
                                        </div>
                                        <h2 className="text-xl font-heading font-bold text-gray-900">Create Account</h2>
                                        <p className="text-gray-600 text-sm mt-1">Enter your student details</p>
                                    </div>

                                    <form onSubmit={handleSignup} className="space-y-5">
                                        <Input label="Roll Number" name="rollNumber" placeholder="e.g. SVD23005" onChange={handleChange} required className="bg-gray-50 focus:bg-white" />
                                        <Input label="Email Address" name="email" type="email" placeholder="you@example.com" onChange={handleChange} required className="bg-gray-50 focus:bg-white" />
                                        <Input label="Create Password" name="password" type="password" placeholder="••••••••" onChange={handleChange} required className="bg-gray-50 focus:bg-white" />
                                        
                                        <div className="pt-2">
                                            <Button type="submit" className="w-full shadow-xl bg-primary-600 hover:bg-primary-700 py-4 transition-all hover:shadow-2xl hover:-translate-y-0.5" isLoading={loading}>
                                                Send Verification OTP
                                            </Button>
                                        </div>
                                    </form>
                                </>
                            ) : (
                                <>
                                    <div className="text-center mb-6">
                                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 text-green-700 mb-3">
                                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <h2 className="text-xl font-heading font-bold text-gray-900">Verify Email</h2>
                                        <p className="text-gray-600 text-sm mt-1">Enter the code sent to your email</p>
                                    </div>

                                    <form onSubmit={handleVerify} className="space-y-6">
                                        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-xl border border-blue-100/50 text-center">
                                            <p className="text-sm text-gray-700">
                                                Check <strong className="text-primary-700">{formData.email}</strong> for the OTP code
                                            </p>
                                        </div>
                                        <Input label="Enter OTP Code" name="otp" placeholder="123456" onChange={handleChange} required className="text-center text-2xl tracking-widest font-mono" />
                                        <Button type="submit" className="w-full shadow-xl py-4 transition-all hover:shadow-2xl hover:-translate-y-0.5" isLoading={loading}>
                                            Verify & Access Dashboard
                                        </Button>
                                    </form>
                                </>
                            )}
                            
                            <div className="mt-6 pt-6 border-t border-gray-100 text-center text-sm">
                                <Link to="/student/login" className="text-primary-600 hover:text-primary-800 font-medium">
                                    Already have an account? Login here
                                </Link>
                            </div>
                        </div>
                    </Card>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-400 uppercase tracking-widest">
                            SVD Gurukul Mahavidyalaya
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentSignup;
