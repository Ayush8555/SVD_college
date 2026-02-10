import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const AdmissionInquiry = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    fatherName: '',
    gender: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: 'Uttar Pradesh',
    pincode: '',
    courseOfInterest: '',
    previousQualification: '',
    previousMarks: '',
    message: ''
  });
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMsg, setErrorMsg] = useState('');

  const courses = [
    { name: 'Bachelor of Arts (B.A)', duration: '3 Years' },
    { name: 'Bachelor of Science (B.Sc)', duration: '3 Years' },
    { name: 'D.El.Ed. (BTC)', duration: '2 Years' },
    { name: 'Bachelor of Law (LL.B)', duration: '3 Years' }
  ];

  const steps = [
    { id: 1, title: 'Personal Info' },
    { id: 2, title: 'Contact Details' },
    { id: 3, title: 'Academic Info' },
    { id: 4, title: 'Course Selection' }
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCourseSelect = (courseName) => {
    setFormData({ ...formData, courseOfInterest: courseName });
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.name || !formData.fatherName || !formData.gender || !formData.dateOfBirth) {
          setErrorMsg('Please fill all required details');
          return false;
        }
        return true;
      case 2:
        if (!formData.email || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.pincode) {
          setErrorMsg('Please fill all required details');
          return false;
        }
        return true;
      case 3:
        if (!formData.previousQualification) {
          setErrorMsg('Please fill all required details');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep()) {
      setErrorMsg('');
      if (currentStep < 4) setCurrentStep(currentStep + 1);
    } else {
      setStatus('error'); // Trigger error display
      setTimeout(() => setStatus('idle'), 3000); // Clear error status after 3 seconds
    }
  };

  const prevStep = () => {
    setErrorMsg('');
    setStatus('idle');
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/inquiry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMsg(data.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      setStatus('error');
      setErrorMsg('Failed to connect to the server. Please check your connection.');
    }
  };

  const slideVariants = {
    enter: (direction) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction < 0 ? 300 : -300, opacity: 0 })
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative group">
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="peer w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:bg-white focus:outline-none transition-all placeholder-transparent"
                  placeholder="Full Name"
                />
                <label
                  htmlFor="name"
                  className="absolute left-4 -top-2.5 bg-white px-1 text-sm font-medium text-gray-600 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-primary-600 peer-focus:bg-white"
                >
                  Full Name *
                </label>
              </div>

              <div className="relative group">
                <input
                  type="text"
                  name="fatherName"
                  id="fatherName"
                  required
                  value={formData.fatherName}
                  onChange={handleChange}
                  className="peer w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:bg-white focus:outline-none transition-all placeholder-transparent"
                  placeholder="Father's Name"
                />
                <label
                  htmlFor="fatherName"
                  className="absolute left-4 -top-2.5 bg-white px-1 text-sm font-medium text-gray-600 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-primary-600 peer-focus:bg-white"
                >
                  Father's Name *
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                <div className="flex gap-4">
                  {['Male', 'Female', 'Other'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: g })}
                      className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                        formData.gender === g
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative group">
                <input
                  type="date"
                  name="dateOfBirth"
                  id="dateOfBirth"
                  required
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="peer w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:bg-white focus:outline-none transition-all"
                />
                <label
                  htmlFor="dateOfBirth"
                  className="absolute left-4 -top-2.5 bg-white px-1 text-sm font-medium text-gray-600"
                >
                  Date of Birth *
                </label>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="peer w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:bg-white focus:outline-none transition-all placeholder-transparent"
                  placeholder="Email"
                />
                <label htmlFor="email" className="absolute left-4 -top-2.5 bg-white px-1 text-sm font-medium text-gray-600 peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:bg-white peer-focus:text-primary-600 transition-all">
                  Email Address *
                </label>
              </div>

              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="peer w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:bg-white focus:outline-none transition-all placeholder-transparent"
                  placeholder="Phone"
                />
                <label htmlFor="phone" className="absolute left-4 -top-2.5 bg-white px-1 text-sm font-medium text-gray-600 peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:bg-white peer-focus:text-primary-600 transition-all">
                  Phone Number *
                </label>
              </div>
            </div>

            <div className="relative">
              <textarea
                name="address"
                id="address"
                rows="3"
                required
                value={formData.address}
                onChange={handleChange}
                className="peer w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:bg-white focus:outline-none transition-all placeholder-transparent resize-none"
                placeholder="Address"
              ></textarea>
              <label htmlFor="address" className="absolute left-4 -top-2.5 bg-white px-1 text-sm font-medium text-gray-600">
                Full Address *
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative">
                <input
                  type="text"
                  name="city"
                  id="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="peer w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:bg-white focus:outline-none transition-all placeholder-transparent"
                  placeholder="City"
                />
                <label htmlFor="city" className="absolute left-4 -top-2.5 bg-white px-1 text-sm font-medium text-gray-600 peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:bg-white peer-focus:text-primary-600 transition-all">
                  City *
                </label>
              </div>

              <div className="relative">
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:bg-white focus:outline-none transition-all appearance-none"
                >
                  <option>Uttar Pradesh</option>
                  <option>Bihar</option>
                  <option>Madhya Pradesh</option>
                  <option>Delhi</option>
                  <option>Other</option>
                </select>
                <label className="absolute left-4 -top-2.5 bg-white px-1 text-sm font-medium text-gray-600">State</label>
              </div>

              <div className="relative">
                <input
                  type="text"
                  name="pincode"
                  id="pincode"
                  required
                  value={formData.pincode}
                  onChange={handleChange}
                  className="peer w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:bg-white focus:outline-none transition-all placeholder-transparent"
                  placeholder="Pincode"
                />
                <label htmlFor="pincode" className="absolute left-4 -top-2.5 bg-white px-1 text-sm font-medium text-gray-600 peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:bg-white peer-focus:text-primary-600 transition-all">
                  Pincode *
                </label>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <select
                  name="previousQualification"
                  value={formData.previousQualification}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:bg-white focus:outline-none transition-all appearance-none"
                >
                  <option value="">Select Qualification</option>
                  <option>10th (High School)</option>
                  <option>12th (Intermediate)</option>
                  <option>Graduation</option>
                  <option>Post Graduation</option>
                </select>
                <label className="absolute left-4 -top-2.5 bg-white px-1 text-sm font-medium text-gray-600">Previous Qualification *</label>
              </div>

              <div className="relative">
                <input
                  type="text"
                  name="previousMarks"
                  id="previousMarks"
                  value={formData.previousMarks}
                  onChange={handleChange}
                  className="peer w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:bg-white focus:outline-none transition-all placeholder-transparent"
                  placeholder="Percentage/CGPA"
                />
                <label htmlFor="previousMarks" className="absolute left-4 -top-2.5 bg-white px-1 text-sm font-medium text-gray-600 peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:bg-white peer-focus:text-primary-600 transition-all">
                  Percentage / CGPA
                </label>
              </div>
            </div>

            <div className="relative">
              <textarea
                name="message"
                id="message"
                rows="4"
                value={formData.message}
                onChange={handleChange}
                className="peer w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:bg-white focus:outline-none transition-all placeholder-transparent resize-none"
                placeholder="Message"
              ></textarea>
              <label htmlFor="message" className="absolute left-4 -top-2.5 bg-white px-1 text-sm font-medium text-gray-600">
                Any Questions / Message (Optional)
              </label>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step4"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <p className="text-gray-600 text-center mb-4">Select your preferred course</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((course) => (
                <motion.button
                  key={course.name}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCourseSelect(course.name)}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${
                    formData.courseOfInterest === course.name
                      ? 'border-primary-500 bg-primary-50 shadow-lg shadow-primary-100'
                      : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${formData.courseOfInterest === course.name ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'} font-bold`}>
                      {course.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-bold ${formData.courseOfInterest === course.name ? 'text-primary-700' : 'text-gray-900'}`}>
                        {course.name}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">Duration: {course.duration}</p>
                    </div>
                    {formData.courseOfInterest === course.name && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center"
                      >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Inquiry Submitted!</h2>
          <p className="text-gray-600 mb-8">
            Thank you for your interest in SVD Gurukul Mahavidyalaya. Our admission team will contact you within 24-48 hours.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to="/"
              className="inline-block px-8 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors"
            >
              Back to Home
            </Link>
            <button
              onClick={() => {
                setStatus('idle');
                setCurrentStep(1);
                setFormData({
                  name: '', email: '', phone: '', fatherName: '', gender: '', dateOfBirth: '',
                  address: '', city: '', state: 'Uttar Pradesh', pincode: '',
                  courseOfInterest: '', previousQualification: '', previousMarks: '', message: ''
                });
              }}
              className="text-primary-600 font-medium hover:underline"
            >
              Submit Another Inquiry
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-900 to-primary-800 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-200 hover:text-white mb-4 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Admission Inquiry 2026-27</h1>
          <p className="text-primary-200">Fill out the form below and take your first step towards a bright future</p>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex justify-between items-center relative">
            {/* Progress Line */}
            <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 -z-10">
              <motion.div
                className="h-full bg-primary-500"
                initial={{ width: '0%' }}
                animate={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center z-10">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
                    currentStep >= step.id
                      ? 'bg-primary-500 text-white shadow-lg shadow-primary-200'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {currentStep > step.id ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.id
                  )}
                </motion.div>
                <span className={`text-xs mt-2 font-medium ${currentStep >= step.id ? 'text-primary-600' : 'text-gray-400'}`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 min-h-[400px]">
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>

          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-center"
            >
              {errorMsg}
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between items-center">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                currentStep === 1
                  ? 'opacity-0 pointer-events-none'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            {currentStep < 4 ? (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={nextStep}
                className="flex items-center gap-2 px-8 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200"
              >
                Next Step
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
            ) : (
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={status === 'loading' || !formData.courseOfInterest}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg ${
                  status === 'loading' || !formData.courseOfInterest
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white shadow-green-200'
                }`}
              >
                {status === 'loading' ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Inquiry
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                )}
              </motion.button>
            )}
          </div>
        </div>
      </form>

      {/* College Info Footer */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <div className="bg-primary-50 rounded-2xl p-6 border border-primary-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-xl flex items-center justify-center font-bold">
                SVD
              </div>
              <div>
                <h4 className="font-bold text-primary-900">SVD Gurukul Mahavidyalaya</h4>
                <p className="text-sm text-primary-700">Dumduma, Unchgaon, Jaunpur - 223102</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-primary-700">Need Help? Call us at</p>
              <a href="tel:+918400421843" className="text-lg font-bold text-primary-900 hover:underline">
                +91 8400421843
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdmissionInquiry;
