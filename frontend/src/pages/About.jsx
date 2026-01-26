import React from 'react';
import Navbar from '../components/Navbar';
import Card from '../components/ui/Card';

import collegeBuildingImg from '../assets/college_building.jpg';

const About = () => {
    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar />
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in-up">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-heading font-bold text-primary-900 mb-4">About SVD Gurukul</h1>
                    <div className="w-24 h-1 bg-accent mx-auto rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
                    <div>
                        <img 
                            src={collegeBuildingImg} 
                            alt="SVD Gurukul College Building" 
                            className="rounded-2xl shadow-xl w-full h-[400px] object-cover"
                        />
                    </div>
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-800">Touching Lives through Education since 2010</h2>
                        <p className="text-gray-600 leading-relaxed text-lg">
                            SVD Gurukul Mahavidyalaya, located in the serene environment of Dumduma, Unchgaon, Jaunpur, Uttar Pradesh, is a premier institution dedicated to academic excellence and holistic development. Affiliated with the State University, we have been shaping the future of refined professionals since 2010.
                        </p>
                        <p className="text-gray-600 leading-relaxed text-lg">
                            Our campus is equipped with state-of-the-art facilities, a rich library, and dedicated faculty members who mentor students to achieve their highest potential in Arts, Science, Education, and Law.
                        </p>
                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                                <span className="block text-3xl font-bold text-primary-600 mb-1">15+</span>
                                <span className="text-sm text-gray-500 font-medium uppercase">Years of Excellence</span>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                                <span className="block text-3xl font-bold text-primary-600 mb-1">5000+</span>
                                <span className="text-sm text-gray-500 font-medium uppercase">Alumni Network</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Our Courses</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { name: 'Bachelor of Arts (B.A)', icon: '🎨' },
                            { name: 'Bachelor of Science (B.Sc)', icon: '🔬' },
                            { name: 'D.El.Ed. (BTC)', icon: '📚' },
                            { name: 'Bachelor of Law (LL.B)', icon: '⚖️' }
                        ].map((course, idx) => (
                            <Card key={idx} className="hover:-translate-y-2 transition-transform duration-300 border-t-4 border-t-primary-500 text-center py-8">
                                <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                                    {course.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">{course.name}</h3>
                                <p className="text-gray-500 mt-2 text-sm">Full-time • 3 Years</p>
                            </Card>
                        ))}
                    </div>
                </div>
                <div className="bg-primary-900 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-4">Principal's Message</h2>
                        <p className="text-primary-100 max-w-3xl mx-auto text-lg italic leading-relaxed">
                            "Education is not just about acquiring knowledge, but about building character. At SVD Gurukul, we strive to create an environment where values meet supreme intellect."
                        </p>
                        <p className="mt-6 font-semibold text-accent">- Principal</p>
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

export default About;
