import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';

const StudentLogin = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { loginStudent } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await loginStudent(identifier, password);
    if (result.success) {
        navigate('/student');
    } else {
        setError(result.message);
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 font-sans flex flex-col">
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
                        Student Access
                    </div>
                    <h1 className="text-4xl md:text-5xl font-heading font-extrabold mb-3 tracking-tight">
                        Student Portal
                    </h1>
                    <p className="text-blue-100 text-lg max-w-2xl mx-auto">
                        Access your academic dashboard and examination records
                    </p>
                </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50" style={{ clipPath: 'ellipse(70% 100% at 50% 100%)' }}></div>
        </div>

        {/* Main Content */}
        <div className="flex-grow flex items-start justify-center py-12 px-4 sm:px-6 -mt-8">
            <div className="w-full max-w-md">
                <Card className="shadow-2xl bg-white border-t-4 border-t-primary-600 relative overflow-hidden">
                    {/* Decorative corner accent */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-100 to-transparent opacity-50 rounded-bl-full"></div>
                    
                    <div className="relative z-10 p-8">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-700 mb-4">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                                Welcome Back
                            </h2>
                            <p className="text-gray-600 text-sm">
                                Sign in to access your student dashboard
                            </p>
                        </div>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <Input
                                label="Roll Number or Email"
                                id="identifier"
                                placeholder="Enter your Roll Number"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                required
                                className="bg-gray-50 focus:bg-white transition-colors"
                            />
                            <Input
                                label="Password"
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-gray-50 focus:bg-white transition-colors"
                            />
                            
                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg animate-fade-in">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                                            <span className="text-red-600 text-sm">⚠️</span>
                                        </div>
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                </div>
                            )}

                            <Button 
                                type="submit" 
                                className="w-full bg-primary-600 hover:bg-primary-700 shadow-xl py-4 text-base font-bold transition-all hover:shadow-2xl hover:-translate-y-0.5" 
                                isLoading={loading}
                            >
                                {loading ? 'Signing In...' : 'Access Dashboard'}
                            </Button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <div className="text-center text-sm mb-4">
                                <span className="text-gray-500">First time using the portal? </span>
                                <Link to="/student/signup" className="font-bold text-primary-700 hover:text-primary-900 transition-colors">
                                    Activate Account
                                </Link>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-lg text-xs text-blue-800 text-center leading-relaxed">
                                If you have forgotten your password, please contact the Administration Office with your ID card.
                            </div>
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

export default StudentLogin;
