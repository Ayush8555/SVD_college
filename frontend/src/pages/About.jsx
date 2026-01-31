import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Background3D from '../components/Background3D';
import collegeBuildingImg from '../assets/college_building.jpg';
import CampusSlideshow from '../components/CampusSlideshow';

const About = () => {
    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const stagger = {
        visible: { transition: { staggerChildren: 0.1 } }
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
                        initial="hidden"
                        animate="visible"
                        variants={stagger}
                        className="text-center mb-16"
                    >
                        <motion.h1 variants={fadeInUp} className="text-5xl md:text-6xl font-heading font-extrabold text-white mb-6 text-shadow-lg">
                            About SVD Gurukul
                        </motion.h1>
                        <motion.div variants={fadeInUp} className="w-24 h-1.5 bg-gradient-to-r from-orange-500 to-amber-500 mx-auto rounded-full shadow-lg"></motion.div>
                    </motion.div>

                    {/* Campus Gallery Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-20"
                    >
                        <div className="text-center mb-12">
                            {/* Badge */}
                            <motion.span 
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="inline-flex items-center gap-2 px-5 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-orange-400 text-sm font-semibold tracking-wide mb-6"
                            >
                                <span className="w-2 h-2 bg-orange-400 rounded-full" />
                                EXPLORE OUR CAMPUS
                            </motion.span>

                            {/* Heading */}
                            <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-4 leading-tight text-shadow-lg">
                                A Place Where{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400">
                                    Dreams
                                </span>{' '}
                                Take Flight
                            </h2>

                            {/* Subheading */}
                            <p className="text-lg text-blue-200/80 max-w-2xl mx-auto font-light">
                                Discover our world-class infrastructure designed to nurture academic excellence and holistic development
                            </p>

                            {/* Stats Row */}
                            <div className="flex flex-wrap items-center justify-center gap-8 mt-8">
                                <div className="text-center">
                                    <span className="block text-2xl md:text-3xl font-bold text-white">7+</span>
                                    <span className="text-sm text-slate-300 font-medium">Acres Campus</span>
                                </div>
                                <div className="w-px h-10 bg-slate-600" />
                                <div className="text-center">
                                    <span className="block text-2xl md:text-3xl font-bold text-white">50+</span>
                                    <span className="text-sm text-slate-300 font-medium">Classrooms</span>
                                </div>
                                <div className="w-px h-10 bg-slate-600" />
                                <div className="text-center">
                                    <span className="block text-2xl md:text-3xl font-bold text-white">24/7</span>
                                    <span className="text-sm text-slate-300 font-medium">Security</span>
                                </div>
                            </div>
                        </div>

                        {/* Campus Slideshow */}
                        <CampusSlideshow cleanMode={true} />

                        {/* Features Below Slideshow */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                            {[
                                { icon: '🏛️', label: 'Modern Infrastructure' },
                                { icon: '📚', label: 'Digital Library' },
                                { icon: '🧪', label: 'Science Labs' },
                                { icon: '🌳', label: 'Green Campus' }
                            ].map((feature, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 + 0.5 }}
                                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center hover:bg-white/20 transition-colors"
                                >
                                    <span className="text-2xl block mb-2">{feature.icon}</span>
                                    <span className="text-white/90 text-sm font-medium">{feature.label}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* About Content Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start mb-20">
                        <motion.div 
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="space-y-8 bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-lg border border-white/40"
                        >
                            <h2 className="text-3xl font-bold text-slate-900 leading-tight">
                                Shaping Futures with <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Holistic Education</span>
                            </h2>
                            <p className="text-slate-600 leading-relaxed text-lg">
                                SVD Gurukul Mahavidyalaya is more than just an educational institution; it is a center for culture and knowledge. Located in the serene environment of Dumduma, Unchgaon, Jaunpur, we are affiliated with the State University and committed to providing quality education.
                            </p>
                            <p className="text-slate-600 leading-relaxed text-lg">
                                Our campus features state-of-the-art classrooms, a digital library, and a dedicated team of faculty members who mentor students to achieve their highest potential in Arts, Science, and Education.
                            </p>
                            
                            
                        </motion.div>
                    </div>

                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="mb-20"
                    >
                        <h2 className="text-3xl font-bold text-center text-white mb-10 text-shadow-md">Courses Offered</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { name: 'B.Ed (Bachelor of Education)', letter: 'BE', color: 'bg-rose-100 text-rose-600', duration: '3 Years' },
                                { name: 'B.T.C / D.El.Ed', letter: 'DE', color: 'bg-amber-100 text-amber-600', duration: '2 Years' },
                                { name: 'Bachelor of Arts (B.A)', letter: 'BA', color: 'bg-blue-100 text-blue-600', duration: '3 Years' },
                                { name: 'Bachelor of Law (LL.B)', letter: 'LB', color: 'bg-emerald-100 text-emerald-600', duration: '3 Years' }
                            ].map((course, idx) => (
                                <motion.div 
                                    key={idx} 
                                    whileHover={{ y: -10 }}
                                    className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center shadow-lg border border-white/30 cursor-pointer"
                                >
                                    <div className={`w-16 h-16 ${course.color} rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6 shadow-inner`}>
                                        {course.letter}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{course.name}</h3>
                                    <p className="text-gray-500 text-sm">Full-time • {course.duration}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl p-12 text-center text-white relative overflow-hidden shadow-2xl"
                    >
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                        <div className="relative z-10 max-w-4xl mx-auto">
                            <span className="text-6xl block mb-6 opacity-30">"</span>
                            <h2 className="text-3xl md:text-4xl font-bold mb-8 leading-normal font-heading">
                                "Education is not just about acquiring knowledge, but about building character. At SVD Gurukul, we strive to create an environment where values meet supreme intellect."
                            </h2>
                            <div className="flex items-center justify-center gap-4">
                                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center font-bold text-xl">P</div>
                                <div className="text-left">
                                    <p className="font-bold text-lg text-orange-400">Shri Abhishek Upadhyay(Shrimant)</p>
                                    <p className="text-sm text-blue-200">Principal, SVD Gurukul</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </main>

                <footer className="bg-slate-950 text-white py-8 border-t border-slate-900 mt-auto">
                    <div className="max-w-7xl mx-auto px-4 text-center">
                        <p className="font-heading font-semibold text-lg text-slate-200">SVD Gurukul Mahavidyalaya</p>
                        <p className="text-slate-500 text-xs mt-4">
                            &copy; {new Date().getFullYear()} All Rights Reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default About;
