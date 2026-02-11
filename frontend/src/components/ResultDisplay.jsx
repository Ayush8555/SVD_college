import React, { useRef } from 'react';
import Button from './ui/Button';

const ResultDisplay = ({ result, student }) => {
  const componentRef = useRef();

  const handlePrint = () => {
    if (!result || !student) return;

    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
    const totalObtained = result.subjects.reduce((sum, s) => sum + s.marks.total, 0);
    const totalMax = result.subjects.reduce((sum, s) => sum + (s.marks.maxMarks || 100), 0);
    const formatDate = (d) => {
      const dt = new Date(d);
      return `${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}`;
    };
    const division = result.division || (result.percentage >= 60 ? 'FIRST' : result.percentage >= 45 ? 'SECOND' : 'THIRD');
    const logoUrl = `${window.location.origin}/vbspu-logo.png`;

    // Build subject rows as raw HTML string
    const subjectRows = result.subjects.map((sub, idx) => `
      <tr>
        <td style="border:1px solid #111;padding:8px;text-transform:uppercase;">Paper ${romanNumerals[idx] || (idx+1)} : ${sub.courseName}</td>
        <td style="border:1px solid #111;padding:8px;text-align:center;font-weight:bold;">${String(sub.marks.total).padStart(3,'0')}</td>
        <td style="border:1px solid #111;padding:8px;text-align:center;">${sub.marks.maxMarks || 100}</td>
      </tr>
    `).join('');

    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Official Marksheet - ${student.firstName} ${student.lastName}</title>
  <style>
    @page { size: A4; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Times New Roman', Georgia, serif; color: #000; background: #fff; }
  </style>
</head>
<body>
  <div style="padding:15mm 20mm;width:210mm;min-height:297mm;">
    <!-- Header -->
    <div style="display:flex;align-items:center;justify-content:center;margin-bottom:16px;">
      <img src="${logoUrl}" alt="VBSPU Logo" style="width:80px;height:80px;object-fit:contain;margin-right:16px;" />
      <div style="text-align:center;">
        <h1 style="font-size:22px;font-weight:bold;letter-spacing:1px;">VEER BAHADUR SINGH PURVANCHAL UNIVERSITY, JAUNPUR</h1>
        <h2 style="font-size:18px;font-weight:bold;margin-top:2px;">वीर बहादुर सिंह पूर्वांचल विश्वविद्यालय, जौनपुर</h2>
      </div>
    </div>

    <!-- Title -->
    <div style="text-align:center;margin-bottom:24px;">
      <h3 style="font-size:16px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">STATEMENT OF MARKS &amp; GRADE SHEET</h3>
      <p style="font-size:14px;font-weight:bold;text-transform:uppercase;margin-top:4px;">${student.department} ${result.semester} SEMESTER EXAMINATION - ${result.academicYear}</p>
    </div>

    <!-- Student Details -->
    <div style="margin-bottom:24px;font-size:13px;line-height:2.2;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 32px;">
        <div style="display:flex;"><span style="font-weight:bold;width:170px;flex-shrink:0;">Name</span><span style="font-weight:bold;text-transform:uppercase;">: ${student.firstName} ${student.lastName}</span></div>
        <div style="display:flex;"><span style="font-weight:bold;width:170px;flex-shrink:0;">Roll No.</span><span style="font-weight:bold;">: ${student.rollNumber}</span></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 32px;">
        <div style="display:flex;"><span style="font-weight:bold;width:170px;flex-shrink:0;">Father's Name</span><span style="text-transform:uppercase;">: ${student.fatherName || '________________'}</span></div>
        <div style="display:flex;"><span style="font-weight:bold;width:170px;flex-shrink:0;">Enrolment No.</span><span>: ${student.enrollmentNo || ''}</span></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 32px;">
        <div style="display:flex;"><span style="font-weight:bold;width:170px;flex-shrink:0;">Mother's Name</span><span style="text-transform:uppercase;">: ${student.motherName || '________________'}</span></div>
        <div style="display:flex;"><span style="font-weight:bold;width:170px;flex-shrink:0;">Category</span><span>: ${student.category || 'Regular'}</span></div>
      </div>
      <div style="display:flex;margin-top:4px;">
        <span style="font-weight:bold;width:170px;flex-shrink:0;color:#1565c0;">Name of Institution / College</span>
        <span style="text-transform:uppercase;">: (647) S V D GURUKUL VIDHI MAHAVIDYALAY, DUMDUMA, UNCHGAON, JAUNPUR</span>
      </div>
    </div>

    <!-- Table -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:13px;">
      <thead>
        <tr>
          <th style="border:1px solid #111;padding:8px;text-align:left;width:55%;">PAPERS</th>
          <th style="border:1px solid #111;padding:8px;text-align:center;width:25%;">MARKS OBTAINED</th>
          <th style="border:1px solid #111;padding:8px;text-align:center;width:20%;">MAX MARKS</th>
        </tr>
      </thead>
      <tbody>
        ${subjectRows}
      </tbody>
      <tfoot>
        <tr>
          <td style="border:1px solid #111;padding:8px;font-weight:bold;text-transform:uppercase;">TOTAL</td>
          <td style="border:1px solid #111;padding:8px;text-align:center;font-weight:bold;">${totalObtained} / ${totalMax}</td>
          <td style="border:1px solid #111;padding:8px;text-align:center;"></td>
        </tr>
      </tfoot>
    </table>

    <!-- Result -->
    <div style="display:flex;justify-content:space-between;margin-bottom:32px;font-size:13px;">
      <div>
        <p style="font-weight:bold;">RESULT: ${(result.result || 'PASSED').toUpperCase()}</p>
        <p style="font-weight:bold;">DIVISION: ${division}</p>
      </div>
      <div style="text-align:right;">
        <p style="font-weight:bold;">GRAND TOTAL: ${totalObtained} / ${totalMax}</p>
      </div>
    </div>

    <!-- Date + Signature -->
    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:48px;margin-bottom:24px;">
      <div style="font-size:13px;">
        <p style="font-weight:bold;">Dated : ${formatDate(result.declaredDate || new Date())}</p>
      </div>
      <div style="text-align:center;display:flex;flex-direction:column;align-items:center;">
        <svg width="120" height="50" viewBox="0 0 120 50" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-bottom:4px;">
          <path d="M10 35 C15 20, 25 15, 30 25 C35 35, 40 10, 50 20 C55 25, 45 35, 55 30 C65 25, 60 15, 70 20 C75 23, 72 30, 80 25 C85 22, 82 18, 90 22 C95 24, 92 28, 100 25 C105 23, 108 20, 115 22" stroke="#1a237e" stroke-width="1.8" stroke-linecap="round" fill="none" />
          <path d="M25 38 C30 36, 40 42, 50 38 C55 36, 60 40, 70 37" stroke="#1a237e" stroke-width="1.2" stroke-linecap="round" fill="none" />
        </svg>
        <p style="font-size:13px;font-weight:bold;">Controller of Examinations</p>
      </div>
    </div>

    <!-- Disclaimer -->
    <div style="border:1px solid #999;padding:12px;margin-bottom:16px;font-size:11px;line-height:1.6;">
      <span style="color:#dc2626;font-weight:bold;">Disclaimer : </span>
      <span>Neither webmaster nor Veer Bahadur Singh Purvanchal University is responsible for any inadvertent error that may crept in the results being published on NET. The results published on net are immediate information for Students. This cannot be treated as original mark sheet. Original mark sheets will be issued by the Controller of Examinations office, Veer Bahadur Singh Purvanchal University, separately.</span>
    </div>

    <!-- Copyright -->
    <div style="font-size:11px;color:#666;">
      <p>Copyright &copy; ${new Date().getFullYear()} VBSPU | All rights reserved.</p>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 800);
    };
  </script>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to print the marksheet.');
      return;
    }
    printWindow.document.open();
    printWindow.document.write(fullHtml);
    printWindow.document.close();
  };

  if (!result || !student) return null;

  const getGradeColor = (grade) => {
      if(grade === 'O' || grade === 'A+') return 'text-green-700';
      if(grade === 'F' || grade === 'AB') return 'text-red-600 font-bold';
      return 'text-gray-900';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end no-print">
        <Button onClick={handlePrint} variant="outline" className="gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            Print Official Marksheet
        </Button>
      </div>

      <div 
        ref={componentRef} 
        className="bg-white p-4 md:p-12 rounded-xl shadow-lg border border-gray-200 relative overflow-hidden font-serif print:shadow-none print:border-none print:p-0 print:m-0"
      >
        {/* Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none z-0 overflow-hidden">
             <div className="transform -rotate-45 text-4xl md:text-8xl font-bold text-gray-900 whitespace-nowrap border-4 border-gray-900 p-4 rounded-3xl">
                 SVD
             </div>
        </div>

        <div className="relative z-10">
            {/* Header */}
            <header className="border-b-4 border-primary-900 pb-6 mb-8 text-center relative">
                <div className="flex items-center justify-center mb-6 border-b-2 border-gray-900 pb-4">
                     {/* Logo */}
                     <div className="flex-shrink-0 mr-4">
                         <img 
                             src="/vbspu-logo.png" 
                             alt="VBSPU Logo" 
                             className="w-16 h-16 md:w-24 md:h-24 object-contain"
                         />
                     </div>
                     
                     {/* University Name */}
                     <div className="text-center">
                         <h1 className="text-xl md:text-3xl font-bold text-gray-900 font-serif leading-tight">
                             VEER BAHADUR SINGH PURVANCHAL UNIVERSITY, JAUNPUR
                         </h1>
                         <h2 className="text-lg md:text-2xl font-bold text-gray-800 font-serif mt-1">
                             वीर बहादुर सिंह पूर्वांचल विश्वविद्यालय, जौनपुर
                         </h2>
                     </div>
                </div>

                <div className="text-center mb-6">
                    <h3 className="text-lg md:text-xl font-bold uppercase tracking-wider underline underline-offset-4 mb-2">STATEMENT OF MARKS</h3>
                    <p className="text-sm md:text-lg font-bold uppercase">
                        (647) S V D GURUKUL VIDHI MAHAVIDYALAY, DUMDUMA, UNCHGAON, JAUNPUR
                    </p>
                </div>
                <div className="mt-8 relative inline-block max-w-full">
                    <span className="relative z-10 px-4 md:px-8 py-2 bg-white text-lg md:text-xl font-bold text-gray-900 uppercase tracking-wider border-2 border-primary-900 block md:inline-block">
                        Statement of Marks
                    </span>
                    <div className="absolute top-1 left-1 w-full h-full bg-primary-900 -z-0 hidden md:block"></div>
                </div>
                <p className="mt-4 text-sm md:text-lg font-semibold text-gray-700 font-mono">
                    {result.examType} Examination • {result.academicYear}
                </p>
            </header>

            {/* Student Info */}
            <section className="bg-gray-50 border border-gray-200 p-3 md:p-5 rounded-lg mb-8 text-xs md:text-base">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 md:gap-y-3 gap-x-8">
                    <div className="flex border-b border-gray-200 pb-2 md:border-none md:pb-0">
                        <span className="font-bold text-gray-500 w-24 md:w-32 uppercase text-[10px] md:text-xs tracking-wider shrink-0">Candidate Name</span>
                        <span className="font-bold text-gray-900 uppercase">{student.name || `${student.firstName} ${student.lastName}`}</span>
                    </div>
                    <div className="flex border-b border-gray-200 pb-2 md:border-none md:pb-0">
                        <span className="font-bold text-gray-500 w-24 md:w-32 uppercase text-[10px] md:text-xs tracking-wider shrink-0">Roll Number</span>
                        <span className="font-mono font-bold text-gray-900">{student.rollNumber}</span>
                    </div>
                    <div className="flex border-b border-gray-200 pb-2 md:border-none md:pb-0">
                        <span className="font-bold text-gray-500 w-24 md:w-32 uppercase text-[10px] md:text-xs tracking-wider shrink-0">Programme</span>
                        <span className="font-medium text-gray-900">Bachelor of Technology</span>
                    </div>
                    <div className="flex">
                        <span className="font-bold text-gray-500 w-24 md:w-32 uppercase text-[10px] md:text-xs tracking-wider shrink-0">Branch</span>
                        <span className="font-medium text-gray-900">{student.department}</span>
                    </div>
                </div>
            </section>

            {/* Grades Table */}
            <div className="overflow-x-auto border border-gray-900 rounded-lg mb-8">
                <table className="w-full text-xs md:text-base min-w-[600px] font-serif">
                    <thead>
                        <tr className="bg-gray-100 text-gray-900 border-b border-gray-900">
                            <th rowSpan="2" className="px-2 md:px-4 py-2 text-left w-1/3 border-r border-gray-900 align-middle font-bold uppercase">Papers</th>
                            <th colSpan="2" className="px-2 md:px-4 py-2 text-center font-bold border-r border-gray-900 uppercase">Marks Obtained</th>
                            <th rowSpan="2" className="px-2 md:px-4 py-2 text-center w-24 font-bold align-middle uppercase">Total</th>
                        </tr>
                        <tr className="bg-gray-50 text-gray-900 border-b border-gray-900">
                             <th className="px-2 py-1 text-center border-r border-gray-900 w-24">
                                Theory
                                <div className="text-[10px] font-normal border-t border-gray-400 mt-1">Obt / Max</div>
                            </th>
                            <th className="px-2 py-1 text-center border-r border-gray-900 w-24">
                                Pract. / Viva
                                <div className="text-[10px] font-normal border-t border-gray-400 mt-1">Obt / Max</div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-900">
                        {result.subjects.map((sub, idx) => (
                            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-2 md:px-4 py-2 font-medium text-gray-900 border-r border-gray-900 uppercase">
                                    <span className="font-bold mr-2">{sub.courseCode}:</span> {sub.courseName}
                                </td>
                                <td className="px-2 md:px-4 py-2 text-center text-gray-900 border-r border-gray-900">
                                    {sub.marks.external} / {Math.round((sub.marks.maxMarks || 100) * 0.75)}
                                </td>
                                <td className="px-2 md:px-4 py-2 text-center text-gray-900 border-r border-gray-900">
                                    {sub.marks.internal} / {Math.round((sub.marks.maxMarks || 100) * 0.25)}
                                </td>
                                <td className="px-2 md:px-4 py-2 text-center font-bold text-gray-900">
                                    {sub.marks.total} / {sub.marks.maxMarks || 100}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-gray-100 font-bold border-t border-gray-900">
                        <tr>
                            <td className="px-4 py-3 text-right uppercase border-r border-gray-900">Grand Total</td>
                            <td colSpan="2" className="px-4 py-3 text-center border-r border-gray-900">
                                {result.subjects.reduce((sum, s) => sum + s.marks.total, 0)} / {result.subjects.reduce((sum, s) => sum + (s.marks.maxMarks || 100), 0)}
                            </td>
                            <td className="px-4 py-3 text-center">
                                {result.subjects.reduce((sum, s) => sum + s.marks.total, 0)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Footer Summary */}
            <footer className="flex flex-col md:flex-row justify-between items-stretch border-t-2 border-gray-900 pt-6">
                <div className="space-y-1 text-sm">
                    <p><span className="font-bold text-gray-600 w-32 inline-block">Total Marks:</span> {result.subjects.reduce((sum, sub) => sum + (sub.marks.total || 0), 0)}</p>
                    <p><span className="font-bold text-gray-600 w-32 inline-block">Issue Date:</span> {new Date(result.declaredDate).toLocaleDateString()}</p>
                </div>

                <div className="mt-6 md:mt-0 flex gap-4">
                    <div className="bg-gray-100 p-4 rounded-lg border border-gray-200 text-center min-w-[120px]">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Percentage</p>
                        <p className="text-3xl font-bold text-gray-900">{result.percentage}%</p>
                    </div>
                    <div className="bg-gray-900 p-4 rounded-lg text-white text-center min-w-[120px]">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Result</p>
                        <p className={`text-2xl font-bold uppercase ${result.result === 'Pass' ? 'text-green-400' : 'text-red-400'}`}>
                            {result.result}
                        </p>
                    </div>
                </div>
            </footer>
            
            <div className="mt-12 pt-4 border-t-2 border-gray-900 flex justify-between items-end">
                <div className="text-xs text-gray-500 max-w-md">
                    Note: This is a computer generated result. The institute is not responsible for any error. 
                    Original grade cards will be issued by the department.
                </div>
                <div className="text-center flex flex-col items-center">
                    {/* Handwritten Signature SVG */}
                    <svg width="120" height="50" viewBox="0 0 120 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-2">
                        <path d="M10 35 C15 20, 25 15, 30 25 C35 35, 40 10, 50 20 C55 25, 45 35, 55 30 C65 25, 60 15, 70 20 C75 23, 72 30, 80 25 C85 22, 82 18, 90 22 C95 24, 92 28, 100 25 C105 23, 108 20, 115 22" 
                            stroke="#1a237e" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                        <path d="M25 38 C30 36, 40 42, 50 38 C55 36, 60 40, 70 37" 
                            stroke="#1a237e" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                    </svg>
                    <p className="text-sm font-bold uppercase tracking-wider">
                        Controller of Examinations
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;
