import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import Background3D from '../../components/Background3D';

const StudentLogin = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);
    const { loginStudent } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Simulate a "processing" feel
        await new Promise(resolve => setTimeout(resolve, 800));

        const result = await loginStudent(identifier, password);
        if (result.success) {
            navigate('/student');
        } else {
            setError(result.message);
            setLoading(false);
        }
    };

    // Input Focus Handlers
    const handleFocus = (id) => setFocusedInput(id);
    const handleBlur = () => setFocusedInput(null);

    return (
        <div className="min-h-screen bg-slate-900 font-sans flex items-center justify-center relative overflow-hidden text-slate-100">
            {/* 1. Dynamic 3D Universe Background */}
            <div className="fixed inset-0 z-0 text-slate-900">
                 <Background3D />
            </div>

            {/* 2. Ambient Overlay Gradients for Depth */}
            <div className="fixed inset-0 z-0 bg-gradient-to-t from-blue-900/20 via-transparent to-black/40 pointer-events-none"></div>
            <div className="fixed -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="fixed -top-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>


            {/* 3. Main Content Container */}
            
            {/* Desktop Back Button */}
            <Link to="/" className="fixed top-8 left-8 z-50 hidden lg:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-blue-300 hover:text-white hover:bg-white/10 transition-all hover:scale-105 group">
                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="text-sm font-medium">Back to Home</span>
            </Link>

            <div className="relative z-10 w-full max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center h-full min-h-screen py-10">
                
                {/* Left Side: Inspiration/Welcome (Desktop & Mobile Optimized) */}
                <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="flex flex-col justify-center space-y-6 lg:space-y-8 text-center lg:text-left order-first"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md w-fit mx-auto lg:mx-0">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                        </span>
                        <span className="text-cyan-300 text-[10px] lg:text-xs font-bold tracking-widest uppercase">Student Portal v2.0</span>
                    </div>

                    <h1 className="text-4xl lg:text-6xl font-heading font-extrabold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-slate-400 drop-shadow-2xl">
                        Welcome to the <br/>
                        <span className="text-blue-400 relative">
                            Future
                            <svg className="absolute w-full h-2 lg:h-3 -bottom-1 left-0 text-blue-500 opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none" />
                            </svg>
                        </span>
                        of Learning
                    </h1>
                    
                    <p className="text-base lg:text-lg text-blue-200/80 max-w-lg leading-relaxed font-light mx-auto lg:mx-0">
                        Access your academic universe. Check results, manage your profile, and shape your career with SVD Gurukul's next-gen digital platform.
                    </p>

                    {/* Features - Hidden on small mobile to save space, visible on large mobile/desktop */}
                    <div className="hidden sm:flex gap-4 justify-center lg:justify-start">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-3 slide-up-hover">
                            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">Real-time Results</h4>
                                <p className="text-xs text-slate-400">Instant updates</p>
                            </div>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-3 slide-up-hover">
                             <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                             </div>
                            <div>
                                <h4 className="font-bold text-sm">Secure Access</h4>
                                <p className="text-xs text-slate-400">End-to-end encrypted</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right Side: Levitating Glass Login Card */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                    className="w-full max-w-md mx-auto relative perspective-1000"
                >
                    {/* Floating Glow Behind Card */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-500/20 blur-[60px] rounded-full pointer-events-none animate-pulse-slow"></div>

                    {/* The Card */}
                    <div className="relative bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-hidden hover:shadow-blue-500/10 transition-shadow duration-500">
                        {/* Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-40 pointer-events-none"></div>
                        
                        <div className="relative z-10">
                            {/* Header */}
                            <div className="text-center mb-10">
                                <Link to="/" className="inline-block mb-6 hover:scale-110 transition-transform">
                                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>
                                    </div>
                                </Link>
                                <h2 className="text-3xl font-heading font-bold text-white mb-2">Student Login</h2>
                                <p className="text-blue-200/60 text-sm">Enter your credentials to continue</p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Identifier Input */}
                                <div className="space-y-2 relative group">
                                    <label className="text-xs font-bold text-blue-300 uppercase tracking-wider ml-1">Roll Number / Email</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <svg className={`h-5 w-5 transition-colors duration-300 ${focusedInput === 'identifier' ? 'text-blue-400' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            id="identifier"
                                            className={`block w-full pl-11 pr-4 py-4 bg-slate-800/50 border ${focusedInput === 'identifier' ? 'border-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.3)]' : 'border-white/10'} rounded-xl text-white placeholder-slate-500 focus:outline-none focus:bg-slate-800/80 transition-all duration-300`}
                                            placeholder="e.g. 2026001"
                                            value={identifier}
                                            onChange={(e) => setIdentifier(e.target.value)}
                                            onFocus={() => handleFocus('identifier')}
                                            onBlur={handleBlur}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Password Input */}
                                <div className="space-y-2 relative group">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-xs font-bold text-blue-300 uppercase tracking-wider">Password</label>
                                        <a href="#" className="text-xs text-blue-400 hover:text-white transition-colors">Forgot?</a>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <svg className={`h-5 w-5 transition-colors duration-300 ${focusedInput === 'password' ? 'text-blue-400' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="password"
                                            id="password"
                                            className={`block w-full pl-11 pr-4 py-4 bg-slate-800/50 border ${focusedInput === 'password' ? 'border-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.3)]' : 'border-white/10'} rounded-xl text-white placeholder-slate-500 focus:outline-none focus:bg-slate-800/80 transition-all duration-300`}
                                            placeholder="DOB e.g. 2002/05/15"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            onFocus={() => handleFocus('password')}
                                            onBlur={handleBlur}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Error Message */}
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-start gap-3 overflow-hidden"
                                        >
                                            <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="text-sm text-red-200">{error}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Submit Button with Magnetic/Neon feel */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-4 rounded-xl font-bold text-lg relative overflow-hidden group transition-all duration-300 ${
                                        loading ? 'bg-slate-700 cursor-not-allowed text-slate-400' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 hover:shadow-blue-500/50'
                                    }`}
                                >
                                    {/* Shine Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                                    
                                    <div className="relative flex items-center justify-center gap-2">
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span>Authenticating...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Access Dashboard</span>
                                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                            </>
                                        )}
                                    </div>
                                </motion.button>
                            </form>

                            {/* Footer links */}
                            <div className="mt-8 pt-6 border-t border-white/5 text-center">
                                <p className="text-slate-400 text-sm">
                                    Don't have an account?{' '}
                                    <Link to="/contact" className="text-blue-400 font-semibold hover:text-white transition-colors relative group">
                                        Contact Admin
                                        <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300"></span>
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Mobile Only: Back to Home */}
                    <div className="lg:hidden mt-8 text-center">
                        <Link to="/" className="text-blue-300/60 hover:text-white text-sm flex items-center justify-center gap-2 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                            Back to Home
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default StudentLogin;
