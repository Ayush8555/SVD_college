import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const OfficialMarksheet = ({ student, result }) => {
    if (!student || !result) return null;

    const formatDate = (dateString) => {
        if(!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
    };

    return (
        <div className="p-8 bg-white text-black font-serif" style={{ width: '210mm', minHeight: '297mm' }}>
            {/* Border Container */}
            <div className="border-4 border-double border-gray-800 p-1 h-full relative">
                    <div className="border border-gray-800 p-6 h-full relative">
                        
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="flex justify-center mb-4">
                                {/* Placeholder for Logo if image is available, else Text Logo */}
                                <div className="w-20 h-20 border-2 border-gray-800 rounded-full flex items-center justify-center text-3xl font-bold bg-gray-100">
                                    SVD
                                </div>
                            </div>
                            <h1 className="text-3xl font-bold uppercase tracking-wider mb-1">SVD Gurukul Mahavidyalaya</h1>
                            <p className="text-sm font-semibold uppercase tracking-widest mb-1">Dumduma, Unchgaon, Jaunpur, Uttar Pradesh - 223102</p>
                            <p className="text-xs italic">(Affiliated to V.B.S. Purvanchal University)</p>
                            
                            <div className="mt-6 border-t border-b border-gray-300 py-2">
                                <h2 className="text-xl font-bold uppercase">Statement of Marks</h2>
                                <p className="text-sm font-medium">Session: {result.academicYear}</p>
                            </div>
                        </div>

                        {/* Student Details */}
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm mb-6 font-medium">
                            <div className="flex">
                                <span className="w-32 text-gray-600">Name:</span>
                                <span className="uppercase font-bold">{student.firstName} {student.lastName}</span>
                            </div>
                            <div className="flex">
                                <span className="w-32 text-gray-600">Roll/Reg No:</span>
                                <span className="font-mono font-bold">{student.rollNumber}</span>
                            </div>
                            <div className="flex">
                                <span className="w-32 text-gray-600">Father's Name:</span>
                                <span className="uppercase">{student.fatherName || '________________'}</span>
                            </div>
                            <div className="flex">
                                <span className="w-32 text-gray-600">Course:</span>
                                <span className="uppercase">{student.department || 'B.A'} - Sem {result.semester}</span>
                            </div>
                            <div className="flex">
                                <span className="w-32 text-gray-600">Exam Category:</span>
                                <span className="uppercase">{result.examType}</span>
                            </div>
                        </div>

                        {/* Marks Table */}
                        <table className="w-full border-collapse border border-gray-800 mb-6 text-sm">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="border border-gray-800 p-2 text-left w-20">Code</th>
                                    <th className="border border-gray-800 p-2 text-left">Subject Name</th>
                                    <th className="border border-gray-800 p-2 text-center w-20">Max Marks</th>
                                    <th className="border border-gray-800 p-2 text-center w-16">Ext.</th>
                                    <th className="border border-gray-800 p-2 text-center w-16">Int.</th>
                                    <th className="border border-gray-800 p-2 text-center w-20">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {result.subjects.map((sub, idx) => (
                                    <tr key={idx}>
                                        <td className="border border-gray-800 p-2 font-mono text-xs">{sub.courseCode}</td>
                                        <td className="border border-gray-800 p-2 uppercase">{sub.courseName}</td>
                                        <td className="border border-gray-800 p-2 text-center">{sub.marks.maxMarks || 100}</td>
                                        <td className="border border-gray-800 p-2 text-center">{sub.marks.external}</td>
                                        <td className="border border-gray-800 p-2 text-center">{sub.marks.internal}</td>
                                        <td className="border border-gray-800 p-2 text-center font-bold">{sub.marks.total}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50 font-bold">
                                <tr>
                                    <td colSpan="2" className="border border-gray-800 p-2 text-right">Grand Total</td>
                                    <td className="border border-gray-800 p-2 text-center">
                                        {result.subjects.reduce((sum, s) => sum + (s.marks.maxMarks || 100), 0)}
                                    </td>
                                    <td colSpan="2" className="border border-gray-800 p-2 text-right">Marks Obtained</td>
                                    <td className="border border-gray-800 p-2 text-center">
                                        {result.subjects.reduce((sum, s) => sum + s.marks.total, 0)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>

                        {/* Summary & Result */}
                        <div className="flex justify-between items-start mb-12">
                            <div className="border border-gray-800 p-4 w-1/2 mr-4">
                                <div className="flex justify-between mb-2">
                                    <span>Percentage:</span>
                                    <span className="font-bold">{result.percentage || '0.00'}%</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span>Result Status:</span>
                                    <span className="font-bold uppercase">{result.result}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Date of Issue:</span>
                                    <span>{formatDate(result.declaredDate || new Date())}</span>
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-center justify-center w-1/3 pt-4">
                                <QRCodeSVG 
                                    value={`https://svd-college-portal.com/result?roll=${student.rollNumber}`} 
                                    size={80} 
                                />
                                <p className="text-[10px] text-gray-500 mt-2 text-center">Scan to Verify</p>
                            </div>
                        </div>

                        {/* Footer Signatures */}
                        <div className="flex justify-between items-end mt-auto pt-16 px-8">
                            <div className="text-center">
                                <div className="w-32 border-b border-gray-800 mb-2"></div>
                                <p className="text-xs font-bold uppercase">Prepared By</p>
                            </div>
                            <div className="text-center">
                                <div className="w-32 border-b border-gray-800 mb-2"></div>
                                <p className="text-xs font-bold uppercase">Checked By</p>
                            </div>
                            <div className="text-center">
                                {/* Provide a placeholder image or leave blank for physical stamp */}
                                <div className="w-32 h-16 mb-2 flex items-end justify-center">
                                     <span className="font-script text-xl">Principal_Sign</span>
                                </div>
                                <div className="w-32 border-b border-gray-800 mb-2"></div>
                                <p className="text-xs font-bold uppercase">Controller of Exams</p>
                            </div>
                        </div>

                        {/* Disclaimer */}
                        <div className="absolute bottom-2 left-0 w-full text-center">
                             <p className="text-[10px] text-gray-500">
                                 Note: This is a computer-generated statement. Original marksheet must be collected from the college office.
                             </p>
                        </div>
                    </div>
            </div>
        </div>
    );
};

export default OfficialMarksheet;
