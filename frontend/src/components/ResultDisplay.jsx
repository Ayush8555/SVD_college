import React, { useRef } from 'react';
import Button from './ui/Button';
import OfficialMarksheet from './OfficialMarksheet';

const ResultDisplay = ({ result, student }) => {
  const componentRef = useRef();

  const handlePrint = () => {
    window.print();
  };

  if (!result || !student) return null;

  const getGradeColor = (grade) => {
      if(grade === 'O' || grade === 'A+') return 'text-green-700';
      if(grade === 'F' || grade === 'AB') return 'text-red-600 font-bold';
      return 'text-gray-900';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end print:hidden">
        <Button onClick={handlePrint} variant="outline" className="gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            Print Official Marksheet
        </Button>
      </div>

      {/* Hidden Official Marksheet for Printing - Native Method */}
      {/* We use h-0 overflow-hidden so it exists in DOM (for print medai to see) but invisible on screen */}
      {/* OFF-SCREEN but Visible to Print Engine */}
      <div id="printable-area" className="hidden print:block">
        <OfficialMarksheet student={student} result={result} />
      </div>

      <div 
        ref={componentRef} 
        className="bg-white p-4 md:p-12 rounded-xl shadow-lg border border-gray-200 relative overflow-hidden font-serif print:shadow-none print:border-none print:p-0 print:m-0"
      >
        {/* Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none z-0 overflow-hidden">
             <div className="transform -rotate-45 text-4xl md:text-8xl font-bold text-gray-900 whitespace-nowrap border-4 border-gray-900 p-4 rounded-3xl">
                 SVD GURUKUL OFFICIAL
             </div>
        </div>

        <div className="relative z-10">
            {/* Header */}
            <header className="border-b-4 border-primary-900 pb-6 mb-8 text-center relative">
                <div className="flex justify-center items-center mb-4 gap-4">
                     {/* Logo */}
                     <div className="w-16 h-16 md:w-24 md:h-24 bg-primary-900 text-white rounded-full flex items-center justify-center font-bold text-xl md:text-3xl shadow-xl border-4 border-white ring-4 ring-primary-100">
                         SVD
                     </div>
                </div>
                <h1 className="text-2xl md:text-5xl font-bold text-primary-900 uppercase tracking-tight mb-2 font-heading break-words">
                    SVD Gurukul Mahavidyalaya
                </h1>
                <p className="text-xs md:text-lg text-primary-600 font-bold uppercase tracking-widest px-2">
                    Dumduma, Unchgaon, Jaunpur, Uttar Pradesh • Est. 2010
                </p>
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
            <div className="overflow-x-auto border border-gray-300 rounded-lg mb-8">
                <table className="w-full text-xs md:text-base min-w-[600px]">
                    <thead>
                        <tr className="bg-gray-100 text-gray-900 text-[10px] md:text-xs uppercase tracking-wider border-b border-gray-300">
                            <th className="px-2 md:px-4 py-2 md:py-3 text-left w-16 md:w-24 font-bold border-r border-gray-300">Code</th>
                            <th className="px-2 md:px-4 py-2 md:py-3 text-left font-bold border-r border-gray-300">Course Title</th>
                            <th className="px-2 md:px-4 py-2 md:py-3 text-center w-16 md:w-24 font-bold border-r border-gray-300">Int. Marks</th>
                            <th className="px-2 md:px-4 py-2 md:py-3 text-center w-16 md:w-24 font-bold border-r border-gray-300">Ext. Marks</th>
                            <th className="px-2 md:px-4 py-2 md:py-3 text-center w-16 md:w-24 font-bold">Total Marks</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {result.subjects.map((sub, idx) => (
                            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-2 md:px-4 py-2 md:py-3 font-mono text-gray-600 border-r border-gray-200">{sub.code || sub.courseCode || '-'}</td>
                                <td className="px-2 md:px-4 py-2 md:py-3 font-medium text-gray-900 border-r border-gray-200">{sub.name || sub.courseName}</td>
                                <td className="px-2 md:px-4 py-2 md:py-3 text-center text-gray-600 border-r border-gray-200">{sub.marks.internal}</td>
                                <td className="px-2 md:px-4 py-2 md:py-3 text-center text-gray-600 border-r border-gray-200">{sub.marks.external}</td>
                                <td className="px-2 md:px-4 py-2 md:py-3 text-center font-bold text-gray-900">{sub.marks.total}</td>
                            </tr>
                        ))}
                    </tbody>
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
            
            <div className="mt-12 pt-4 border-t border-gray-200 flex justify-between items-end">
                <div className="text-[10px] text-gray-400 max-w-md">
                    Note: This is a computer generated result. The institute is not responsible for any error. 
                    Original grade cards will be issued by the department.
                </div>
                <div className="text-center">
                    {/* Fake Signature */}
                    <div className="font-heading text-xl text-gray-800 italic mb-1 font-bold">Dr. Controller</div>
                    <div className="text-[10px] uppercase font-bold tracking-widest border-t border-gray-400 pt-1">
                        Controller of Examinations
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;
