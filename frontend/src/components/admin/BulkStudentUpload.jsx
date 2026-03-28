import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const BulkStudentUpload = ({ onClose, onSuccess }) => {
    const { success, error } = useToast();
    const [step, setStep] = useState(1); // 1: Upload, 2: Map/Preview, 3: Uploading
    const [file, setFile] = useState(null);
    const [parsedData, setParsedData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [uploadConfig, setUploadConfig] = useState({
        department: 'B.Ed',
        program: 'B.Ed',
        currentSemester: '1',
        admissionYear: new Date().getFullYear(),
        defaultPassword: 'DateOfBirth'
    });
    
    const [columnMapping, setColumnMapping] = useState({
        rollNumber: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        enrollmentNumber: '',
        dateOfBirth: '',
        gender: '',
        category: '',
        fatherName: '',
        motherName: ''
    });
    
    // State for result summary
    const [uploadResult, setUploadResult] = useState({ added: 0, failed: 0, errors: [] });

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            readExcel(selectedFile);
        }
    };

    const readExcel = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }); // Header: 1 gives array of arrays
            
            if (jsonData.length > 0) {
                 // Scan for header row (heuristic: look for 'roll', 'name', 'enroll')
                let headerRowIndex = 0;
                for (let i = 0; i < Math.min(jsonData.length, 10); i++) {
                    const row = jsonData[i].map(c => String(c || '').toLowerCase());
                    // If row has relevant keywords, it's likely the header
                    if (row.some(c => c.includes('roll') || c.includes('name') || c.includes('enroll') || c.includes('mobile'))) {
                        headerRowIndex = i;
                        break;
                    }
                }

                const fileHeaders = jsonData[headerRowIndex];
                setHeaders(fileHeaders);
                const rows = jsonData.slice(headerRowIndex + 1)
                    // Filter out empty rows — a row is empty if ALL its cells are empty/whitespace
                    .filter(row => row.some(cell => cell !== undefined && cell !== null && String(cell).trim() !== ''));
                setParsedData(rows);
                
                // Auto-map columns if names match loosely
                const newMapping = { ...columnMapping };
                let courseColIndex = null;
                let semColIndex = null;

                fileHeaders.forEach((header, index) => {
                    if (!header) return;
                    const h = String(header).toLowerCase();
                    if (h.includes('roll')) newMapping.rollNumber = index;
                    else if (h.includes('first') || h.includes('name') || h.includes('student')) newMapping.firstName = index; 
                    else if (h.includes('last') || h.includes('surname')) newMapping.lastName = index;
                    else if (h.includes('email')) newMapping.email = index;
                    else if (h.includes('phone') || h.includes('mobile')) newMapping.phone = index;
                    else if (h.includes('enroll')) newMapping.enrollmentNumber = index;
                    else if (h.includes('dob') || h.includes('birth')) newMapping.dateOfBirth = index;
                    else if (h.includes('gender')) newMapping.gender = index;
                    else if (h.includes('category')) newMapping.category = index;
                    else if (h.includes('father') || h.includes('dad')) newMapping.fatherName = index;
                    else if (h.includes('mother') || h.includes('mom')) newMapping.motherName = index;
                    
                    // Detect course/department column
                    if (h.includes('course') || h.includes('dept') || h.includes('program') || h.includes('branch')) {
                        courseColIndex = index;
                    }
                    // Detect semester column
                    if (h.includes('sem') || h.includes('year')) {
                        semColIndex = index;
                    }
                });
                setColumnMapping(newMapping);

                // Auto-detect department and semester from first data row
                if (rows.length > 0) {
                    const firstRow = rows[0];
                    const newConfig = { ...uploadConfig };
                    
                    if (courseColIndex !== null && firstRow[courseColIndex]) {
                        const courseVal = String(firstRow[courseColIndex]).trim();
                        // Map common course names to our department values
                        const courseMap = {
                            'llb': 'LL.B', 'll.b': 'LL.B', 'll.b.': 'LL.B', 'law': 'LL.B',
                            'b.ed': 'B.Ed', 'b.ed.': 'B.Ed', 'bed': 'B.Ed', 'education': 'B.Ed',
                            'btc': 'B.T.C', 'b.t.c': 'B.T.C', 'b.t.c.': 'B.T.C', 'd.el.ed': 'B.T.C',
                            'ba': 'B.A', 'b.a': 'B.A', 'b.a.': 'B.A', 'arts': 'B.A'
                        };
                        const mapped = courseMap[courseVal.toLowerCase()] || courseVal;
                        if (['B.Ed', 'B.T.C', 'B.A', 'LL.B'].includes(mapped)) {
                            newConfig.department = mapped;
                            newConfig.program = mapped; // Auto-set program too
                        }
                    }
                    
                    if (semColIndex !== null && firstRow[semColIndex]) {
                        const semVal = String(firstRow[semColIndex]).trim();
                        const semNum = semVal.replace(/[^0-9]/g, '');
                        if (semNum && parseInt(semNum) >= 1 && parseInt(semNum) <= 8) {
                            newConfig.currentSemester = semNum;
                        }
                    }
                    
                    setUploadConfig(newConfig);
                }

                setStep(2);
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleUpload = async () => {
        try {
            setStep(3);
            
            // Transform data based on mapping
            const studentsToUpload = parsedData.map(row => {
                const getVal = (idx) => {
                    if (idx === '' || row[idx] === undefined || row[idx] === null) return undefined;
                    const val = String(row[idx]).trim();
                    return val === '' ? undefined : val;
                };
                
                // Handle Name Splitting if only First Name mapped but looks like Full Name
                let fName = getVal(columnMapping.firstName);
                let lName = getVal(columnMapping.lastName);
                
                if (!lName && fName && fName.includes(' ')) {
                    const parts = fName.split(' ');
                    lName = parts.pop();
                    fName = parts.join(' ');
                }

                return {
                    rollNumber: getVal(columnMapping.rollNumber),
                    firstName: fName,
                    lastName: lName || '.', // Fallback if missing
                    email: getVal(columnMapping.email),
                    phone: getVal(columnMapping.phone),
                    enrollmentNumber: getVal(columnMapping.enrollmentNumber),
                    dateOfBirth: getVal(columnMapping.dateOfBirth),
                    gender: getVal(columnMapping.gender),
                    category: getVal(columnMapping.category),
                    fatherName: getVal(columnMapping.fatherName),
                    motherName: getVal(columnMapping.motherName),
                    
                    // Add configs
                    department: uploadConfig.department,
                    currentSemester: uploadConfig.currentSemester,
                    admissionYear: uploadConfig.admissionYear,
                };
            }).filter(s => s.rollNumber); // Filter empty rows

            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/students/bulk`, {
                students: studentsToUpload,
                defaultDepartment: uploadConfig.department,
                defaultProgram: uploadConfig.program,
                defaultSemester: uploadConfig.currentSemester,
                defaultAdmissionYear: uploadConfig.admissionYear
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                const { added, skipped = 0, failed, errors } = res.data.data;
                
                // If full success (no failures AND no skipped)
                if (failed === 0 && skipped === 0) {
                     success(`Upload Complete! Added: ${added}`);
                     if (onSuccess) onSuccess();
                     onClose();
                } else {
                    // Partial success, skipped, or failures
                    setStep(4);
                    setUploadResult({ added, skipped, failed, errors });
                    
                     if (added > 0 || skipped > 0) {
                         // Soft error/warning
                         success(`Processed batch. Added: ${added}, Skipped: ${skipped}, Failed: ${failed}`);
                         if (onSuccess) onSuccess();
                     } else {
                         error(`Upload Failed. ${failed} records failed.`);
                     }
                }
            } else {
                error(res.data.message);
                setStep(2);
            }
        } catch (err) {
            console.error(err);
            error(err.response?.data?.message || 'Upload failed');
            setStep(2);
        }
    };

    return (
        <Card className="animate-fade-in-up">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-xl font-bold text-gray-900">Bulk Student Upload</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            {/* Step 1 & 2 omitted for brevity, they are unchanged */}
            {step === 1 && (
                <div className="space-y-6">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:bg-gray-50 transition-colors">
                        <input
                            type="file"
                            accept=".xlsx, .xls, .csv"
                            onChange={handleFileChange}
                            className="hidden"
                            id="bulk-upload-input"
                        />
                        <label htmlFor="bulk-upload-input" className="cursor-pointer">
                            <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                            </div>
                            <p className="text-lg font-medium text-gray-900">Click to upload Excel/CSV</p>
                            <p className="text-sm text-gray-500 mt-1">Supports .xlsx, .xls, .csv</p>
                        </label>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                        <strong>Tip:</strong> Ensure your file has headers like "Roll No", "Student Name", "Mobile", etc.
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Default Configs */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900">Batch Settings</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                <select 
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-500 focus:ring-brand-500"
                                    value={uploadConfig.department}
                                    onChange={e => setUploadConfig({...uploadConfig, department: e.target.value})}
                                >
                                    {['B.Ed', 'B.T.C', 'B.A', 'LL.B'].map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                                <select 
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-500 focus:ring-brand-500"
                                    value={uploadConfig.program}
                                    onChange={e => setUploadConfig({...uploadConfig, program: e.target.value})}
                                >
                                    {['B.Ed', 'B.T.C', 'B.A', 'LL.B', 'B.Sc', 'B.Com', 'M.A', 'M.Sc'].map(p => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                                <select 
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-500 focus:ring-brand-500"
                                    value={uploadConfig.currentSemester}
                                    onChange={e => setUploadConfig({...uploadConfig, currentSemester: e.target.value})}
                                >
                                    {[1, 2, 3, 4, 5, 6].map(s => <option key={s} value={s}>Semester {s}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Column Mapping */}
                        <div className="md:col-span-2 space-y-4">
                            <h3 className="font-semibold text-gray-900">Map Columns</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Roll Number (Required)', key: 'rollNumber' },
                                    { label: 'First Name/Full Name', key: 'firstName' },
                                    { label: 'Last Name (Optional)', key: 'lastName' },
                                    { label: 'Enrollment No (Optional)', key: 'enrollmentNumber' },
                                    { label: 'Mobile (Optional)', key: 'phone' },
                                    { label: 'Email (Optional)', key: 'email' },
                                    { label: 'DOB (Optional)', key: 'dateOfBirth' },
                                    { label: 'Gender (Optional)', key: 'gender' },
                                    { label: "Father's Name", key: 'fatherName' },
                                    { label: "Mother's Name", key: 'motherName' }
                                ].map(field => (
                                    <div key={field.key}>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">{field.label}</label>
                                        <select 
                                            className="w-full border-gray-300 rounded-md shadow-sm text-sm py-1.5"
                                            value={columnMapping[field.key]}
                                            onChange={e => setColumnMapping({...columnMapping, [field.key]: e.target.value})}
                                        >
                                            <option value="">-- Select Column --</option>
                                            {headers.map((h, i) => (
                                                <option key={i} value={i}>{h}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
                        <Button onClick={handleUpload}>
                            Upload {parsedData.length} Students
                        </Button>
                    </div>
                </div>
            )}
            
            {step === 3 && (
                <div className="text-center py-12">
                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                     <p className="text-xl font-medium text-gray-900">Processing Upload...</p>
                     <p className="text-gray-500">Please wait while we verify and insert student records.</p>
                </div>
            )}
            {step === 4 && (
                <div className="space-y-6">
                    <div className={`p-4 rounded-lg text-center ${uploadResult.added > 0 ? 'bg-green-50 text-green-800' : (uploadResult.skipped > 0 ? 'bg-yellow-50 text-yellow-800' : 'bg-red-50 text-red-800')}`}>
                        <p className="text-lg font-bold">
                            {uploadResult.added > 0 ? 'Upload Success' : (uploadResult.skipped > 0 ? 'Previously Uploaded' : 'Upload Failed')}
                        </p>
                        <p className="text-sm mt-1">
                            <span className="font-semibold text-green-700">Added: {uploadResult.added}</span>
                            <span className="mx-2">|</span>
                            <span className="font-semibold text-yellow-700">Skipped: {uploadResult.skipped}</span>
                            <span className="mx-2">|</span>
                            <span className="font-semibold text-red-700">Failed: {uploadResult.failed}</span>
                        </p>
                    </div>

                    {uploadResult.errors.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Details:</h4>
                            <div className="max-h-60 overflow-y-auto bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm">
                                <ul className="space-y-2">
                                    {uploadResult.errors.map((err, idx) => (
                                        <li key={idx} className={`${err.isDuplicate ? 'text-yellow-700' : 'text-red-700'}`}>
                                            <span className="font-bold">{err.isDuplicate ? '[Duplicate]' : '[Error]'}</span> <span className="font-medium">{err.rollNumber || `Row ${err.index + 1}`}:</span> {err.message}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end pt-4 border-t">
                        <Button onClick={onClose}>Close</Button>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default BulkStudentUpload;
