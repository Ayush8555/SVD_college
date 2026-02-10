import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-heading font-bold mb-4">SVD Gurukul</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              SVD Gurukul Mahavidyalaya Dumduma Unchgaon, Jaunpur
            </p>
          </div>
          <div>
            <h3 className="text-lg font-heading font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/" className="hover:text-white transition">Home</a></li>
              <li><a href="/check-result" className="hover:text-white transition">Check Results</a></li>
              <li><a href="/login" className="hover:text-white transition">Student Login</a></li>
              <li><a href="/contact" className="hover:text-white transition">Contact Us</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-heading font-semibold mb-4">Contact</h3>
            <p className="text-gray-400 text-sm mb-2">Dumduma Unchgaon, Jaunpur - 223102</p>
            <p className="text-gray-400 text-sm mb-2">Phone:8400421843</p>
            <p className="text-gray-400 text-sm">Email: Will be provided soon</p>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} SVD Gurukul. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
