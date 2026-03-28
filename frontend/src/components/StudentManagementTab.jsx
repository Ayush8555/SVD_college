import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { useToast } from '../context/ToastContext';
import BulkStudentUpload from './admin/BulkStudentUpload';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const StudentManagementTab = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [showBulkUpload, setShowBulkUpload] = useState(false);
    const { success, error } = useToast();

    const [formData, setFormData] = useState({
        rollNumber: '',
        email: '',
        dateOfBirth: '',
        firstName: '',
        lastName: '',
        fatherName: '',
        motherName: '',
        category: 'General',
        gender: 'Male',
        department: 'B.Ed',
        program: 'B.Ed',
        currentSemester: '1',
        phone: ''
    });

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${API_URL}/admin/students`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudents(data.data || []);
        } catch (err) {
            error(err.response?.data?.message || 'Error fetching students');
        } finally {
            setLoading(false);
        }
    };

    const [editId, setEditId] = useState(null);

    // ... (useEffect and fetchStudents remain same)

    const handleEdit = (student) => {
        setFormData({
            rollNumber: student.rollNumber,
            email: student.email || '',
            dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '', // Format YYYY-MM-DD
            firstName: student.firstName,
            lastName: student.lastName,
            fatherName: student.fatherName || '',
            motherName: student.motherName || '',
            category: student.category || 'General',
            gender: student.gender,
            department: student.department,
            program: student.program,
            currentSemester: student.currentSemester,
            phone: student.phone || ''
        });
        setEditId(student._id);
        setShowForm(true);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            if (editId) {
                // Update
                await axios.put(
                    `${API_URL}/admin/students/${editId}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                success('Student updated successfully');
            } else {
                // Create
                const payload = { ...formData };
                if (!payload.email || payload.email.trim() === '') payload.email = null;
                if (!payload.phone || payload.phone.trim() === '') payload.phone = null;
                
                const { data } = await axios.post(
                    `${API_URL}/admin/students/register`,
                    payload,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                success(`Student registered successfully! Password: ${data.data.generatedPassword}`);
            }

            setShowForm(false);
            setEditId(null);
            setFormData({
                rollNumber: '',
                email: '',
                dateOfBirth: '',
                firstName: '',
                lastName: '',
                fatherName: '',
                motherName: '',
                category: 'General',
                gender: 'Male',
                department: 'B.Ed',
                program: 'B.Ed',
                currentSemester: '1',
                phone: ''
            });
            fetchStudents();
        } catch (err) {
            error(err.response?.data?.message || 'Error saving student');
        } finally {
            setLoading(false);
        }
    };



    const [departmentFilter, setDepartmentFilter] = useState('All');
    const [semesterFilter, setSemesterFilter] = useState('All');
    const [batchFilter, setBatchFilter] = useState('All');
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [isDeleting, setIsDeleting] = useState(false);

    // Filter Logic
    const filteredStudents = students.filter(student => {
        const matchesSearch = 
            student.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesDepartment = departmentFilter === 'All' || student.department === departmentFilter;
        const matchesSemester = semesterFilter === 'All' || String(student.currentSemester) === semesterFilter;
        const matchesBatch = batchFilter === 'All' || student.batch === batchFilter;

        return matchesSearch && matchesDepartment && matchesSemester && matchesBatch;
    });

    // Selection Logic
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedStudents(filteredStudents.map(s => s._id));
        } else {
            setSelectedStudents([]);
        }
    };

    const handleSelectOne = (id) => {
        if (selectedStudents.includes(id)) {
            setSelectedStudents(selectedStudents.filter(sId => sId !== id));
        } else {
            setSelectedStudents([...selectedStudents, id]);
        }
    };

    // Bulk Delete
    const handleBulkDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete ${selectedStudents.length} students?`)) return;
        
        try {
            setIsDeleting(true);
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            
            // Execute deletions in parallel
            await Promise.all(selectedStudents.map(id => 
                axios.delete(`${API_URL}/admin/students/${id}`, { headers })
            ));

            success(`Successfully deleted ${selectedStudents.length} students`);
            setSelectedStudents([]);
            fetchStudents();
        } catch (err) {
            console.error(err);
            error('Failed to delete some students');
        } finally {
            setIsDeleting(false);
        }
    };
    
    // Single Delete Wrapper
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this student?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/admin/students/${id}`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            success('Student deleted successfully');
            fetchStudents();
        } catch (err) {
            error('Failed to delete student');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
                    <p className="text-sm text-gray-600 mt-1">Register and manage student accounts</p>
                </div>
                <div className="flex gap-3">
                    <Button 
                        variant="secondary"
                        onClick={() => setShowBulkUpload(true)}
                        className="px-4 py-2"
                    >
                        Bulk Import
                    </Button>
                    <Button 
                        onClick={() => setShowForm(!showForm)}
                        className="px-4 py-2"
                    >
                        {showForm ? 'Cancel' : '+ Add Student'}
                    </Button>
                </div>
            </div>

            {showBulkUpload && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <BulkStudentUpload 
                            onClose={() => setShowBulkUpload(false)} 
                            onSuccess={() => {
                                fetchStudents();
                                setShowBulkUpload(false);
                            }} 
                        />
                    </div>
                </div>
            )}

            {showForm && (
                <Card>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{editId ? 'Edit Student' : 'Student Registration'}</h3>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Roll Number *"
                                name="rollNumber"
                                placeholder="e.g. SVD24001"
                                value={formData.rollNumber}
                                onChange={handleInputChange}
                                required
                                className="uppercase"
                            />
                            <Input
                                label="Email"
                                name="email"
                                type="email"
                                placeholder="Optional"
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                            <Input
                                label="First Name *"
                                name="firstName"
                                placeholder="First Name"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                required
                            />
                            <Input
                                label="Last Name *"
                                name="lastName"
                                placeholder="Last Name"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                required
                            />
                            <Input
                                label="Date of Birth *"
                                name="dateOfBirth"
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={handleInputChange}
                                required
                            />
                            <Input
                                label="Phone"
                                name="phone"
                                placeholder="9876543210"
                                value={formData.phone}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Father's Name"
                                name="fatherName"
                                placeholder="Father Name"
                                value={formData.fatherName}
                                onChange={handleInputChange}
                            />
                            <Input
                                label="Mother's Name"
                                name="motherName"
                                placeholder="Mother Name"
                                value={formData.motherName}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-brand focus:border-brand sm:text-sm py-3 px-4"
                                >
                                    <option value="General">General</option>
                                    <option value="OBC">OBC</option>
                                    <option value="SC">SC</option>
                                    <option value="ST">ST</option>
                                    <option value="EWS">EWS</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-brand focus:border-brand sm:text-sm py-3 px-4"
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
                                <select
                                    name="department"
                                    value={formData.department}
                                    onChange={handleInputChange}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-brand focus:border-brand sm:text-sm py-3 px-4"
                                >
                                    <option value="B.Ed">B.Ed</option>
                                    <option value="B.A">B.A</option>
                                    <option value="B.T.C">B.T.C</option>
                                    <option value="LL.B">LL.B</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Program</label>
                                <select
                                    name="program"
                                    value={formData.program}
                                    onChange={handleInputChange}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-brand focus:border-brand sm:text-sm py-3 px-4"
                                >
                                    <option value="B.Ed">B.Ed</option>
                                    <option value="B.A">B.A</option>
                                    <option value="B.T.C">B.T.C</option>
                                    <option value="LL.B">LL.B</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Semester</label>
                                <select
                                    name="currentSemester"
                                    value={formData.currentSemester}
                                    onChange={handleInputChange}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-brand focus:border-brand sm:text-sm py-3 px-4"
                                >
                                    {[1, 2, 3, 4, 5, 6].map(sem => (
                                        <option key={sem} value={sem}>Semester {sem}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-900">
                                <strong>Note:</strong> Password will be auto-generated from Date of Birth (YYYYMMDD format).
                            </p>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="bg-gray-500 hover:bg-gray-600"
                            >
                                Cancel
                            </Button>
                            <Button type="submit" isLoading={loading}>
                                {loading ? 'Saving...' : (editId ? 'Update Student' : 'Register Student')}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            <Card>
                <div className="mb-6 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                    <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto flex-1">
                        <Input
                            placeholder="Search students..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-xs w-full"
                        />
                        <select
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                            className="rounded-lg border-gray-300 shadow-sm focus:ring-brand focus:border-brand text-sm py-2"
                        >
                            <option value="All">All Departments</option>
                            <option value="B.Ed">B.Ed</option>
                            <option value="B.A">B.A</option>
                            <option value="B.T.C">B.T.C</option>
                            <option value="LL.B">LL.B</option>
                        </select>
                        <select
                            value={semesterFilter}
                            onChange={(e) => setSemesterFilter(e.target.value)}
                            className="rounded-lg border-gray-300 shadow-sm focus:ring-brand focus:border-brand text-sm py-2"
                        >
                            <option value="All">All Semesters</option>
                            {[1, 2, 3, 4, 5, 6].map(sem => <option key={sem} value={String(sem)}>Sem {sem}</option>)}
                        </select>
                    </div>

                    {selectedStudents.length > 0 && (
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-700">{selectedStudents.length} selected</span>
                            <Button 
                                variant="danger" 
                                onClick={handleBulkDelete}
                                isLoading={isDeleting}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 text-sm"
                            >
                                Delete Selected
                            </Button>
                        </div>
                    )}
                </div>

                {/* Mobile View (Cards) */}
                <div className="md:hidden grid grid-cols-1 gap-4">
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Loading students...</div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No students found</div>
                    ) : (
                        filteredStudents.map(student => (
                            <div key={student._id} className={`bg-white p-4 rounded-lg border border-gray-200 shadow-sm ${selectedStudents.includes(student._id) ? 'ring-2 ring-brand bg-blue-50' : ''}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <input 
                                            type="checkbox" 
                                            className="rounded border-gray-300 text-brand focus:ring-brand h-5 w-5"
                                            checked={selectedStudents.includes(student._id)}
                                            onChange={() => handleSelectOne(student._id)}
                                        />
                                        <div>
                                            <h3 className="font-bold text-gray-900">{student.firstName} {student.lastName}</h3>
                                            <p className="text-xs text-gray-500 font-mono">{student.rollNumber}</p>
                                        </div>
                                    </div>
                                    <Badge variant="info">{student.department}</Badge>
                                </div>
                                
                                <div className="space-y-1 text-sm text-gray-600 mb-3 pl-8">
                                    <p><strong>Program:</strong> {student.program} (Sem {student.currentSemester})</p>
                                    <p><strong>Email:</strong> {student.email || '-'}</p>
                                    <p><strong>Phone:</strong> {student.phone || '-'}</p>
                                </div>

                                <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 pl-8">
                                    <button
                                        onClick={() => handleEdit(student)}
                                        className="text-blue-600 font-medium text-sm"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(student._id)}
                                        className="text-red-600 font-medium text-sm"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop View (Table) */}
                <div className="hidden md:block overflow-x-auto border rounded-lg border-gray-200 relative">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-4 py-3 w-10">
                                    <input 
                                        type="checkbox" 
                                        className="rounded border-gray-300 text-brand focus:ring-brand"
                                        checked={filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length}
                                        onChange={handleSelectAll}
                                        disabled={filteredStudents.length === 0}
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">Roll Number</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">Department</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">Program</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">Semester</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                                        Loading students...
                                    </td>
                                </tr>
                            ) : filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                                        No students found
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map(student => (
                                    <tr key={student._id} className={`hover:bg-gray-50 ${selectedStudents.includes(student._id) ? 'bg-blue-50' : ''}`}>
                                        <td className="px-4 py-4 w-10">
                                            <input 
                                                type="checkbox" 
                                                className="rounded border-gray-300 text-brand focus:ring-brand"
                                                checked={selectedStudents.includes(student._id)}
                                                onChange={() => handleSelectOne(student._id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-mono text-sm font-bold text-gray-900">{student.rollNumber}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{student.firstName} {student.lastName}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-600">{student.email || '-'}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant="info">{student.department}</Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {student.program}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            Sem {student.currentSemester}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => handleEdit(student)}
                                                className="text-blue-600 hover:text-blue-900 font-medium hover:underline mr-3"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(student._id)}
                                                className="text-red-600 hover:text-red-900 font-medium hover:underline"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 gap-2">
                    <div>
                        Showing <span className="font-semibold">{filteredStudents.length}</span> results 
                        (Total: <span className="font-semibold">{students.length}</span>)
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default StudentManagementTab;
