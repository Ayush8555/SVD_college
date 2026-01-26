import React, { useState } from 'react';
import axios from 'axios';
import ResultDisplay from '../components/ResultDisplay';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const CheckResult = () => {
  const [formData, setFormData] = useState({ rollNumber: '', dateOfBirth: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultData, setResultData] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResultData(null);

    try {
      const { data } = await axios.post(`${API_URL}/results/check`, formData);
      if (data.data.results && data.data.results.length > 0) {
          setResultData({
              student: data.data.student,
              result: data.data.results[0] 
          });
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'We could not find a result with those details. Please check and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        <div className="text-center mb-10">
           <div className="inline-flex items-center justify-center p-3 bg-white rounded-xl shadow-sm mb-4">
               <span className="text-4xl">🎓</span>
           </div>
           <h1 className="text-3xl font-heading font-extrabold text-gray-900 tracking-tight">
             Student Result Portal
           </h1>
           <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
             Government Engineering College, Pune
           </p>
        </div>

        {!resultData ? (
          <div className="max-w-md mx-auto">
            <Card className="shadow-lg border-t-4 border-t-brand">
              <div className="mb-6 text-center">
                  <h2 className="text-lg font-semibold text-gray-900">Check Your Result</h2>
                  <p className="text-sm text-gray-500">Enter your official details below</p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <Input
                    label="PRN / Roll Number"
                    id="rollNumber"
                    name="rollNumber"
                    placeholder="e.g. CS21005"
                    value={formData.rollNumber}
                    onChange={handleChange}
                    required
                    className="uppercase tracking-wider font-mono"
                    icon={<span className="text-gray-400">#</span>}
                />

                <Input
                    label="Date of Birth"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                />

                {error && (
                    <div className="rounded-lg bg-red-50 p-4 border border-red-100">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-red-800">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                <Button 
                    type="submit" 
                    className="w-full text-lg py-3 shadow-md hover:shadow-lg transform transition-all" 
                    isLoading={loading}
                >
                    View Result
                </Button>
              </form>
            </Card>
            
            <p className="text-center text-xs text-gray-400 mt-6">
                &copy; 2025 Exam Cell, GEC Pune. All Rights Reserved.
            </p>
          </div>
        ) : (
          <div className="animate-fade-in-up">
            <button 
                onClick={() => setResultData(null)}
                className="mb-6 group flex items-center text-sm font-medium text-brand hover:text-brand-dark transition-colors bg-white px-4 py-2 rounded-full shadow-sm hover:shadow-md"
            >
                <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> 
                Search Another Result
            </button>
            <ResultDisplay result={resultData.result} student={resultData.student} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckResult;
