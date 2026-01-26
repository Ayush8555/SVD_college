import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Card from '../components/ui/Card';
import collegeBuildingImg from '../assets/college_building.jpg';

const Home = () => {
    return (
        <div className="min-h-screen bg-white font-sans flex flex-col">
            <Navbar />

            {/* Hero Section */}
            <header className="relative bg-primary-900 overflow-hidden text-white pt-20 pb-32">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900"></div>
                {/* Decorative Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
                    <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-500 blur-3xl mix-blend-screen"></div>
                    <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full bg-accent-500 blur-3xl mix-blend-screen opacity-50"></div>
                </div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-blue-100 text-xs font-bold uppercase tracking-widest mb-6 shadow-lg">
                        <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse"></span>
                        Official College Portal
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-heading font-extrabold mb-6 tracking-tight leading-none drop-shadow-xl text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-200">
                        SVD Gurukul <br className="md:hidden"/>
                        <span className="text-white">Mahavidyalaya</span>
                    </h1>
                    
                    <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto font-light leading-relaxed mb-8 opacity-90">
                        Empowering Minds, Shaping Futures in <span className="font-semibold text-white">Dumduma, Unchgaon, Jaunpur</span> since 2010.
                    </p>
                    
                    <div className="flex justify-center gap-4">
                        <div className="h-1 w-24 bg-accent-500 rounded-full shadow-glow"></div>
                    </div>
                </div>
                {/* Decorative curve */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-white" style={{ clipPath: 'ellipse(70% 100% at 50% 100%)' }}></div>
            </header>

            {/* Portal Cards Section */}
            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-10 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* Result Portal Card */}
                    <Link to="/result" className="group">
                        <Card className="h-full border-t-8 border-t-accent hover:-translate-y-2 transition-transform duration-300">
                            <div className="text-center p-4">
                                <div className="w-16 h-16 bg-accent-50 text-accent-600 rounded-2xl flex items-center justify-center text-3xl mb-6 mx-auto group-hover:scale-110 transition-transform">
                                    📝
                                </div>
                                <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">Examination Criteria</h3>
                                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                    View and download semester wise marks sheets. Enter your Roll Number to access records.
                                </p>
                                <span className="inline-block px-6 py-2 bg-accent-600 text-white rounded-lg font-bold text-sm group-hover:bg-accent-700 transition-colors uppercase tracking-wide">
                                    Check Result
                                </span>
                            </div>
                        </Card>
                    </Link>

                    {/* Student Portal Card */}
                    <Link to="/student/login" className="group">
                        <Card className="h-full border-t-8 border-t-primary-600 hover:-translate-y-2 transition-transform duration-300">
                            <div className="text-center p-4">
                                <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center text-3xl mb-6 mx-auto group-hover:scale-110 transition-transform">
                                    👨‍🎓
                                </div>
                                <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">Student Login</h3>
                                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                    Access your personal dashboard, profile, and help center query management system.
                                </p>
                                <span className="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg font-bold text-sm group-hover:bg-primary-700 transition-colors uppercase tracking-wide">
                                    Student Login
                                </span>
                            </div>
                        </Card>
                    </Link>

                    {/* Admin Portal Card */}
                    <Link to="/admin/login" className="group">
                        <Card className="h-full border-t-8 border-t-gray-800 hover:-translate-y-2 transition-transform duration-300">
                            <div className="text-center p-4">
                                <div className="w-16 h-16 bg-gray-100 text-gray-800 rounded-2xl flex items-center justify-center text-3xl mb-6 mx-auto group-hover:scale-110 transition-transform">
                                    🔐
                                </div>
                                <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">Administration</h3>
                                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                    Restricted access for college staff and examination cell members only.
                                </p>
                                <span className="inline-block px-6 py-2 bg-gray-800 text-white rounded-lg font-bold text-sm group-hover:bg-gray-900 transition-colors uppercase tracking-wide">
                                    Staff Login
                                </span>
                            </div>
                        </Card>
                    </Link>

                </div>

            </main>

            {/* About Us Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-heading font-extrabold text-gray-900 mb-4">
                            About SVD Gurukul
                        </h2>
                        <div className="h-1.5 w-24 bg-primary-600 mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Image Side */}
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
                            <img 
                                src={collegeBuildingImg} 
                                alt="SVD Gurukul Campus" 
                                className="w-full h-[500px] object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        </div>

                        {/* Content Side */}
                        <div className="space-y-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                    Touching Lives through Education since 2010
                                </h3>
                                <p className="text-gray-600 leading-relaxed text-lg mb-6">
                                    SVD Gurukul Mahavidyalaya, located in the serene environment of Dumduma, Unchgaon, Jaunpur, Uttar Pradesh, is a premier institution dedicated to academic excellence and holistic development. Affiliated with the State University, we have been shaping the future of refined professionals.
                                </p>


                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-lg text-center hover:shadow-xl transition-shadow">
                                    <h4 className="text-4xl font-extrabold text-primary-600 mb-2">15+</h4>
                                    <p className="text-gray-500 font-medium uppercase tracking-wider text-sm">Years of Excellence</p>
                                </div>
                                <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-lg text-center hover:shadow-xl transition-shadow">
                                    <h4 className="text-4xl font-extrabold text-primary-600 mb-2">5000+</h4>
                                    <p className="text-gray-500 font-medium uppercase tracking-wider text-sm">Alumni Network</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Courses Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-heading font-extrabold text-gray-900 mb-4">Our Courses</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Comprehensive academic programs designed to build a strong foundation for your career.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { name: 'Bachelor of Arts (B.A)', code: 'BA', icon: '🎨' },
                            { name: 'Bachelor of Science (B.Sc)', code: 'B.Sc', icon: '🔬' },
                            { name: 'D.El.Ed. (BTC)', code: 'BTC', icon: '📚' },
                            { name: 'Bachelor of Law (LL.B)', code: 'LL.B', icon: '⚖️' }
                        ].map((course, idx) => (
                            <div key={idx} className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 group">
                                <div className="w-20 h-20 mx-auto bg-primary-50 rounded-full flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">
                                    {course.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{course.name}</h3>
                                <p className="text-primary-600 font-semibold mb-4">{course.code}</p>
                                <p className="text-gray-500 text-sm">Full-time • 3 Years</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <h4 className="text-lg font-heading font-bold mb-4 text-white">Contact Us</h4>
                            <p className="text-gray-400 text-sm mb-2">Dumduma, Unchgaon, Jaunpur, Uttar Pradesh</p>
                            <p className="text-gray-400 text-sm mb-2">Affiliated to V.B.S. Purvanchal University</p>
                            <p className="text-gray-400 text-sm mb-2">AISHE Code: <span className="text-white">C-49491</span></p>
                            <p className="text-gray-400 text-sm">Phone: +91 95060 80570</p>
                        </div>
                        <div>
                            <h4 className="text-lg font-heading font-bold mb-4 text-white">Quick Links</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><Link to="/result" className="hover:text-white">Examination Results</Link></li>
                                <li><Link to="/student/login" className="hover:text-white">Student Login</Link></li>
                                <li><Link to="/about" className="hover:text-white">About College</Link></li>
                                <li><Link to="/contact" className="hover:text-white">Contact Support</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-lg font-heading font-bold mb-4 text-white">Examination Cell</h4>
                            <p className="text-gray-500 text-xs leading-relaxed">
                                For any discrepancies in result, please submit a written application to the Principal Office within 15 days of declaration.
                            </p>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-12 pt-8 text-center text-xs text-gray-600">
                        &copy; 2026 SVD Gurukul Mahavidyalaya. All Rights Reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
