import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Animated number counter component
const AnimatedCounter = ({ value, suffix = '', duration = 1500 }) => {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
        let start = 0;
        const end = parseFloat(value);
        const incrementTime = duration / (end || 1);
        
        const timer = setInterval(() => {
            start += end / (duration / 20);
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.round(start * 10) / 10);
            }
        }, 20);
        
        return () => clearInterval(timer);
    }, [value, duration]);
    
    return <>{count.toFixed(suffix === '%' ? 1 : 0)}{suffix}</>;
};

// Circular progress component
const CircularProgress = ({ percentage, size = 140, strokeWidth = 10, color = '#ff8f00' }) => {
    const [progress, setProgress] = useState(0);
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;
    
    useEffect(() => {
        const timer = setTimeout(() => setProgress(percentage), 300);
        return () => clearTimeout(timer);
    }, [percentage]);
    
    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                <circle
                    className="text-gray-200"
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                <circle
                    className="transition-all duration-1000 ease-out"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    stroke={color}
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    style={{ strokeDasharray: circumference, strokeDashoffset }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">
                    <AnimatedCounter value={percentage} suffix="%" />
                </span>
                <span className="text-xs text-gray-500 uppercase tracking-wider">Score</span>
            </div>
        </div>
    );
};

// Subject progress bar
const SubjectBar = ({ subject, index }) => {
    const [width, setWidth] = useState(0);
    const percentage = (subject.marks.total / 100) * 100;
    const isPassed = percentage >= 40;
    
    useEffect(() => {
        const timer = setTimeout(() => setWidth(percentage), 200 + index * 100);
        return () => clearTimeout(timer);
    }, [percentage, index]);
    
    return (
        <div 
            className="group bg-white rounded-xl p-4 border border-gray-100 hover:border-primary-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                        {subject.name || subject.courseName}
                    </p>
                    <p className="text-xs text-gray-500 font-mono">{subject.code || subject.courseCode}</p>
                </div>
                <div className="flex items-center gap-2 ml-3">
                    <span className={`text-lg font-bold ${isPassed ? 'text-green-600' : 'text-red-500'}`}>
                        {subject.marks.total}
                    </span>
                    <span className="text-xs text-gray-400">/100</span>
                </div>
            </div>
            
            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                    className={`absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ease-out ${
                        isPassed 
                            ? 'bg-gradient-to-r from-green-400 to-green-500' 
                            : 'bg-gradient-to-r from-red-400 to-red-500'
                    }`}
                    style={{ width: `${width}%` }}
                />
                {/* Shimmer effect */}
                <div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"
                    style={{ width: `${width}%` }}
                />
            </div>
            
            <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>Internal: <span className="font-semibold text-gray-700">{subject.marks.internal}</span></span>
                <span>External: <span className="font-semibold text-gray-700">{subject.marks.external}</span></span>
            </div>
        </div>
    );
};

const ResultPage = () => {
    const [formData, setFormData] = useState({ rollNumber: '', dateOfBirth: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [resultData, setResultData] = useState(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const location = useLocation();

    useEffect(() => {
        if (location.state && location.state.resultData) {
            setResultData(location.state.resultData);
            if (location.state.resultData.result?.result === 'Pass') {
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 5000);
            }
        }
    }, [location]);

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
                const result = {
                    student: data.data.student,
                    result: data.data.results[0]
                };
                setResultData(result);
                
                if (result.result.result === 'Pass') {
                    setShowConfetti(true);
                    setTimeout(() => setShowConfetti(false), 5000);
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Result not found. Please verify your details.');
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setResultData(null);
        setFormData({ rollNumber: '', dateOfBirth: '' });
        setError(null);
    };

    const handlePrint = () => {
        if (!resultData) return;
        const { student, result } = resultData;
        const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
        const totalObtained = result.subjects.reduce((sum, s) => sum + s.marks.total, 0);
        const totalMax = result.subjects.reduce((sum, s) => sum + (s.marks.maxMarks || 100), 0);
        const division = result.division || (result.percentage >= 60 ? 'FIRST' : result.percentage >= 45 ? 'SECOND' : 'THIRD');
        const logoUrl = window.location.origin + '/vbspu-logo.png';
        const studentName = student.name || ((student.firstName || '') + ' ' + (student.lastName || ''));

        const subjectRows = result.subjects.map((sub, idx) =>
          '<tr>' +
            '<td style="border:1px solid #333;padding:6px 10px;text-transform:uppercase;font-size:13px;">Paper ' + (romanNumerals[idx] || (idx+1)) + ' : ' + sub.courseName + '</td>' +
            '<td style="border:1px solid #333;padding:6px 10px;text-align:center;font-weight:bold;font-size:13px;">' + String(sub.marks.total).padStart(3,'0') + '</td>' +
            '<td style="border:1px solid #333;padding:6px 10px;text-align:center;font-size:13px;">' + (sub.marks.maxMarks || 100) + '</td>' +
          '</tr>'
        ).join('');

        const fullHtml = '<!DOCTYPE html>' +
'<html><head><meta charset="UTF-8">' +
'<title>Marksheet - ' + studentName + '</title>' +
'<style>' +
'@page { size: A4; margin: 10mm 15mm; }' +
'* { margin: 0; padding: 0; box-sizing: border-box; }' +
'body { font-family: "Times New Roman", Georgia, serif; color: #000; background: #fff; font-size: 14px; }' +
'</style></head><body>' +
'<div style="padding:10mm 5mm;max-width:210mm;margin:0 auto;">' +

'<div style="display:flex;align-items:center;justify-content:center;margin-bottom:8px;">' +
'<img src="' + logoUrl + '" alt="Logo" style="width:75px;height:75px;object-fit:contain;margin-right:20px;" />' +
'<div style="text-align:center;">' +
'<h1 style="font-size:20px;font-weight:bold;letter-spacing:0.5px;margin:0;">VEER BAHADUR SINGH PURVANCHAL UNIVERSITY, JAUNPUR</h1>' +
'<h2 style="font-size:17px;font-weight:bold;margin-top:4px;">वीर बहादुर सिंह पूर्वांचल विश्वविद्यालय, जौनपुर</h2>' +
'</div></div>' +

'<div style="text-align:center;margin-bottom:20px;">' +
'<p style="font-size:14px;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">STATEMENT OF MARKS &amp; GRADE SHEET</p>' +
'<p style="font-size:13px;font-weight:bold;text-transform:uppercase;">' + (student.department || '') + ' ' + (result.semester || '') + ' SEMESTER EXAMINATION &#8211; ' + (result.academicYear || '') + '</p>' +
'</div>' +

'<table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:13px;">' +
'<tr><td style="padding:6px 0;width:25%;"><strong>Name</strong></td>' +
'<td style="padding:6px 0;width:25%;text-transform:uppercase;">: ' + studentName + '</td>' +
'<td style="padding:6px 0;width:25%;"><strong>Roll No.</strong></td>' +
'<td style="padding:6px 0;width:25%;font-weight:bold;">: ' + student.rollNumber + '</td></tr>' +
'<tr><td style="padding:6px 0;"><strong>Father\'s Name</strong></td>' +
'<td style="padding:6px 0;text-transform:uppercase;">: ' + (student.fatherName || '—') + '</td>' +
'<td style="padding:6px 0;"><strong>Enrolment No.</strong></td>' +
'<td style="padding:6px 0;">: ' + (student.enrollmentNo || '') + '</td></tr>' +
'<tr><td style="padding:6px 0;"><strong>Mother\'s Name</strong></td>' +
'<td style="padding:6px 0;text-transform:uppercase;">: ' + (student.motherName || '—') + '</td>' +
'<td style="padding:6px 0;"><strong>Category</strong></td>' +
'<td style="padding:6px 0;">: ' + (student.category || 'Regular') + '</td></tr>' +
'</table>' +
'<div style="margin-bottom:20px;font-size:13px;"><strong>Name of Institution / College</strong>' +
'<span style="margin-left:20px;text-transform:uppercase;">: (647) S V D GURUKUL VIDHI MAHAVIDYALAY, DUMDUMA, UNCHGAON, JAUNPUR</span></div>' +

'<table style="width:100%;border-collapse:collapse;margin-bottom:10px;">' +
'<thead><tr>' +
'<th style="border:1px solid #333;padding:8px 10px;text-align:left;font-size:14px;font-weight:bold;width:60%;">PAPERS</th>' +
'<th style="border:1px solid #333;padding:8px 10px;text-align:center;font-size:14px;font-weight:bold;width:20%;">MARKS OBTAINED</th>' +
'<th style="border:1px solid #333;padding:8px 10px;text-align:center;font-size:14px;font-weight:bold;width:20%;">MAX MARKS</th>' +
'</tr></thead><tbody>' +
subjectRows +
'</tbody><tfoot>' +
'<tr><td style="border:1px solid #333;padding:6px 10px;"></td>' +
'<td style="border:1px solid #333;padding:6px 10px;text-align:center;font-weight:bold;font-size:14px;">TOTAL</td>' +
'<td style="border:1px solid #333;padding:6px 10px;text-align:center;font-weight:bold;font-size:14px;">' + totalObtained + ' / ' + totalMax + '</td></tr>' +
'<tr><td style="border:1px solid #333;padding:6px 10px;font-weight:bold;font-size:13px;">RESULT: ' + (result.result || 'PASS').toUpperCase() + '</td>' +
'<td style="border:1px solid #333;padding:6px 10px;text-align:right;font-weight:bold;font-size:13px;" colspan="2">DIVISION: ' + division + '</td></tr>' +
'</tfoot></table>' +

'<div style="border:1px solid #ccc;padding:10px;margin:20px 0;font-size:11px;line-height:1.5;">' +
'<span style="color:#dc2626;font-weight:bold;">Disclaimer : </span>' +
'<span>Neither webmaster nor Veer Bahadur Singh Purvanchal University is responsible for any inadvertent error that may crept in the results being published on NET. The results published on net are immediate information for Students. This cannot be treated as original mark sheet. Original mark sheets will be issued by the Controller of Examinations office, Veer Bahadur Singh Purvanchal University, separately.</span>' +
'</div>' +

'<div style="font-size:11px;color:#666;"><p>Copyright &copy; ' + new Date().getFullYear() + ' VBSPU | All rights reserved.</p></div>' +

'</div>' +
'<script>window.onload=function(){setTimeout(function(){window.print();},800);};<\/script>' +
'</body></html>';

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Please allow pop-ups to print the marksheet.');
            return;
        }
        printWindow.document.open();
        printWindow.document.write(fullHtml);
        printWindow.document.close();
    };

    const getGradeInfo = (percentage) => {
        if (percentage >= 90) return { grade: 'A+', label: 'Outstanding', color: 'from-emerald-400 to-emerald-600' };
        if (percentage >= 80) return { grade: 'A', label: 'Excellent', color: 'from-green-400 to-green-600' };
        if (percentage >= 70) return { grade: 'B+', label: 'Very Good', color: 'from-blue-400 to-blue-600' };
        if (percentage >= 60) return { grade: 'B', label: 'Good', color: 'from-cyan-400 to-cyan-600' };
        if (percentage >= 50) return { grade: 'C', label: 'Average', color: 'from-yellow-400 to-yellow-600' };
        if (percentage >= 40) return { grade: 'D', label: 'Pass', color: 'from-orange-400 to-orange-600' };
        return { grade: 'F', label: 'Fail', color: 'from-red-400 to-red-600' };
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 font-sans flex flex-col">
            <Navbar />
            
            {/* Confetti Effect */}
            {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
                    {[...Array(50)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute animate-float"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `-20px`,
                                animationDelay: `${Math.random() * 2}s`,
                                animationDuration: `${3 + Math.random() * 2}s`,
                            }}
                        >
                            <div 
                                className="w-3 h-3 rounded-sm"
                                style={{
                                    backgroundColor: ['#ff8f00', '#0056e0', '#22c55e', '#f59e0b', '#ec4899'][Math.floor(Math.random() * 5)],
                                    transform: `rotate(${Math.random() * 360}deg)`,
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Hero Section */}
            <div className="relative py-16 overflow-hidden no-print">
                {/* Animated Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-accent-500/20 rounded-full blur-3xl animate-float"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl animate-floatReverse"></div>
                    <div className="absolute top-40 right-1/4 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
                </div>
                
                {/* Grid pattern overlay */}
                <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '50px 50px'
                }}></div>

                <div className="max-w-5xl mx-auto px-4 relative z-10">
                    <Link to="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8 group">
                        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span className="text-sm font-medium">Back to Home</span>
                    </Link>
                    
                    <div className="text-center">
                        <div className="inline-flex items-center gap-3 mb-6">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent-500/20 border border-accent-500/30 backdrop-blur-sm">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-accent-500"></span>
                                </span>
                                <span className="text-accent-400 text-sm font-bold uppercase tracking-widest">Live Results</span>
                            </div>
                        </div>
                        
                        <h1 className="text-4xl md:text-6xl font-heading font-extrabold text-white mb-4 tracking-tight">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-accent-200 to-white">
                                Examination Results
                            </span>
                        </h1>
                        <p className="text-primary-200 text-lg max-w-2xl mx-auto">
                            Your academic journey visualized with detailed insights and performance analytics
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-grow py-12 px-4 -mt-8">
                <div className="max-w-5xl mx-auto">
                    {!resultData ? (
                        /* Search Form */
                        <div className="max-w-lg mx-auto animate-fadeInUp">
                            <div className="relative group">
                                {/* Glowing border effect */}
                                <div className="absolute -inset-1 bg-gradient-to-r from-accent-500 via-primary-500 to-accent-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition duration-500"></div>
                                
                                <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">
                                    {/* Top gradient bar */}
                                    <div className="h-1.5 bg-gradient-to-r from-accent-400 via-primary-500 to-accent-400"></div>
                                    
                                    <div className="p-8">
                                        <div className="text-center mb-8">
                                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white mb-4 shadow-lg shadow-primary-500/30">
                                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                                                Check Your Result
                                            </h2>
                                            <p className="text-gray-500 text-sm">
                                                Enter your credentials to unlock your academic performance
                                            </p>
                                        </div>

                                        <form className="space-y-6" onSubmit={handleSubmit}>
                                            <div className="space-y-5">
                                                <div className="group/input">
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Roll Number / PRN
                                                    </label>
                                                    <div className="relative">
                                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-primary-500 transition-colors">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 9a2 2 0 10-4 0v5a2 2 0 01-2 2h6m-6-4h4m8 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            name="rollNumber"
                                                            value={formData.rollNumber}
                                                            onChange={handleChange}
                                                            placeholder="e.g. SVD23001"
                                                            required
                                                            className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-gray-900 font-mono uppercase tracking-wider"
                                                        />
                                                    </div>
                                                </div>
                                                
                                                <div className="group/input">
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Date of Birth
                                                    </label>
                                                    <div className="relative">
                                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-primary-500 transition-colors">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                        <input
                                                            type="date"
                                                            name="dateOfBirth"
                                                            value={formData.dateOfBirth}
                                                            onChange={handleChange}
                                                            required
                                                            className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-gray-900"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {error && (
                                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-shake">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                                            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-red-800">Result Not Found</p>
                                                            <p className="text-sm text-red-600">{error}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <button 
                                                type="submit"
                                                disabled={loading}
                                                className="relative w-full py-4 px-6 rounded-xl font-bold text-white overflow-hidden group/btn disabled:opacity-70"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-600 transition-all duration-300 group-hover/btn:from-primary-700 group-hover/btn:via-primary-800 group-hover/btn:to-primary-700"></div>
                                                <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                                                </div>
                                                <span className="relative z-10 flex items-center justify-center gap-2">
                                                    {loading ? (
                                                        <>
                                                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Searching...
                                                        </>
                                                    ) : (
                                                        <>
                                                            View Result
                                                            <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                            </svg>
                                                        </>
                                                    )}
                                                </span>
                                            </button>
                                        </form>

                                        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                                            <p className="text-xs text-gray-400">
                                                Having trouble? Contact the <a href="/contact" className="text-primary-600 font-semibold hover:underline">Examination Cell</a>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Result Display */
                        <div className="animate-fadeInUp">
                            <button 
                                onClick={handleClear}
                                className="mb-8 inline-flex items-center gap-2 text-white/80 hover:text-white bg-white/10 backdrop-blur-sm px-5 py-2.5 rounded-lg font-medium hover:bg-white/20 transition-all border border-white/20"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Check Another Result
                            </button>

                            {/* Result Header Card */}
                            <div className="relative group mb-8">
                                <div className="absolute -inset-1 bg-gradient-to-r from-accent-500 via-primary-500 to-accent-500 rounded-2xl blur-lg opacity-30"></div>
                                <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
                                    <div className="h-2 bg-gradient-to-r from-accent-400 via-primary-500 to-accent-400"></div>
                                    
                                    <div className="p-8">
                                        <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
                                            {/* Student Info */}
                                            <div className="flex-1 text-center lg:text-left">
                                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-bold uppercase tracking-wider mb-4">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                                                    {resultData.result.examType} • {resultData.result.academicYear}
                                                </div>
                                                
                                                <h2 className="text-3xl font-heading font-bold text-gray-900 mb-2">
                                                    {resultData.student.name || `${resultData.student.firstName} ${resultData.student.lastName}`}
                                                </h2>
                                                
                                                <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm text-gray-600">
                                                    <span className="flex items-center gap-1.5">
                                                        <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                                                        <span className="font-mono font-semibold">{resultData.student.rollNumber}</span>
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>
                                                        {resultData.student.department}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Circular Progress & Grade */}
                                            <div className="flex items-center gap-6">
                                                <CircularProgress 
                                                    percentage={resultData.result.percentage} 
                                                    color={resultData.result.result === 'Pass' ? '#22c55e' : '#ef4444'}
                                                />
                                                
                                                <div className="text-center">
                                                    {(() => {
                                                        const gradeInfo = getGradeInfo(resultData.result.percentage);
                                                        return (
                                                            <div className={`px-6 py-4 rounded-2xl bg-gradient-to-br ${gradeInfo.color} shadow-lg`}>
                                                                <div className="text-3xl font-bold text-white">{gradeInfo.grade}</div>
                                                                <div className="text-xs text-white/80 uppercase tracking-wider font-semibold">{gradeInfo.label}</div>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Result Status Badge */}
                                        <div className="mt-8 flex justify-center">
                                            <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full font-bold text-lg ${
                                                resultData.result.result === 'Pass' 
                                                    ? 'bg-green-100 text-green-700 border-2 border-green-200' 
                                                    : 'bg-red-100 text-red-700 border-2 border-red-200'
                                            }`}>
                                                {resultData.result.result === 'Pass' ? (
                                                    <>
                                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        Congratulations! You Passed
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                        </svg>
                                                        Not Passed - Keep Working Hard
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Subject-wise Performance */}
                            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
                                <div className="p-6 border-b border-gray-100">
                                    <h3 className="text-xl font-heading font-bold text-gray-900 flex items-center gap-2">
                                        <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                        Subject-wise Performance
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">Detailed breakdown of your marks in each subject</p>
                                </div>
                                
                                <div className="p-6 grid gap-4 md:grid-cols-2">
                                    {resultData.result.subjects.map((subject, index) => (
                                        <SubjectBar key={index} subject={subject} index={index} />
                                    ))}
                                </div>
                            </div>

                            {/* Summary Stats */}
                            <div className="grid md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/20">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-blue-100 text-sm font-medium">Total Subjects</p>
                                            <p className="text-3xl font-bold">{resultData.result.subjects.length}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl shadow-purple-500/20">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-purple-100 text-sm font-medium">Total Marks</p>
                                            <p className="text-3xl font-bold">
                                                <AnimatedCounter value={resultData.result.subjects.reduce((sum, sub) => sum + (sub.marks.total || 0), 0)} />
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl p-6 text-white shadow-xl shadow-accent-500/20">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-accent-100 text-sm font-medium">Result Declared</p>
                                            <p className="text-lg font-bold">{new Date(resultData.result.declaredDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Print Button */}
                            <div className="flex justify-center">
                                <button 
                                    onClick={handlePrint}
                                    className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    Print Official Marksheet
                                </button>
                            </div>

                            {/* Footer Note */}
                            <div className="mt-8 text-center">
                                <p className="text-xs text-white/40">
                                    This is a computer generated result. Original grade cards will be issued by the department.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ResultPage;
