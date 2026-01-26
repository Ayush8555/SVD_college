import React, { useState, useEffect } from 'react';

const ResultFormModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    rollNumber: '',
    semester: '1',
    academicYear: '2024-25',
    examType: 'Regular',
    subjects: []
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        rollNumber: initialData.rollNumber,
        semester: initialData.semester,
        academicYear: initialData.academicYear,
        examType: initialData.examType,
        subjects: initialData.subjects.map(s => ({
            courseCode: s.courseCode,
            courseName: s.courseName,
            credits: s.credits,
            marks: {
                internal: s.marks.internal,
                external: s.marks.external
            }
        }))
      });
    } else {
        // Reset or set default state for new entry
        setFormData({
            rollNumber: '',
            semester: '1',
            academicYear: '2024-25',
            examType: 'Regular',
            subjects: [
                { courseCode: '', courseName: '', credits: 4, marks: { internal: 0, external: 0 } }
            ]
        });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubjectChange = (index, field, value) => {
    const newSubjects = [...formData.subjects];
    if (field.includes('.')) {
        const [parent, child] = field.split('.');
        newSubjects[index][parent][child] = value;
    } else {
        newSubjects[index][field] = value;
    }
    setFormData({ ...formData, subjects: newSubjects });
  };

  const addSubject = () => {
    setFormData({
      ...formData,
      subjects: [...formData.subjects, { courseCode: '', courseName: '', credits: 4, marks: { internal: 0, external: 0 } }]
    });
  };

  const removeSubject = (index) => {
    const newSubjects = formData.subjects.filter((_, i) => i !== index);
    setFormData({ ...formData, subjects: newSubjects });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            {initialData ? 'Edit Result' : 'Create New Result'}
          </h3> // Close button
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <span className="text-2xl">&times;</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Roll Number</label>
              <input
                type="text"
                name="rollNumber"
                value={formData.rollNumber}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                placeholder="e.g. GEC2023001"
                disabled={!!initialData} // Lock roll number on edit
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Semester</label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              >
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Academic Year</label>
              <input
                type="text"
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Exam Type</label>
              <select
                name="examType"
                value={formData.examType}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              >
                <option value="Regular">Regular</option>
                <option value="Backlog">Backlog</option>
                <option value="Reval">Revaluation</option>
              </select>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium text-gray-900">Subjects & Marks</h4>
              <button
                type="button"
                onClick={addSubject}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
              >
                + Add Subject
              </button>
            </div>

            <div className="space-y-4">
              {formData.subjects.map((subject, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col md:flex-row gap-4 items-start">
                   <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                       <input
                           placeholder="Course Code (e.g. CS101)"
                           value={subject.courseCode}
                           onChange={(e) => handleSubjectChange(index, 'courseCode', e.target.value)}
                           className="rounded border-gray-300 p-2 text-sm"
                           required
                       />
                       <input
                           placeholder="Course Name"
                           value={subject.courseName}
                           onChange={(e) => handleSubjectChange(index, 'courseName', e.target.value)}
                           className="rounded border-gray-300 p-2 text-sm md:col-span-1"
                           required
                       />
                        <div className="flex items-center gap-2">
                           <span className="text-xs text-gray-500">Int:</span>
                           <input
                               type="number"
                               placeholder="Internal"
                               value={subject.marks.internal}
                               onChange={(e) => handleSubjectChange(index, 'marks.internal', e.target.value)}
                               className="w-full rounded border-gray-300 p-2 text-sm"
                           />
                       </div>
                       <div className="flex items-center gap-2">
                           <span className="text-xs text-gray-500">Ext:</span>
                           <input
                               type="number"
                               placeholder="External"
                               value={subject.marks.external}
                               onChange={(e) => handleSubjectChange(index, 'marks.external', e.target.value)}
                               className="w-full rounded border-gray-300 p-2 text-sm"
                           />
                       </div>
                   </div>
                   <button
                     type="button"
                     onClick={() => removeSubject(index)}
                     className="text-red-600 hover:text-red-800 p-2"
                   >
                     ×
                   </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {initialData ? 'Update Result' : 'Save Result'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResultFormModal;
