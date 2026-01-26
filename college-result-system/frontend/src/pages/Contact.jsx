import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useToast } from '../context/ToastContext';

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
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar />
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in-up">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-heading font-bold text-primary-900 mb-4">Contact Us</h1>
                    <div className="w-24 h-1 bg-accent mx-auto rounded-full"></div>
                    <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
                        Have questions about admissions, results, or campus life? Reach out to us.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <Card className="p-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Get in Touch</h3>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                                        📍
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">Campus Address</p>
                                        <p className="text-gray-600 mt-1">
                                            SVD Gurukul Mahavidyalaya,<br/>
                                            Village Dumduma, Post Unchgaon,<br/>
                                            District Unnao, Uttar Pradesh - 223102
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                                        📞
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">Phone</p>
                                        <p className="text-gray-600 mt-1">+91 95060 80570</p>
                                        <p className="text-gray-600">+91 95981 75134</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                                        ✉️
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">Email</p>
                                        <p className="text-gray-600 mt-1 italic">Will provide soon</p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Map Placeholder */}
                        <div className="bg-gray-200 rounded-2xl h-64 w-full flex items-center justify-center text-gray-500 font-medium">
                            <iframe 
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14283.456570643729!2d80.5!3d26.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDMwJzAwLjAiTiA4MMKwMzAnMDAuMCJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin" 
                                width="100%" 
                                height="100%" 
                                style={{border:0, borderRadius: '1rem'}} 
                                allowFullScreen="" 
                                loading="lazy"
                                title="Map"
                            ></iframe>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div>
                         <Card className="p-8 border-t-4 border-t-accent">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Send a Message</h3>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <Input label="Your Name" placeholder="John Doe" required />
                                    <Input label="Phone Number" placeholder="+91 98xxx xxxxx" />
                                </div>
                                <Input label="Email Address" type="email" placeholder="john@example.com" required />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                    <select className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-500 focus:ring-brand-500">
                                        <option>General Inquiry</option>
                                        <option>Admission</option>
                                        <option>Examination</option>
                                        <option>Complaint</option>
                                    </select>
                                </div>
                                <div>
                                     <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                     <textarea 
                                        className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-500 focus:ring-brand-500" 
                                        rows="4"
                                        required
                                        placeholder="How can we help you?"
                                     ></textarea>
                                </div>
                                <Button type="submit" isLoading={loading} className="w-full">
                                    Send Message
                                </Button>
                            </form>
                         </Card>
                    </div>
                </div>
            </main>

            <footer className="bg-gray-900 text-white py-8 border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="font-heading font-semibold text-lg">SVD Gurukul Mahavidyalaya</p>
                    <p className="text-gray-400 text-sm mt-1">Dumduma, Unchgaon, Jaunpur, Uttar Pradesh</p>
                    <p className="text-gray-500 text-xs mt-6">
                        &copy; {new Date().getFullYear()} All Rights Reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Contact;
