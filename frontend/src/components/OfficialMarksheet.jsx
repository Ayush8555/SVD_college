import React from 'react';

const OfficialMarksheet = ({ student, result }) => {
    if (!student || !result) return null;

    const formatDate = (dateString) => {
        if(!dateString) return '';
        const d = new Date(dateString);
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    };

    const totalObtained = result.subjects.reduce((sum, s) => sum + s.marks.total, 0);
    const totalMax = result.subjects.reduce((sum, s) => sum + (s.marks.maxMarks || 100), 0);
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

    return (
        <div className="marksheet">
            {/* Header */}
            <div className="header">
                <img src="/vbspu-logo.png" alt="VBSPU Logo" />
                <div className="header-text">
                    <h1>VEER BAHADUR SINGH PURVANCHAL UNIVERSITY, JAUNPUR</h1>
                    <h2>वीर बहादुर सिंह पूर्वांचल विश्वविद्यालय, जौनपुर</h2>
                </div>
            </div>

            {/* Title */}
            <div className="title">
                <h3>STATEMENT OF MARKS &amp; GRADE SHEET</h3>
                <p>{student.department} {result.semester} SEMESTER EXAMINATION - {result.academicYear}</p>
            </div>

            {/* Student Details */}
            <div className="student-details">
                <div className="detail-row">
                    <div className="detail-item">
                        <span className="detail-label">Name</span>
                        <span className="font-bold uppercase">: {student.firstName} {student.lastName}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Roll No.</span>
                        <span className="font-bold">: {student.rollNumber}</span>
                    </div>
                </div>
                <div className="detail-row">
                    <div className="detail-item">
                        <span className="detail-label">Father's Name</span>
                        <span className="uppercase">: {student.fatherName || '________________'}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Enrolment No.</span>
                        <span>: {student.enrollmentNo || ''}</span>
                    </div>
                </div>
                <div className="detail-row">
                    <div className="detail-item">
                        <span className="detail-label">Mother's Name</span>
                        <span className="uppercase">: {student.motherName || '________________'}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Category</span>
                        <span>: {student.category || 'Regular'}</span>
                    </div>
                </div>
                <div className="detail-full">
                    <span className="detail-label-blue">Name of Institution / College</span>
                    <span className="uppercase">: (647) S V D GURUKUL VIDHI MAHAVIDYALAY, DUMDUMA, UNCHGAON, JAUNPUR</span>
                </div>
            </div>

            {/* Marks Table */}
            <table>
                <thead>
                    <tr>
                        <th style={{ width: '55%' }}>PAPERS</th>
                        <th className="text-center" style={{ width: '25%' }}>MARKS OBTAINED</th>
                        <th className="text-center" style={{ width: '20%' }}>MAX MARKS</th>
                    </tr>
                </thead>
                <tbody>
                    {result.subjects.map((sub, idx) => (
                        <tr key={idx}>
                            <td className="uppercase">
                                Paper {romanNumerals[idx] || (idx + 1)} : {sub.courseName}
                            </td>
                            <td className="text-center font-bold">
                                {String(sub.marks.total).padStart(3, '0')}
                            </td>
                            <td className="text-center">
                                {sub.marks.maxMarks || 100}
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td className="font-bold uppercase">TOTAL</td>
                        <td className="text-center font-bold">{totalObtained} / {totalMax}</td>
                        <td className="text-center"></td>
                    </tr>
                </tfoot>
            </table>

            {/* Result */}
            <div className="result-section">
                <div>
                    <p className="font-bold">RESULT: {result.result?.toUpperCase() || 'PASSED'}</p>
                    <p className="font-bold">DIVISION: {result.division || (result.percentage >= 60 ? 'FIRST' : result.percentage >= 45 ? 'SECOND' : 'THIRD')}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p className="font-bold">GRAND TOTAL: {totalObtained} / {totalMax}</p>
                </div>
            </div>

            {/* Date + Signature */}
            <div className="signature-section">
                <div style={{ fontSize: '13px' }}>
                    <p className="font-bold">Dated : {formatDate(result.declaredDate || new Date())}</p>
                </div>
                <div className="signature-right">
                    <svg width="120" height="50" viewBox="0 0 120 50" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '4px' }}>
                        <path d="M10 35 C15 20, 25 15, 30 25 C35 35, 40 10, 50 20 C55 25, 45 35, 55 30 C65 25, 60 15, 70 20 C75 23, 72 30, 80 25 C85 22, 82 18, 90 22 C95 24, 92 28, 100 25 C105 23, 108 20, 115 22" 
                            stroke="#1a237e" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                        <path d="M25 38 C30 36, 40 42, 50 38 C55 36, 60 40, 70 37" 
                            stroke="#1a237e" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                    </svg>
                    <p className="font-bold" style={{ fontSize: '13px' }}>Controller of Examinations</p>
                </div>
            </div>

            {/* Disclaimer */}
            <div className="disclaimer">
                <span className="disclaimer-label">Disclaimer : </span>
                <span>
                    Neither webmaster nor Veer Bahadur Singh Purvanchal University is responsible for any inadvertent error that may crept in the results being published on NET. The results published on net are immediate information for Students. This cannot be treated as original mark sheet. Original mark sheets will be issued by the Controller of Examinations office, Veer Bahadur Singh Purvanchal University, separately.
                </span>
            </div>

            {/* Copyright */}
            <div className="copyright">
                <p>Copyright © {new Date().getFullYear()} VBSPU | All rights reserved.</p>
            </div>
        </div>
    );
};

export default OfficialMarksheet;
