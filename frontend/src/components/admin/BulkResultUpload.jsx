import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import Button from '../ui/Button';
import Card from '../ui/Card';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const BulkResultUpload = ({ onClose, onSuccess }) => {
    const { success, error } = useToast();
    const [step, setStep] = useState(1); // 1: Upload, 2: Map/Preview, 3: Uploading, 4: Result
    const [file, setFile] = useState(null);
    const [rawSheetData, setRawSheetData] = useState([]); // Store full data for re-parsing
    const [headerRowIndex, setHeaderRowIndex] = useState(0);
    const [parsedData, setParsedData] = useState([]);
    const [headers, setHeaders] = useState([]);
    
    // Configs
    const [uploadConfig, setUploadConfig] = useState({
        department: 'B.Ed',
        defaultSemester: '1',
        defaultExamType: 'Regular',
        defaultAcademicYear: '2024-2025'
    });
    
    // Column Mapping
    const [columnMapping, setColumnMapping] = useState({
        rollNumber: '',
        semester: '',
        examType: '',
        academicYear: ''
    });
    
    // Stats
    const [uploadResult, setUploadResult] = useState({ added: 0, failed: 0, errors: [] });
    // Detected Subjects for Preview
    const [detectedSubjects, setDetectedSubjects] = useState([]);

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
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Array of Arrays
            
            if (jsonData.length > 0) {
                setRawSheetData(jsonData);

                 // Scan for header row logic (Improved)
                let detectedIndex = 0;
                const keywords = ['roll', 'marks', 'sem', 'code', 'subject', 'id', 'reg', 'no', 'name', 'theory', 'practical', 'total'];
                
                for (let i = 0; i < Math.min(jsonData.length, 10); i++) {
                    const row = jsonData[i].map(c => String(c || '').toLowerCase());
                    if (row.some(c => keywords.some(k => c.includes(k)))) {
                        detectedIndex = i;
                        break;
                    }
                }
                
                processDataWithHeader(jsonData, detectedIndex);
            }
        };
        reader.readAsBinaryString(file);
    };

    const processDataWithHeader = (data, index) => {
        setHeaderRowIndex(index);
        const fileHeaders = data[index].map(h => String(h || '').trim()); // Ensure strings
        setHeaders(fileHeaders);
        
        // Convert rows to Objects using these headers manually to ensure correct mapping
        // XLSX utils sheet_to_json with range option is good, but we have array of arrays `data`
        
        const rows = data.slice(index + 1).map(row => {
            const obj = {};
            fileHeaders.forEach((h, i) => {
                if(h) obj[h] = row[i];
            });
            return obj;
        });

        setParsedData(rows);
        
        // Auto-map based on new headers
        const newMapping = { 
            rollNumber: '',
            semester: '',
            examType: '',
            academicYear: ''
        };
        
        fileHeaders.forEach((header) => {
            if (!header) return;
            const h = String(header).toLowerCase();
            if (h.includes('roll') || (h.includes('id') && !h.includes('exam'))) newMapping.rollNumber = header;
            else if (h.includes('sem') || h.includes('term')) newMapping.semester = header;
            else if (h.includes('type') || h.includes('exam')) newMapping.examType = header;
            else if (h.includes('year') || h.includes('session')) newMapping.academicYear = header;
        });
        setColumnMapping(newMapping);
        setStep(2);
        
        // Initial Subject Detection Preview
        detectSubjects(rows, newMapping, fileHeaders);
    };

    const handleHeaderIndexChange = (e) => {
        const index = parseInt(e.target.value);
        if (!isNaN(index) && index >= 0 && index < rawSheetData.length) {
            processDataWithHeader(rawSheetData, index);
        }
    };

    const detectSubjects = (data, mapping, allHeaders) => {
        if (!data || data.length === 0) return;
        
        // Exclude mapped columns
        const mappedValues = Object.values(mapping).filter(Boolean);
        const metadataKeys = [
             'fullname', 'name', 'student name', 'total', 'sgpa', 'cgpa', 'result', 'status', 'grade', 'percentage', 's.no', 'sr.no'
        ]; // Frontend blacklist

        const subjects = allHeaders.filter(h => {
             if (mappedValues.includes(h)) return false; // Is a mapped column
             const hLower = String(h).toLowerCase();
             // Check blacklist
             if (metadataKeys.some(m => hLower.includes(m))) return false;
             return true;
        });
        setDetectedSubjects(subjects);
    };

    // Update subjects when mapping changes
    const handleMappingChange = (field, value) => {
        const newMapping = { ...columnMapping, [field]: value };
        setColumnMapping(newMapping);
        if (headers.length > 0) {
             detectSubjects(parsedData, newMapping, headers);
        }
    };

    const handleUpload = async () => {
        try {
            setStep(3);
            
            // Transform Data
            const resultsToUpload = parsedData.map(row => {
                 const newRow = {};
                 
                 // Map configured fields
                 if (columnMapping.rollNumber) newRow.rollNumber = row[columnMapping.rollNumber];
                 if (columnMapping.semester) newRow.semester = row[columnMapping.semester];
                 if (columnMapping.examType) newRow.examType = row[columnMapping.examType];
                 if (columnMapping.academicYear) newRow.academicYear = row[columnMapping.academicYear];
                 
                 // Copy other fields (Potential Subjects)
                 Object.keys(row).forEach(key => {
                     // If key is NOT in mapping, copy it as is
                     if (!Object.values(columnMapping).includes(key)) {
                         newRow[key] = row[key];
                     }
                 });
                 
                 return newRow;
            }).filter(r => r.rollNumber); // Skip empty roll numbers

            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/admin/results/upload/json`, {
                results: resultsToUpload,
                defaultDepartment: uploadConfig.department,
                defaultSemester: uploadConfig.defaultSemester,
                defaultExamType: uploadConfig.defaultExamType,
                defaultAcademicYear: uploadConfig.defaultAcademicYear
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                const { added, failed, errors } = res.data.data;
                setUploadResult({ added, failed, errors });
                setStep(4);
                
                if (failed === 0) {
                     success(`Upload Complete! Added/Updated: ${added}`);
                     if (onSuccess) onSuccess();
                } else {
                     success(`Processed batch. Added: ${added}, Failed: ${failed}`);
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
        <Card className="animate-fade-in-up max-w-4xl mx-auto">
             <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-xl font-bold text-gray-900">Bulk Result Upload</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            {step === 1 && (
                <div className="space-y-6">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:bg-gray-50 transition-colors">
                        <input
                            type="file"
                            accept=".xlsx, .xls, .csv"
                            onChange={handleFileChange}
                            className="hidden"
                            id="bulk-result-input"
                        />
                        <label htmlFor="bulk-result-input" className="cursor-pointer">
                            <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            </div>
                            <p className="text-lg font-medium text-gray-900">Click to upload Results (Excel/CSV)</p>
                            <p className="text-sm text-gray-500 mt-1">Format: Roll No, Subject Columns (Maths, Science...)</p>
                        </label>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-6">
                    {/* Header Row Selector */}
                    <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-blue-900 mb-1">
                                Select Header Row
                            </label>
                            <select 
                                className="w-full border-blue-200 rounded-md text-sm bg-white"
                                value={headerRowIndex}
                                onChange={handleHeaderIndexChange}
                            >
                                {rawSheetData.slice(0, 10).map((row, i) => (
                                    <option key={i} value={i}>
                                        Row {i + 1}: {row.slice(0, 4).join(', ')}...
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="text-xs text-blue-700 max-w-xs">
                            Select the row that contains column names (Roll No, Subject Names, etc.).
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Configs */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900">Defaults (If missing in file)</h3>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                <select 
                                    className="w-full border-gray-300 rounded-lg shadow-sm"
                                    value={uploadConfig.department}
                                    onChange={e => setUploadConfig({...uploadConfig, department: e.target.value})}
                                >
                                    {['B.Ed', 'B.T.C', 'B.A', 'LL.B'].map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                                <select 
                                    className="w-full border-gray-300 rounded-lg shadow-sm"
                                    value={uploadConfig.defaultSemester}
                                    onChange={e => setUploadConfig({...uploadConfig, defaultSemester: e.target.value})}
                                >
                                    {[1, 2, 3, 4, 5, 6].map(s => <option key={s} value={s}>Semester {s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
                                <select 
                                    className="w-full border-gray-300 rounded-lg shadow-sm"
                                    value={uploadConfig.defaultExamType}
                                    onChange={e => setUploadConfig({...uploadConfig, defaultExamType: e.target.value})}
                                >
                                    <option value="Regular">Regular</option>
                                    <option value="Backlog">Backlog</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                                <input
                                    type="text"
                                    className="w-full border-gray-300 rounded-lg shadow-sm"
                                    value={uploadConfig.defaultAcademicYear}
                                    onChange={e => setUploadConfig({...uploadConfig, defaultAcademicYear: e.target.value})}
                                />
                            </div>
                        </div>

                        {/* Mapping */}
                        <div className="md:col-span-2 space-y-4">
                            <h3 className="font-semibold text-gray-900">Map Columns</h3>
                            <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800 mb-3">
                                <strong>Note:</strong> Map the metadata columns below. Any <strong>Unmapped Columns</strong> will be treated as <strong>Subjects</strong> (Marks).
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Roll Number (Required)', key: 'rollNumber' },
                                    { label: 'Semester (Optional)', key: 'semester' },
                                    { label: 'Exam Type (Optional)', key: 'examType' },
                                    { label: 'Academic Year (Optional)', key: 'academicYear' }
                                ].map(field => (
                                    <div key={field.key}>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">{field.label}</label>
                                        <select 
                                            className="w-full border-gray-300 rounded-md shadow-sm text-sm py-1.5"
                                            value={columnMapping[field.key]}
                                            onChange={e => handleMappingChange(field.key, e.target.value)}
                                        >
                                            <option value="">-- Use Default/None --</option>
                                            {headers.map((h, i) => (
                                                <option key={i} value={h}>{h}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>

                            {/* Detected Subjects Preview */}
                            <div className="mt-4">
                                <h4 className="font-semibold text-gray-900 text-sm mb-2">Detected Subjects ({detectedSubjects.length}):</h4>
                                <div className="flex flex-wrap gap-2">
                                    {detectedSubjects.length > 0 ? detectedSubjects.map((sub, i) => (
                                        <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs border border-blue-200">
                                            {sub}
                                        </span>
                                    )) : <span className="text-gray-500 text-sm italic">No subjects detected (all columns mapped or blacklisted)</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
                        <Button onClick={handleUpload}>
                            Upload {parsedData.length} Results
                        </Button>
                    </div>
                </div>
            )}

            {step === 3 && (
                 <div className="text-center py-12">
                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                     <p className="text-xl font-medium text-gray-900">Processing Results...</p>
                </div>
            )}

            {step === 4 && (
                <div className="space-y-6"> 
                    <div className={`p-4 rounded-lg text-center ${uploadResult.added > 0 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                         <p className="text-lg font-bold">Upload Complete</p>
                         <p className="text-sm mt-1">
                             <span className="font-semibold text-green-700">Added/Updated: {uploadResult.added}</span>
                             <span className="mx-2">|</span>
                             <span className="font-semibold text-red-700">Failed: {uploadResult.failed}</span>
                         </p>
                    </div>

                    {uploadResult.errors.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Error Details:</h4>
                             <div className="max-h-60 overflow-y-auto bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm">
                                <ul className="space-y-2">
                                    {uploadResult.errors.map((err, idx) => (
                                        <li key={idx} className="text-red-700">
                                            <span className="font-bold">[Row {err.row}]</span> <span className="font-medium">{err.rollNumber}:</span> {err.message}
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

export default BulkResultUpload;
