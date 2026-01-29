import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useToast } from '../context/ToastContext';
import Background3D from '../components/Background3D';

const Contact = () => {
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate sending
        setTimeout(() => {
            setLoading(false);
            toast.success("Message sent successfully! We will contact you soon.");
            e.target.reset();
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-transparent font-sans flex flex-col relative overflow-x-hidden text-slate-800">
             {/* Fixed 3D Background */}
             <div className="fixed inset-0 z-0">
                <Background3D />
            </div>

            <div className="relative z-10">
                <Navbar />
                
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-white mb-4 text-shadow-lg">Contact Us</h1>
                        <div className="w-24 h-1.5 bg-gradient-to-r from-orange-500 to-amber-500 mx-auto rounded-full shadow-lg mb-6"></div>
                        <p className="text-blue-100 text-lg max-w-2xl mx-auto backdrop-blur-sm bg-white/5 p-4 rounded-xl border border-white/10">
                            Have questions about admissions, results, or campus life? We are here to help.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                        {/* Contact Info */}
                        <motion.div 
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="space-y-8"
                        >
                            <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-white/40 hover:bg-white/90 transition-colors">
                                <h3 className="text-2xl font-bold text-gray-900 mb-8">Get in Touch</h3>
                                <div className="space-y-8">
                                    <div className="flex items-start gap-5 group">
                                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-lg">Campus Address</p>
                                            <p className="text-gray-600 mt-1 leading-relaxed">
                                                SVD Gurukul Mahavidyalaya,<br/>
                                                Village Dumduma, Post Unchgaon,<br/>
                                                District Unnao, Uttar Pradesh - 223102
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-5 group">
                                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-lg">Phone Support</p>
                                            <p className="text-gray-600 mt-1">+91 95060 80570</p>
                                            <p className="text-gray-600">+91 95981 75134</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-5 group">
                                        <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-lg">Email Inquiry</p>
                                            <p className="text-gray-600 mt-1 italic">admin@svdgurukul.com</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Map Placeholder */}
                            <div className="bg-white/80 backdrop-blur-md p-3 rounded-3xl shadow-lg border border-white/40 h-80 w-full overflow-hidden">
                                <iframe 
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14283.456570643729!2d80.5!3d26.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDMwJzAwLjAiTiA4MMKwMzAnMDAuMCJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin" 
                                    width="100%" 
                                    height="100%" 
                                    style={{border:0, borderRadius: '1.5rem'}} 
                                    allowFullScreen="" 
                                    loading="lazy"
                                    title="Map"
                                    className="grayscale hover:grayscale-0 transition-all duration-500"
                                ></iframe>
                            </div>
                        </motion.div>

                        {/* Contact Form */}
                        <motion.div 
                             initial={{ opacity: 0, x: 50 }}
                             animate={{ opacity: 1, x: 0 }}
                             transition={{ duration: 0.6, delay: 0.4 }}
                        >
                             <div className="bg-white/90 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl border-t-8 border-orange-500">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">Send a Message</h3>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input label="Your Name" placeholder="John Doe" required className="bg-gray-50 border-gray-200 focus:bg-white transition-all" />
                                        <Input label="Phone Number" placeholder="+91 98xxx xxxxx" className="bg-gray-50 border-gray-200 focus:bg-white transition-all" />
                                    </div>
                                    <Input label="Email Address" type="email" placeholder="john@example.com" required className="bg-gray-50 border-gray-200 focus:bg-white transition-all" />
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                                        <div className="relative">
                                            <select className="appearance-none w-full bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded-xl leading-tight focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all cursor-pointer">
                                                <option>General Inquiry</option>
                                                <option>Admission</option>
                                                <option>Examination</option>
                                                <option>Complaint</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
                                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                         <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                                         <textarea 
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all p-4 outline-none" 
                                            rows="4"
                                            required
                                            placeholder="How can we help you?"
                                         ></textarea>
                                    </div>
                                    <Button 
                                        type="submit" 
                                        isLoading={loading} 
                                        className="w-full py-4 text-lg font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:shadow-lg hover:-translate-y-1 transition-all rounded-xl"
                                    >
                                        Send Message
                                    </Button>
                                </form>
                             </div>
                        </motion.div>
                    </div>
                </main>

                <footer className="bg-slate-950 text-white py-8 border-t border-slate-900 mt-auto">
                    <div className="max-w-7xl mx-auto px-4 text-center">
                        <p className="font-heading font-semibold text-lg text-slate-200">SVD Gurukul Mahavidyalaya</p>
                        <p className="text-gray-500 text-xs mt-4">
                            &copy; {new Date().getFullYear()} All Rights Reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default Contact;
