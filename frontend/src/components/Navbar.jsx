import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const dropdownTimeoutRef = useRef(null);
    const location = useLocation();

    // Dropdown menu items
    const dropdownMenus = {
        courses: {
            label: 'Courses Offered',
            items: [
                { name: 'B.Ed (3 Years)', path: '/courses/bed', description: 'Bachelor of Education' },
                { name: 'B.T.C / D.El.Ed (2 Years)', path: '/courses/btc', description: 'Diploma in Elementary Education' },
                { name: 'B.A (3 Years)', path: '/courses/ba', description: 'Bachelor of Arts' },
                { name: 'LL.B (3 Years)', path: '/courses/LL.B', description: 'Bachelor of Law' },
            ]
        },      
        campus: {   
            label: 'Our Campus',
            items: [
                { name: 'Infrastructure', path: '/campus/infrastructure', description: 'Modern facilities' },
                { name: 'Library', path: '/campus/library', description: 'Extensive collection' },
                { name: 'Sports Facilities', path: '/campus/sports', description: 'Athletic programs' },
            ]
        },
        about: {
            label: 'About',
            items: [
                { name: 'About Us', path: '/about', description: 'Our story' },
                { name: 'Vision & Mission', path: '/about/vision', description: 'Our goals' },
                { name: 'Leadership', path: '/about/leadership', description: 'Our team' },
                { name: 'Contact Us', path: '/contact', description: 'Get in touch' },
            ]
        }
    };

    const regularLinks = [
        { name: 'Admissions', path: '/admission-inquiry', highlight: true },
        { name: 'Results', path: '/student/login' },
    ];

    const isActive = (path) => location.pathname === path;

    const handleMouseEnter = (key) => {
        if (dropdownTimeoutRef.current) {
            clearTimeout(dropdownTimeoutRef.current);
        }
        setActiveDropdown(key);
    };

    const handleMouseLeave = () => {
        dropdownTimeoutRef.current = setTimeout(() => {
            setActiveDropdown(null);
        }, 200);
    };

    useEffect(() => {
        return () => {
            if (dropdownTimeoutRef.current) {
                clearTimeout(dropdownTimeoutRef.current);
            }
        };
    }, []);

    // Dropdown component with enhanced styling
    const DropdownMenu = ({ menuKey, menu }) => (
        <div
            className="relative group"
            onMouseEnter={() => handleMouseEnter(menuKey)}
            onMouseLeave={handleMouseLeave}
        >
            <button
                className={`flex items-center gap-1.5 text-sm font-medium transition-all duration-300 py-2 px-3 rounded-lg ${
                    activeDropdown === menuKey 
                        ? 'text-accent-400 bg-primary-800/50' 
                        : 'text-primary-100 hover:text-accent-400 hover:bg-primary-800/30'
                }`}
            >
                {menu.label}
                <svg
                    className={`w-4 h-4 transition-transform duration-300 ${activeDropdown === menuKey ? 'rotate-180 text-accent-400' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown Panel - Premium Glass Effect */}
            <div 
                className={`absolute top-full left-0 mt-2 w-64 transform transition-all duration-300 origin-top ${
                    activeDropdown === menuKey 
                        ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' 
                        : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                }`}
                style={{ zIndex: 9999 }}
            >
                {/* Glassmorphism dropdown */}
                <div className="bg-primary-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-primary-700/50 overflow-hidden">
                    {/* Accent top border */}
                    <div className="h-1 bg-gradient-to-r from-accent-400 via-accent-500 to-primary-400"></div>
                    
                    <div className="py-2">
                        {menu.items.map((item, index) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className="group/item flex items-center gap-3 px-4 py-3 text-sm text-primary-100 hover:bg-gradient-to-r hover:from-accent-500/20 hover:to-transparent transition-all duration-300 relative overflow-hidden"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                {/* Hover indicator line */}
                                <span className="absolute left-0 top-0 bottom-0 w-1 bg-accent-400 transform -translate-x-full group-hover/item:translate-x-0 transition-transform duration-300"></span>
                                
                                <div className="flex flex-col">
                                    <span className="font-medium group-hover/item:text-accent-400 transition-colors duration-300">{item.name}</span>
                                    {item.description && <span className="text-xs text-primary-400">{item.description}</span>}
                                </div>
                                
                                {/* Arrow on hover */}
                                <svg 
                                    className="w-4 h-4 ml-auto opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300 text-accent-400" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <nav className="bg-primary-900 text-white shadow-lg sticky top-0" style={{ zIndex: 9998 }}>
            {/* Animated accent border */}
            <div className="h-1 bg-gradient-to-r from-primary-600 via-accent-500 to-primary-600 animate-gradientShift"></div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo with animation */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="relative w-11 h-11 bg-gradient-to-br from-accent-400 via-accent-500 to-accent-600 text-primary-900 rounded-xl flex items-center justify-center font-bold text-sm shadow-lg group-hover:shadow-accent-500/30 transition-all duration-300 group-hover:scale-105 overflow-hidden">
                            {/* Shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                            <span className="relative z-10">SVD</span>
                        </div>
                        <div className="leading-tight">
                            <span className="font-heading font-bold text-lg text-white tracking-wide block group-hover:text-accent-400 transition-colors duration-300">SVD Gurukul</span>
                            <span className="text-xs text-primary-400 font-medium tracking-wider">Mahavidyalaya</span>
                        </div>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center space-x-1">
                        {/* Dropdown Menus */}
                        {Object.entries(dropdownMenus).map(([key, menu]) => (
                            <DropdownMenu key={key} menuKey={key} menu={menu} />
                        ))}

                        {/* Regular Links */}
                        {regularLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`text-sm font-medium transition-all duration-300 py-2 px-3 rounded-lg ${
                                    link.highlight 
                                        ? 'text-accent-400 hover:bg-accent-500/20' 
                                        : isActive(link.path) 
                                            ? 'text-accent-400 bg-primary-800/50' 
                                            : 'text-primary-100 hover:text-accent-400 hover:bg-primary-800/30'
                                }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Right Side - Apply Now Button */}
                    <div className="hidden lg:flex items-center gap-4">
                        <Link 
                            to="/admin/login" 
                            className="text-xs font-medium text-primary-400 hover:text-white transition-colors uppercase tracking-wider"
                        >
                            Admin
                        </Link>
                        <Link
                            to="/admission-inquiry"
                            className="group relative px-6 py-2.5 text-sm font-semibold text-accent-400 border-2 border-accent-500 rounded-full overflow-hidden transition-all duration-500 hover:text-primary-900"
                        >
                            {/* Animated background fill */}
                            <span className="absolute inset-0 bg-gradient-to-r from-accent-400 to-accent-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></span>
                            <span className="relative z-10 flex items-center gap-2">
                                Apply Now
                                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </span>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="lg:hidden p-2 rounded-lg text-primary-200 hover:text-accent-400 hover:bg-primary-800 focus:outline-none transition-all duration-300"
                    >
                        <div className="w-6 h-6 relative">
                            <span className={`absolute left-0 top-1 w-6 h-0.5 bg-current transform transition-all duration-300 ${isOpen ? 'rotate-45 top-3' : ''}`}></span>
                            <span className={`absolute left-0 top-3 w-6 h-0.5 bg-current transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
                            <span className={`absolute left-0 top-5 w-6 h-0.5 bg-current transform transition-all duration-300 ${isOpen ? '-rotate-45 top-3' : ''}`}></span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`lg:hidden overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-[80vh]' : 'max-h-0'}`}>
                <div className="bg-primary-800/95 backdrop-blur-lg border-t border-primary-700">
                    <div className="px-4 py-4 space-y-4 max-h-[75vh] overflow-y-auto">
                        {/* Mobile Dropdown Sections */}
                        {Object.entries(dropdownMenus).map(([key, menu]) => (
                            <div key={key} className="space-y-2">
                                <p className="text-xs font-semibold text-accent-400 uppercase tracking-wider">
                                    {menu.label}
                                </p>
                                <div className="space-y-1 pl-6 border-l-2 border-primary-600">
                                    {menu.items.map((item) => (
                                        <Link
                                            key={item.name}
                                            to={item.path}
                                            onClick={() => setIsOpen(false)}
                                            className="block py-2 text-sm text-primary-200 hover:text-accent-400 transition-colors"
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div className="border-t border-primary-700 pt-4 space-y-2">
                            {regularLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className={`block py-2 text-sm font-medium transition-colors ${
                                        link.highlight ? 'text-accent-400' : 'text-primary-200 hover:text-accent-400'
                                    }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        <div className="border-t border-primary-700 pt-4 space-y-3">
                            <Link
                                to="/admin/login"
                                onClick={() => setIsOpen(false)}
                                className="block py-2 text-xs font-medium text-primary-400 uppercase tracking-wider"
                            >
                                Admin Login
                            </Link>
                            <Link
                                to="/admission-inquiry"
                                onClick={() => setIsOpen(false)}
                                className="block w-full text-center px-5 py-3 text-sm font-semibold text-primary-900 bg-gradient-to-r from-accent-400 to-accent-500 rounded-full hover:shadow-lg hover:shadow-accent-500/30 transition-all"
                            >
                                Apply Now →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
