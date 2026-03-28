import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing token
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
             // Optional: Validate token here with an API call
        }
        setLoading(false);
    }, []);

    const loginStudent = async (identifier, password) => {
        try {
            const res = await axios.post(`${API_URL}/student/auth/login`, { identifier, password });
            if (res.data.success) {
                const { token, student } = res.data;
                const usr = { ...student, role: 'student' };
                
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(usr));
                setUser(usr);
                return { success: true };
            }
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.message || 'Login failed' 
            };
        }
    };
    
    // Admin login is handled directly in AdminLogin component but better to unify here.
    // However, existing AdminLogin handles it. Let's provide a consistent update method.
    const updateAuth = (usr, score) => {
         // Helper to update state if login happens outside context
         setUser(usr);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/';
    };

    const value = {
        user,
        loading,
        loginStudent,
        logout,
        updateAuth,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
