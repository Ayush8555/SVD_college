import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const AdminLogin = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        const response = await axios.post(`${API_URL}/admin/auth/login`, { employeeId, password });
        const { token, admin } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({ ...admin, role: 'admin' }));
        
        // Hard redirect to ensure state refresh
        window.location.href = '/admin'; 
    } catch (err) {
        console.error('Login Error:', err);
        setError(err.response?.data?.message || 'Authentication failed. Please check credentials.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 font-sans flex flex-col">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gray-600 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-gray-700 rounded-full blur-3xl"></div>
          </div>
          <div className="max-w-4xl mx-auto px-4 relative z-10">
              <Link to="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6 group">
                  <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span className="text-sm font-medium">Back to Home</span>
              </Link>
              <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-bold uppercase tracking-widest mb-4">
                      <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
                      Restricted Access
                  </div>
                  <h1 className="text-4xl md:text-5xl font-heading font-extrabold mb-3 tracking-tight">
                      Administrator Login
                  </h1>
                  <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                      Secure portal for authorized personnel only
                  </p>
              </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50" style={{ clipPath: 'ellipse(70% 100% at 50% 100%)' }}></div>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex items-start justify-center py-12 px-4 sm:px-6 -mt-8">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl bg-white border-t-4 border-t-gray-800 relative overflow-hidden">
            {/* Decorative corner accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-100 to-transparent opacity-50 rounded-bl-full"></div>
            
            <div className="relative z-10 p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-800 mb-4 border-2 border-gray-200">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                  Secure Access
                </h2>
                <p className="text-gray-600 text-sm">
                  Enter your administrative credentials
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <Input
                    id="employeeId"
                    type="text"
                    label="Admin ID"
                    placeholder="SVD2601"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    required
                    className="bg-gray-50 focus:bg-white transition-colors"
                />

                <Input
                    id="password"
                    type="password"
                    label="Password"
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
                                <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-red-800">Authentication Failed</h3>
                                <p className="text-sm text-red-700 mt-1">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                <Button
                  type="submit"
                  className="w-full py-4 text-base font-bold shadow-xl bg-gray-900 hover:bg-gray-800 transition-all hover:shadow-2xl hover:-translate-y-0.5"
                  isLoading={loading}
                >
                  {loading ? 'Authenticating...' : 'Secure Login'}
                </Button>
              </form>
              
              <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                 <p className="text-xs text-gray-400">
                    © {new Date().getFullYear()} SVD Gurukul Mahavidyalaya. <br/> System maintained by IT Cell.
                 </p>
              </div>
            </div>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400 uppercase tracking-widest">
              Administration Portal
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
