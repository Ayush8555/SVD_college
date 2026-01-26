
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { useToast } from '../context/ToastContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const StudentLoginPage = () => {
    const [credentials, setCredentials] = useState({ rollNumber: '', password: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { loginStudent } = useAuth();
    const { success, error } = useToast();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            
            const result = await loginStudent(credentials.rollNumber, credentials.password);
            
            if (result.success) {
                success('Login successful! Redirecting...');
                navigate('/student/dashboard');
            } else {
                error(result.message || 'Invalid Roll Number or Password');
            }
        } catch (err) {
            console.error(err);
            error('Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-extrabold text-blue-900">Student Portal</h1>
                    <p className="mt-2 text-sm text-gray-600">Access your complete academic history</p>
                </div>

                <Card className="py-8 px-4 shadow sm:rounded-lg sm:px-10 border-t-4 border-blue-600">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <Input
                            label="Roll Number"
                            id="rollNumber"
                            name="rollNumber"
                            type="text"
                            required
                            placeholder="e.g. SVD24001"
                            value={credentials.rollNumber}
                            onChange={handleChange}
                            className="uppercase font-mono"
                        />

                        <div>
                            <Input
                                label="Password"
                                id="password"
                                name="password"
                                type="password"
                                required
                                placeholder="Date of Birth (YYYYMMDD)"
                                value={credentials.password}
                                onChange={handleChange}
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Default password is your DOB (e.g., 20020515)
                            </p>
                        </div>

                        <div>
                            <Button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                isLoading={loading}
                            >
                                Sign in
                            </Button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or</span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-3">
                            <Link to="/" className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default StudentLoginPage;
