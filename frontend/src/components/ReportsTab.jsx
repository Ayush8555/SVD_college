import React, { useState, useRef } from 'react';

import Card from './ui/Card';
import Button from './ui/Button';
import Table from './ui/Table';
import { useToast } from '../context/ToastContext';
import { resultAPI } from '../utils/api';

const ReportsTab = () => {
    const [filters, setFilters] = useState({
        semester: '1',
        department: '',
        academicYear: '2023-2024'
    });
    const [reportData, setReportData] = useState(null);
    const [reportType, setReportType] = useState(null); // 'merit' or 'gazette'
    const [loading, setLoading] = useState(false);
    
    const toast = useToast();
    const componentRef = useRef();
    
    const handlePrint = () => {
        window.print();
    };

    const generateReport = async (type) => {
        setLoading(true);
        setReportType(type);
        setReportData(null);
        try {
            let res;
            if (type === 'merit') {
                res = await resultAPI.getMeritList({ ...filters, limit: 10 });
            } else {
                res = await resultAPI.getGazette(filters);
            }
            setReportData(res.data.data);
            if (res.data.count === 0) toast.warning("No records found for criteria");
        } catch (err) {
            toast.error("Failed to generate report");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <h1 className="text-2xl font-heading font-bold text-gray-900">Reports Center</h1>
            
            <Card className="print:hidden">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                        <select 
                            className="w-full border-gray-300 rounded-lg p-2"
                            value={filters.academicYear}
                            onChange={e => setFilters({...filters, academicYear: e.target.value})}
                        >
                            <option>2023-2024</option>
                            <option>2024-2025</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                        <select 
                             className="w-full border-gray-300 rounded-lg p-2"
                             value={filters.department}
                             onChange={e => setFilters({...filters, department: e.target.value})}
                        >
                            <option value="">All Departments</option>
                            <option value="B.Sc">B.Sc</option>
                            <option value="B.A">B.A</option>
                            <option value="B.Com">B.Com</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                        <select 
                             className="w-full border-gray-300 rounded-lg p-2"
                             value={filters.semester}
                             onChange={e => setFilters({...filters, semester: e.target.value})}
                        >
                            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            onClick={() => generateReport('merit')} 
                            isLoading={loading && reportType === 'merit'}
                            variant="primary"
                            className="flex-1"
                        >
                            Merit List
                        </Button>
                        <Button 
                            onClick={() => generateReport('gazette')} 
                            isLoading={loading && reportType === 'gazette'}
                            variant="secondary"
                            className="flex-1"
                        >
                            Result Gazette
                        </Button>
                    </div>
                </div>
            </Card>

            {reportData && reportData.length > 0 && (
                <div className="animate-fade-in">
                    <div className="flex justify-end mb-4 print:hidden">
                        <Button onClick={handlePrint} variant="outline" className="gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            Print / Download PDF
                        </Button>
                    </div>

                    <div className="bg-white p-8 shadow-lg print:shadow-none" ref={componentRef} id="printable-area">
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold uppercase">SVD Gurukul Mahavidyalaya</h1>
                            <p className="text-sm text-gray-600 uppercase">Examination Cell</p>
                            <h2 className="text-xl font-bold mt-4 border-b-2 border-black inline-block pb-1 uppercase">
                                {reportType === 'merit' ? 'Merit List (Top 10)' : 'Result Gazette'}
                            </h2>
                            <p className="mt-2 font-medium">Session: {filters.academicYear} | Semester: {filters.semester}</p>
                        </div>

                        <table className="w-full border-collapse border border-gray-800 text-sm">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-800 p-2 text-center w-16">Rank / SN</th>
                                    <th className="border border-gray-800 p-2 text-left">Roll Number</th>
                                    <th className="border border-gray-800 p-2 text-left">Student Name</th>
                                    <th className="border border-gray-800 p-2 text-left">Department</th>
                                    <th className="border border-gray-800 p-2 text-center">Marks / Total</th>
                                    <th className="border border-gray-800 p-2 text-center">SGPA</th>
                                    <th className="border border-gray-800 p-2 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.map((row, idx) => (
                                    <tr key={idx}>
                                        <td className="border border-gray-800 p-2 text-center font-bold">{idx + 1}</td>
                                        <td className="border border-gray-800 p-2 font-mono">{row.student?.rollNumber || row.rollNumber}</td>
                                        <td className="border border-gray-800 p-2 uppercase">{row.student?.firstName} {row.student?.lastName}</td>
                                        <td className="border border-gray-800 p-2">{row.student?.department}</td>
                                        <td className="border border-gray-800 p-2 text-center">
                                            {row.subjects?.reduce((acc,s) => acc + s.marks.total, 0)} / {row.subjects?.length * 100}
                                        </td>
                                        <td className="border border-gray-800 p-2 text-center font-bold">{row.sgpa}</td>
                                        <td className={`border border-gray-800 p-2 text-center font-bold text-xs uppercase ${row.result === 'Pass' ? 'text-green-800' : 'text-red-800'}`}>
                                            {row.result}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        <div className="mt-8 flex justify-between text-xs font-bold pt-8">
                             <div>Date: {new Date().toLocaleDateString()}</div>
                             <div>Controller of Examinations</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsTab;
