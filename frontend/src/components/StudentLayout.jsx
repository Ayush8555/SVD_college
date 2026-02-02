import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const StudentLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { success } = useToast();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        success('Logged out successfully');
        navigate('/student/login');
    };

    const navItems = [
        { name: 'Overview', path: '/student/dashboard', icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
        )},
        { name: 'Examination', path: '/student/examination', icon: (
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
        )},
        { name: 'Profile', path: '/student/profile', icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        )},
        { name: 'Help Desk', path: '/student/queries', icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )},
        { name: 'Documents', path: '/student/documents', icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        )},

    ];

    const isDashboard = location.pathname === '/student/dashboard';

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Desktop Sidebar */}
            <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
                <div className="flex items-center gap-3 px-6 h-16 border-b border-gray-100">
                    <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                        <span className="font-bold text-lg">SVD</span>
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-900 leading-tight">SVD Gurukul</h1>
                        <p className="text-xs text-blue-600 font-medium">Student Portal</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto py-4">
                    <nav className="px-3 space-y-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                className={({ isActive }) => `
                                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                                    ${isActive 
                                        ? 'bg-blue-50 text-blue-700' 
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }
                                `}
                            >
                                {item.icon}
                                {item.name}
                            </NavLink>
                        ))}
                    </nav>
                </div>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                            {user?.firstName?.charAt(0) || 'S'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-gray-900 truncate">{user?.firstName} {user?.lastName}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.role || 'Student'}</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </button>
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden flex">
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity" onClick={() => setIsMobileMenuOpen(false)}></div>
                    <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white animate-slide-in-left">
                        <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200">
                            <span className="text-xl font-bold text-gray-900">Menu</span>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-500">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto pt-5 pb-4">
                            <nav className="px-4 space-y-2">
                                {navItems.map((item) => (
                                    <NavLink
                                        key={item.name}
                                        to={item.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={({ isActive }) => `
                                            flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors
                                            ${isActive 
                                                ? 'bg-blue-50 text-blue-700' 
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }
                                        `}
                                    >
                                        {item.icon}
                                        {item.name}
                                    </NavLink>
                                ))}
                            </nav>
                        </div>
                        <div className="border-t border-gray-200 p-4">
                             <button 
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 px-3 py-3 text-base font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Layout Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                 {/* Mobile Header logic with Back button */}
                 <div className="md:hidden bg-white h-16 border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        {!isDashboard ? (
                            <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-gray-600 hover:bg-gray-100 rounded-full">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        ) : (
                             <div className="bg-blue-600 text-white p-1 rounded">
                                <span className="font-bold text-sm">SVD</span>
                            </div>
                        )}
                        <span className="font-bold text-gray-900 text-lg">
                            {navItems.find(i => i.path === location.pathname)?.name || 'Student Portal'}
                        </span>
                    </div>
                    
                    <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-md">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                 </div>
                 
                 {/* Main Content Area */}
                 <div className="flex-1 overflow-auto bg-gray-50 p-4 sm:p-8">
                     <div className="max-w-7xl mx-auto h-full">
                        <Outlet />
                     </div>
                 </div>
            </div>
        </div>
    );
};

export default StudentLayout;
