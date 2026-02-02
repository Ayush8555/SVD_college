import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import Navbar from '../components/Navbar';
import Background3D from '../components/Background3D';
import collegeBuildingImg from '../assets/college_building.jpg';
import NoticeSection from '../components/home/NoticeSection';

const Home = () => {
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    return (
        <div className="min-h-screen bg-transparent font-sans flex flex-col overflow-x-hidden relative text-slate-800 bg-noise">
            {/* Fixed 3D Background */}
            <div className="fixed inset-0 z-0 bg-slate-900">
                <Background3D />
            </div>

            <div className="relative z-10">
                <Navbar />

                {/* ========== ADMISSION BANNER ========== */}
                <motion.div 
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="relative z-50"
                >
                    <Link to="/admission-inquiry" className="block">
                        <div className="relative overflow-hidden py-3 px-4 text-white cursor-pointer backdrop-blur-md bg-gradient-to-r from-orange-600/90 to-amber-600/90 border-b border-orange-400/50 shadow-lg shadow-orange-900/20">
                            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-center">
                                <span className="hidden sm:inline-block text-xl animate-bounce text-white">*</span>
                                <div className="flex items-center gap-3">
                                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                                    <span className="text-sm sm:text-base font-bold tracking-wide uppercase text-shadow-sm">
                                        Admissions Open
                                    </span>
                                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                                </div>
                                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white text-orange-600 rounded-full font-bold text-xs shadow-lg hover:scale-105 transition-transform hover:shadow-white/20">
                                    Apply Now
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </span>
                            </div>
                        </div>
                    </Link>
                </motion.div>

                {/* Hero Section */}
                <header className="relative pt-24 pb-32 min-h-[85vh] flex items-center justify-center overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 text-center">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={staggerContainer}
                        >
                            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-blue-100 text-xs font-medium tracking-[0.2em] uppercase mb-10 shadow-xl">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></span>
                                Official College Portal
                            </motion.div>

                            <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl lg:text-9xl font-heading font-black mb-8 tracking-tighter leading-[0.9] text-white drop-shadow-2xl">
                                <span className="block text-transparent bg-clip-text bg-gradient-to-br from-white via-blue-100 to-blue-200">
                                    SVD Gurukul
                                </span>
                                <span className="block text-4xl md:text-6xl text-blue-200/90 font-serif italic tracking-normal mt-4">
                                    Mahavidyalaya
                                </span>
                            </motion.h1>

                            <motion.div variants={fadeInUp} className="inline-block relative px-8 py-6 mb-12 max-w-3xl mx-auto">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent blur-xl"></div>
                                <p className="relative text-xl md:text-2xl text-blue-100/90 font-light leading-relaxed">
                                    Empowering Minds, Shaping Futures inside the heart of <span className="font-medium text-white decoration-amber-500/50 underline decoration-2 underline-offset-4">Dumduma, Jaunpur</span> since 2010.
                                </p>
                            </motion.div>

                            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                <Link 
                                    to="/admission-inquiry"
                                    className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-full font-bold text-lg shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:shadow-[0_0_50px_rgba(245,158,11,0.6)] hover:scale-105 transition-all overflow-hidden border border-orange-400/50"
                                >
                                    <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-700 -skew-x-12 origin-left"></div>
                                    <span className="relative flex items-center gap-2">
                                        Apply for Admission
                                    </span>
                                </Link>
                                <Link 
                                    to="/about"
                                    className="px-8 py-4 bg-white/5 backdrop-blur-md border border-white/20 text-white rounded-full font-bold text-lg hover:bg-white/10 hover:scale-105 transition-all shadow-lg hover:shadow-white/10"
                                >
                                    Learn More <span className="ml-2">→</span>
                                </Link>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Scroll Indicator */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5, duration: 1 }}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2"
                    >
                        <div className="flex flex-col items-center text-blue-200/60 animate-bounce">
                            <span className="text-[10px] uppercase tracking-[0.3em] mb-2 font-medium">Scroll to Explore</span>
                            <div className="w-[1px] h-12 bg-gradient-to-b from-blue-200/60 to-transparent"></div>
                        </div>
                    </motion.div>
                </header>

                {/* Portal Cards Section - IMPROVED & UNIQUE */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-20">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-16"
                    >
                        <span className="font-serif italic text-2xl text-blue-300/80 mb-2 block">Student & Staff Services</span>
                        <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
                            Quick Access Portals
                        </h2>
                    </motion.div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { 
                                title: "Authentication", 
                                subtitle: "Student Login",
                                desc: "Access your dashboard, profile, and academic records.", 
                                iconType: "user", 
                                link: "/student/login", 
                                hoverBg: "group-hover:bg-blue-600/25",
                                iconColor: "text-blue-400",
                                delay: 0
                            },
                            { 
                                title: "Results", 
                                subtitle: "Examination Cell",
                                desc: "Check semester results and download marksheets instantly.", 
                                iconType: "result", 
                                link: "/result", 
                                hoverBg: "group-hover:bg-orange-500/25",
                                iconColor: "text-orange-400",
                                delay: 0.15
                            },
                            { 
                                title: "Administration", 
                                subtitle: "Staff Access",
                                desc: "Secure portal for college faculty and staff members.", 
                                iconType: "admin", 
                                link: "/admin/login", 
                                hoverBg: "group-hover:bg-emerald-600/25",
                                iconColor: "text-emerald-400",
                                delay: 0.3
                            }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: item.delay, duration: 0.5 }}
                            >
                                <Link to={item.link} className="group block h-full">
                                    <div className={`h-full bg-slate-800/80 ${item.hoverBg} rounded-2xl p-8 hover:-translate-y-1 transition-all duration-300 shadow-lg border border-white/5`}>
                                        <div className="flex flex-col h-full items-center text-center">
                                            {/* Icon */}
                                            <div className="w-16 h-16 mb-5 rounded-full bg-slate-700/50 group-hover:bg-white/20 flex items-center justify-center transition-colors duration-300">
                                                {item.iconType === 'user' && <svg className={`w-8 h-8 ${item.iconColor} group-hover:text-white transition-colors duration-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                                                {item.iconType === 'result' && <svg className={`w-8 h-8 ${item.iconColor} group-hover:text-white transition-colors duration-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                                                {item.iconType === 'admin' && <svg className={`w-8 h-8 ${item.iconColor} group-hover:text-white transition-colors duration-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                                            </div>

                                            <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${item.iconColor} group-hover:text-white/70 transition-colors duration-300`}>
                                                {item.subtitle}
                                            </p>
                                            
                                            <h3 className="text-2xl font-bold text-white mb-3">
                                                {item.title}
                                            </h3>
                                            
                                            <p className="text-slate-400 group-hover:text-white/80 text-sm mb-6 flex-grow transition-colors duration-300">
                                                {item.desc}
                                            </p>

                                            <div className="w-full">
                                                <div className="w-full py-3 rounded-lg bg-slate-700/50 group-hover:bg-white/20 text-white font-semibold text-base flex items-center justify-center gap-2 transition-colors duration-300">
                                                    Access Portal
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </main>

                {/* New Modern Notice Section */}
                <NoticeSection />

                {/* About Section - Totally Opaque for Readability */}
                <section className="py-24 bg-slate-50 relative z-20 border-t border-gray-200 overflow-hidden">
                     {/* Subtle pattern */}
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
                    
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <motion.div 
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="relative group"
                            >
                                <div className="absolute inset-0 bg-blue-600 rounded-[2rem] rotate-3 opacity-20 blur-xl group-hover:rotate-1 transition-all"></div>
                                <img 
                                    src={collegeBuildingImg} 
                                    alt="SVD Gurukul Campus" 
                                    className="relative rounded-[2rem] shadow-2xl w-full h-[500px] object-cover border-8 border-white"
                                />
                                <div className="absolute -bottom-8 -right-8 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex gap-4 items-center animate-bounceSubtle">
                                    <div className="bg-orange-100 p-4 rounded-xl text-orange-600">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-xl">Est. 2010</p>
                                        <p className="text-gray-500 text-sm font-medium">15+ Years of Trust</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="space-y-8 pl-0 lg:pl-12"
                            >
                                <div className="space-y-2">
                                    <span className="font-serif italic text-2xl text-blue-600">Our Story</span>
                                    <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 leading-[1.1]">
                                        Touching Lives through <br/>
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600">Pure Education.</span>
                                    </h2>
                                </div>
                                
                                <p className="text-gray-600 leading-relaxed text-lg font-light">
                                    SVD Gurukul Mahavidyalaya is more than just an institution; it's a <span className="font-medium text-gray-900">home for curious minds</span>. Located in the serene environment of Dumduma, Unchgaon, Jaunpur, we have been quietly shaping the future of refined professionals since 2010.
                                </p>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                        <h4 className="text-4xl font-extrabold text-slate-900 mb-1">5k+</h4>
                                        <p className="text-slate-500 font-medium text-sm">Alumni Network</p>
                                    </div>
                                    <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                        <h4 className="text-4xl font-extrabold text-slate-900 mb-1">50+</h4>
                                        <p className="text-slate-500 font-medium text-sm">Expert Faculty</p>
                                    </div>
                                </div>
                                <Link to="/about" className="inline-flex items-center gap-2 text-blue-700 font-bold hover:gap-4 transition-all group">
                                    Discover more about our legacy 
                                    <span className="bg-blue-100 p-2 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                                    </span>
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-slate-950 text-white border-t border-slate-900 relative z-20">
                    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                            <div className="md:col-span-1">
                                <h4 className="text-2xl font-heading font-bold mb-6 bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">SVD Gurukul</h4>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Empowering minds and shaping futures through quality education since 2010.
                                </p>
                            </div>
                            <div>
                                <h4 className="text-lg font-heading font-bold mb-6 text-white border-l-4 border-orange-500 pl-3">Contact</h4>
                                <div className="space-y-4 text-slate-400 text-sm">
                                    <p className="flex items-start gap-3">
                                        <svg className="w-4 h-4 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        <span>Dumduma, Unchgaon,<br/>Jaunpur, UP - 223102</span>
                                    </p>
                                    <p className="flex items-center gap-3">
                                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                        <span>+91 95060 80570</span>
                                    </p>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-lg font-heading font-bold mb-6 text-white border-l-4 border-blue-500 pl-3">Quick Links</h4>
                                <ul className="space-y-3 text-sm text-slate-400">
                                    <li><Link to="/result" className="hover:text-amber-400 transition-colors flex items-center gap-2"><span>•</span> Examination Results</Link></li>
                                    <li><Link to="/student/login" className="hover:text-amber-400 transition-colors flex items-center gap-2"><span>•</span> Student Login</Link></li>
                                    <li><Link to="/admin/login" className="hover:text-amber-400 transition-colors flex items-center gap-2"><span>•</span> Admin Login</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-lg font-heading font-bold mb-6 text-white border-l-4 border-emerald-500 pl-3">Legal</h4>
                                <p className="text-slate-500 text-sm">
                                    AISHE Code: <span className="text-slate-300">C-49491</span> <br/>
                                    Copyright © {new Date().getFullYear()}
                                </p>
                                <div className="mt-4 flex gap-4">
                                   {/* Social Icons Placeholder */}
                                   <div className="w-8 h-8 rounded-full bg-slate-800 hover:bg-blue-600 transition-colors cursor-pointer"></div>
                                   <div className="w-8 h-8 rounded-full bg-slate-800 hover:bg-blue-400 transition-colors cursor-pointer"></div>
                                   <div className="w-8 h-8 rounded-full bg-slate-800 hover:bg-pink-600 transition-colors cursor-pointer"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default Home;
