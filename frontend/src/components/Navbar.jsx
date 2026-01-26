import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Button from './ui/Button';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'About Us', path: '/about' },
        { name: 'Contact', path: '/contact' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-primary-900 text-white shadow-lg border-b-4 border-accent sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-white text-primary-900 rounded-lg flex items-center justify-center font-bold text-xl shadow-inner border-2 border-primary-100 group-hover:scale-105 transition-transform">
                            SVD
                        </div>
                        <div className="leading-tight">
                            <span className="font-heading font-bold text-lg tracking-wide block">SVD Gurukul</span>
                            <span className="text-xs text-primary-300 font-medium tracking-wider">Mahavidyalaya</span>
                        </div>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`text-sm font-medium transition-colors hover:text-accent ${
                                    isActive(link.path) ? 'text-accent font-bold' : 'text-primary-100'
                                }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="h-6 w-px bg-primary-700 mx-2"></div>
                        <Link to="/student/login">
                            <Button size="sm" variant="outline" className="border-primary-400 text-primary-100 hover:bg-primary-800 hover:text-white hover:border-white">
                                Student Portal
                            </Button>
                        </Link>
                         <Link to="/admin/login">
                            <button className="text-xs font-semibold text-primary-400 hover:text-white transition-colors uppercase tracking-wider">
                                Admin
                            </button>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button 
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 rounded-md text-primary-200 hover:text-white hover:bg-primary-800 focus:outline-none"
                    >
                        {isOpen ? (
                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        ) : (
                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-primary-800 border-t border-primary-700 animate-fade-in-up">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className={`block px-3 py-2 rounded-md text-base font-medium ${
                                    isActive(link.path) 
                                    ? 'bg-primary-900 text-white' 
                                    : 'text-primary-200 hover:bg-primary-700 hover:text-white'
                                }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="border-t border-primary-700 my-2 pt-2">
                             <Link 
                                to="/student/login"
                                onClick={() => setIsOpen(false)}
                                className="block w-full text-left px-3 py-2 text-base font-medium text-accent hover:text-white"
                             >
                                 Student Login
                             </Link>
                              <Link 
                                to="/admin/login"
                                onClick={() => setIsOpen(false)}
                                className="block w-full text-left px-3 py-2 text-base font-medium text-gray-400 hover:text-white"
                             >
                                 Admin Login
                             </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
