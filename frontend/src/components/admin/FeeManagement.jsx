import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, DollarSign, Calendar, CheckCircle, AlertCircle, Search, Trash2, 
  Plus, Download, TrendingUp, CreditCard, FileText, RotateCcw, X,
  ChevronDown, Info
} from 'lucide-react';
import { feeAPI, studentAPI } from '../../utils/api';

// ──────────────── MAIN COMPONENT ────────────────
const FeeManagement = () => {
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' | 'records'

  // Dashboard Data
  const [stats, setStats] = useState(null);
  const [structures, setStructures] = useState([]);
  const [recentAssignments, setRecentAssignments] = useState([]);

  // Modals
  const [showCollectFeeModal, setShowCollectFeeModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, cascade: false });

  // Load all dashboard data
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [statsRes, structRes, assignRes] = await Promise.all([
        feeAPI.getFeeAnalysis(),
        feeAPI.getStructures(),
        feeAPI.getRecentAssignments({ limit: 10 })
      ]);
      setStats(statsRes.data.data);
      setStructures(structRes.data.data);
      setRecentAssignments(assignRes.data.data);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const confirmDelete = (id) => setDeleteModal({ show: true, id, cascade: false });

  const handleFinalDelete = async () => {
    try {
      setLoading(true);
      await feeAPI.deleteStructure(deleteModal.id, deleteModal.cascade);
      showNotification('success', 'Fee Structure deleted successfully');
      setDeleteModal({ show: false, id: null, cascade: false });
      fetchAllData();
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Deletion failed');
    } finally {
      setLoading(false);
    }
  };

  const overview = stats?.overview || {};
  const formatCurrency = (val) => {
    if (!val) return '₹0';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}k`;
    return `₹${val.toLocaleString()}`;
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* ── Notification ── */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl flex items-center gap-3 shadow-2xl animate-fade-in-up text-sm font-medium ${
          notification.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <p>{notification.message}</p>
          <button onClick={() => setNotification(null)} className="ml-2 text-current opacity-50 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Delete Fee Structure?</h3>
              <p className="text-gray-500 mt-2 text-sm">This action cannot be undone.</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  checked={deleteModal.cascade}
                  onChange={e => setDeleteModal({...deleteModal, cascade: e.target.checked})}
                />
                <div className="text-sm">
                  <span className="font-semibold text-gray-800">Also delete assigned student fees?</span>
                  <p className="text-gray-500 text-xs mt-0.5">Only unpaid fees will be removed. Paid fees are preserved.</p>
                </div>
              </label>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteModal({ show: false, id: null, cascade: false })}
                className="flex-1 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >Cancel</button>
              <button 
                onClick={handleFinalDelete}
                disabled={loading}
                className="flex-1 py-2.5 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium shadow-lg shadow-red-200 transition-colors disabled:opacity-50"
              >{loading ? 'Deleting...' : 'Confirm Delete'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Collect Fee Modal ── */}
      {showCollectFeeModal && (
        <CollectFeeModal 
          onClose={() => setShowCollectFeeModal(false)} 
          showNotification={showNotification}
          onSuccess={fetchAllData}
        />
      )}

      {/* ═══════════════ HEADER ═══════════════ */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fees Management</h1>
          <p className="text-gray-500 mt-1">Overview of financial status and fee operations.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveView(activeView === 'records' ? 'dashboard' : 'records')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium shadow-sm ${
              activeView === 'records'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Users size={16} /> Student Records
          </button>
          <button 
            onClick={() => exportReport(stats, recentAssignments)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm"
          >
            <Download size={16} /> Export Report
          </button>
          <button 
            onClick={() => setShowCollectFeeModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-lg shadow-blue-200"
          >
            <Plus size={16} /> Collect Fee
          </button>
        </div>
      </div>

      {activeView === 'records' ? (
        <StudentFeeRecords onBack={() => setActiveView('dashboard')} />
      ) : (
        <>
          {/* ═══════════════ STATS CARDS ═══════════════ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              label="Total Students" 
              value={overview.totalStudents || 0}
              icon={<Users size={20} />}
              color="blue"
              sub={`${overview.count || 0} fee records`}
            />
            <StatCard 
              label="Fees Assigned" 
              value={formatCurrency(overview.totalExpected)}
              icon={<FileText size={20} />}
              color="indigo"
              sub="Total potential revenue"
            />
            <StatCard 
              label="Fees Collected" 
              value={formatCurrency(overview.totalCollected)}
              icon={<CreditCard size={20} />}
              color="green"
              sub={overview.totalExpected > 0 ? `${Math.round((overview.totalCollected / overview.totalExpected) * 100)}% collection rate` : ''}
            />
            <StatCard 
              label="Pending Fees" 
              value={formatCurrency(overview.totalPending)}
              icon={<AlertCircle size={20} />}
              color="red"
              sub={overview.overdueStudents > 0 ? `${overview.overdueStudents} Students overdue` : 'No overdue fees'}
            />
          </div>

          {/* ═══════════════ MAIN CONTENT ═══════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
              <AssignFeePanel 
                structures={structures} 
                showNotification={showNotification} 
                onSuccess={fetchAllData} 
              />
            </div>
            <div className="lg:col-span-2">
              <NewFeeStructurePanel 
                showNotification={showNotification} 
                onSuccess={fetchAllData}
                structures={structures}
                confirmDelete={confirmDelete}
              />
            </div>
          </div>

          {/* ═══════════════ RECENT ASSIGNMENTS TABLE ═══════════════ */}
          <RecentAssignmentsTable 
            assignments={recentAssignments} 
            onViewAll={fetchAllData}
          />
        </>
      )}
    </div>
  );
};

// ──────────────── STAT CARD ────────────────
const StatCard = ({ label, value, icon, color, sub }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    red: 'bg-red-50 text-red-600 border-red-100',
  };
  const iconColors = {
    blue: 'bg-blue-100 text-blue-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div className={`bg-white rounded-xl p-5 border ${colors[color]} shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between mb-3">
        <p className={`text-sm font-medium ${color === 'blue' ? 'text-blue-600' : color === 'indigo' ? 'text-indigo-600' : color === 'green' ? 'text-green-600' : 'text-red-600'}`}>
          {label}
        </p>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconColors[color]}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className={`text-xs mt-1 ${color === 'red' && sub.includes('overdue') ? 'text-red-500 font-medium' : 'text-gray-400'}`}>{sub}</p>}
    </div>
  );
};

// ──────────────── ASSIGN FEE PANEL ────────────────
const AssignFeePanel = ({ structures, showNotification, onSuccess }) => {
  const [mode, setMode] = useState('bulk'); // 'individual' or 'bulk'
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState('');
  const [selectedStructure, setSelectedStructure] = useState('');
  const [feeType, setFeeType] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectAll, setSelectAll] = useState(true);
  const [excludedStudents, setExcludedStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch students when dept/sem change
  useEffect(() => {
    if (department && semester) {
      fetchStudents();
    } else {
      setStudents([]);
    }
  }, [department, semester]);

  const fetchStudents = async () => {
    try {
      const res = await feeAPI.searchStudents({ department, semester });
      setStudents(res.data.data);
      setSelectAll(true);
      setExcludedStudents([]);
    } catch (err) {
      console.error('Student search error:', err);
    }
  };

  const handleAssign = async () => {
    if (!selectedStructure) {
      return showNotification('error', 'Please select a fee structure to assign');
    }
    if (!window.confirm(`Assign this fee to ${selectAll ? students.length - excludedStudents.length : 0} students?`)) return;

    try {
      setLoading(true);
      const res = await feeAPI.assignFees({ feeStructureId: selectedStructure });
      showNotification('success', res.data.message);
      onSuccess();
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Assignment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setDepartment('');
    setSemester('');
    setSelectedStructure('');
    setFeeType('');
    setAmount('');
    setDueDate('');
    setStudents([]);
    setExcludedStudents([]);
    setSelectAll(true);
  };

  const targetCount = selectAll ? students.length - excludedStudents.length : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Assign Student Fees</h2>
            <p className="text-sm text-gray-500 mt-0.5">Assign fees individually or in bulk.</p>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setMode('individual')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                mode === 'individual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >Individual</button>
            <button
              onClick={() => setMode('bulk')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                mode === 'bulk' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >Bulk Assignment</button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Course & Semester Selectors */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Course</label>
            <select
              value={department}
              onChange={e => setDepartment(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white appearance-none"
            >
              <option value="">Select Course</option>
              {['B.Ed', 'B.T.C', 'B.A', 'LL.B'].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Semester</label>
            <select
              value={semester}
              onChange={e => setSemester(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white appearance-none"
            >
              <option value="">Select Semester</option>
              {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
            </select>
          </div>
        </div>

        {/* Target Students */}
        {students.length > 0 && (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-700">Target Students</h4>
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={selectAll} 
                  onChange={e => { setSelectAll(e.target.checked); setExcludedStudents([]); }}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300"
                />
                Select All in Batch
              </label>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                All Students ({targetCount})
                {excludedStudents.length > 0 && (
                  <button onClick={() => setExcludedStudents([])} className="ml-1 hover:text-blue-900">
                    <X size={12} />
                  </button>
                )}
              </span>
              <input
                type="text"
                placeholder="Type to exclude specific students..."
                className="flex-1 min-w-[200px] px-3 py-1 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
              <Info size={12} />
              <span>Assigning to {targetCount} students in {department} - Sem {semester}</span>
            </div>
          </div>
        )}

        {/* Fee Structure Selector */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Fee Structure</label>
          <select
            value={selectedStructure}
            onChange={e => {
              setSelectedStructure(e.target.value);
              const s = structures.find(st => st._id === e.target.value);
              if (s) {
                setFeeType(s.name);
                setAmount(s.amount);
                setDueDate(s.dueDate?.split('T')[0] || '');
              }
            }}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            <option value="">-- Select Fee Structure --</option>
            {structures.map(s => (
              <option key={s._id} value={s._id}>
                {s.name} — ₹{s.amount.toLocaleString()} ({s.department} Sem {s.semester})
              </option>
            ))}
          </select>
        </div>

        {/* Fee Type, Amount, Due Date */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Fee Type</label>
            <input
              type="text"
              value={feeType}
              readOnly
              placeholder="Auto-filled"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
              <input
                type="text"
                value={amount ? Number(amount).toLocaleString() : ''}
                readOnly
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-600"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Due Date</label>
            <input
              type="date"
              value={dueDate}
              readOnly
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-600"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleAssign}
            disabled={loading || !selectedStructure || students.length === 0}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Users size={18} />
            {loading ? 'Assigning...' : 'Bulk Assign Fee'}
          </button>
          <button
            onClick={handleReset}
            className="px-5 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

// ──────────────── NEW FEE STRUCTURE PANEL ────────────────
const NewFeeStructurePanel = ({ showNotification, onSuccess, structures, confirmDelete }) => {
  const [showForm, setShowForm] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    amount: '',
    academicYear: '2025-2026',
    department: '',
    semester: 1,
    dueDate: '',
    category: 'General',
    description: '',
    month: 'N/A',
    installment: 'one-time'
  });

  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await feeAPI.createStructure({
        ...form,
        amount: Number(form.amount),
        semester: Number(form.semester)
      });
      showNotification('success', 'Fee Structure Created Successfully');
      setForm({
        name: '', amount: '', academicYear: '2025-2026', department: '',
        semester: 1, dueDate: '', category: 'General', description: '', month: 'N/A', installment: 'one-time'
      });
      onSuccess();
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Creation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Fee Structures</h2>
          <p className="text-sm text-gray-500 mt-0.5">{showForm ? 'Create new fee template' : `${structures.length} structure${structures.length !== 1 ? 's' : ''} defined`}</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            showForm 
              ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
              : 'text-white bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {showForm ? `View All (${structures.length})` : '+ Create New'}
        </button>
      </div>

      {showForm ? (
        <form onSubmit={handleCreate} className="p-6 space-y-4">
          {/* Fee Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Fee Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              placeholder="e.g. B.Ed Sem 1 Tuition Fee"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Select Course */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Select Course</label>
            <select
              value={form.department}
              onChange={e => setForm({...form, department: e.target.value})}
              required
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              <option value="">Choose a course</option>
              {['B.Ed', 'B.T.C', 'B.A', 'LL.B'].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Applicable Semester */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Applicable Semester</label>
            <div className="flex flex-wrap gap-2">
              {semesters.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm({...form, semester: s})}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    form.semester === s 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  Sem {s}
                </button>
              ))}
            </div>
          </div>

          {/* Fee Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Fee Category</label>
            <select
              value={form.category}
              onChange={e => setForm({...form, category: e.target.value})}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              {['All', 'General', 'OBC', 'SC', 'ST', 'EWS'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Installment Options */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Installment Options</h4>
            <div className="flex gap-4">
              {[
                { value: 'one-time', label: 'One-time Payment' },
                { value: 'monthly', label: 'Monthly' },
                { value: 'quarterly', label: 'Quarterly' }
              ].map(opt => (
                <label key={opt.value} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="radio"
                    name="installment"
                    value={opt.value}
                    checked={form.installment === opt.value}
                    onChange={e => setForm({...form, installment: e.target.value})}
                    className="w-4 h-4 text-blue-600 border-gray-300"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            {form.installment === 'one-time' && (
              <div className="flex items-center gap-1 mt-2 text-xs text-blue-600">
                <Info size={12} />
                <span>One-time payments apply a 5% early bird discount for General category students.</span>
              </div>
            )}
          </div>

          {/* Academic Year & Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Academic Year</label>
              <select
                value={form.academicYear}
                onChange={e => setForm({...form, academicYear: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                {['2024-2025', '2025-2026', '2026-2027'].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Due Date</label>
              <input
                type="date"
                required
                value={form.dueDate}
                onChange={e => setForm({...form, dueDate: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Total Base Amount */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Total Base Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₹</span>
              <input
                type="number"
                required
                min="1"
                value={form.amount}
                onChange={e => setForm({...form, amount: e.target.value})}
                placeholder="25000"
                className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Month (optional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Month (Optional)</label>
            <select
              value={form.month}
              onChange={e => setForm({...form, month: e.target.value})}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              {['N/A', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description (Optional)</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              placeholder="Brief description of this fee..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Fee Structure'}
          </button>
        </form>
      ) : (
        /* Structures List with Delete */
        <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
          {structures.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">No fee structures yet.</p>
          ) : structures.map(s => (
            <div key={s._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-red-200 transition-colors group">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm truncate">{s.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {s.department} • Sem {s.semester} • ₹{s.amount.toLocaleString()}
                  {s.academicYear ? ` • ${s.academicYear}` : ''}
                </p>
              </div>
              <button
                onClick={() => confirmDelete(s._id)}
                className="ml-3 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all flex items-center gap-1.5 text-xs font-medium"
                title="Delete this fee structure"
              >
                <Trash2 size={14} />
                <span className="hidden group-hover:inline text-red-600">Delete</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ──────────────── RECENT ASSIGNMENTS TABLE ────────────────
const RecentAssignmentsTable = ({ assignments, onViewAll }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-5 flex items-center justify-between border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900">Recent Assignments</h2>
        <button 
          onClick={onViewAll}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View All
        </button>
      </div>

      {assignments.length === 0 ? (
        <div className="p-8 text-center text-gray-400 text-sm">No fee assignments yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-bold text-blue-600 uppercase tracking-wider">Student</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-blue-600 uppercase tracking-wider">Type</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-blue-600 uppercase tracking-wider">Amount</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-blue-600 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {assignments.map(a => (
                <tr key={a._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-800">
                      {a.student ? `${a.student.firstName} ${a.student.lastName}` : 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-400">{a.student?.rollNumber || ''}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-blue-600 font-medium">
                      {a.feeStructure?.name || 'Fee'}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-semibold text-gray-800">
                    ₹{a.totalAmount?.toLocaleString()}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                      a.status === 'Paid' ? 'bg-green-100 text-green-700' :
                      a.status === 'Partial' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ──────────────── COLLECT FEE MODAL ────────────────
const CollectFeeModal = ({ onClose, showNotification, onSuccess }) => {
  const [step, setStep] = useState('search'); // search | select | pay
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [studentFees, setStudentFees] = useState(null);
  const [selectedFee, setSelectedFee] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMode: 'Cash',
    referenceId: '',
    remarks: ''
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    try {
      setLoading(true);
      // Try searching by student ID
      const res = await feeAPI.getStudentDuesAdmin(searchId.trim());
      setStudentFees(res.data.data);
      setStep('select');
    } catch (err) {
      // Try roll number search
      try {
        const studentRes = await studentAPI.getByRollNumber(searchId.trim());
        if (studentRes.data.data) {
          const feeRes = await feeAPI.getStudentDuesAdmin(studentRes.data.data._id);
          setStudentFees(feeRes.data.data);
          setStep('select');
        }
      } catch {
        showNotification('error', 'Student not found or no fees assigned');
        setStudentFees(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!selectedFee) return;
    try {
      setLoading(true);
      await feeAPI.recordPayment({
        studentFeeId: selectedFee._id,
        ...paymentData
      });
      showNotification('success', 'Payment Recorded Successfully');
      onSuccess();
      onClose();
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-4 flex justify-between items-center">
          <h3 className="font-bold text-lg">
            {step === 'search' ? 'Find Student' : step === 'select' ? 'Select Fee' : 'Record Payment'}
          </h3>
          <button onClick={onClose} className="text-white/80 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-6">
          {/* Step 1: Search */}
          {step === 'search' && (
            <form onSubmit={handleSearch} className="space-y-4">
              <p className="text-sm text-gray-500">Enter the student's Roll Number or ID to find their fees.</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchId}
                  onChange={e => setSearchId(e.target.value)}
                  placeholder="Roll Number or Student ID..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search Fees'}
              </button>
            </form>
          )}

          {/* Step 2: Select Fee */}
          {step === 'select' && studentFees && (
            <div className="space-y-3">
              <button onClick={() => setStep('search')} className="text-xs text-blue-600 hover:underline">← Back to search</button>
              <p className="text-sm text-gray-600 font-medium">Select a fee to record payment:</p>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {studentFees.filter(f => f.status !== 'Paid').map(fee => (
                  <button
                    key={fee._id}
                    onClick={() => {
                      setSelectedFee(fee);
                      setPaymentData({...paymentData, amount: fee.dueAmount});
                      setStep('pay');
                    }}
                    className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800">{fee.feeStructure?.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Due: ₹{fee.dueAmount?.toLocaleString()}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        fee.status === 'Partial' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {fee.status}
                      </span>
                    </div>
                  </button>
                ))}
                {studentFees.filter(f => f.status !== 'Paid').length === 0 && (
                  <p className="text-center text-gray-400 py-6 text-sm">All fees are fully paid!</p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Payment Form */}
          {step === 'pay' && selectedFee && (
            <form onSubmit={handlePayment} className="space-y-4">
              <button type="button" onClick={() => setStep('select')} className="text-xs text-blue-600 hover:underline">← Back</button>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="font-semibold text-blue-800 text-sm">{selectedFee.feeStructure?.name}</p>
                <p className="text-xs text-blue-600">Due: ₹{selectedFee.dueAmount?.toLocaleString()}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedFee.dueAmount}
                  value={paymentData.amount}
                  onChange={e => setPaymentData({...paymentData, amount: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
                  <select
                    value={paymentData.paymentMode}
                    onChange={e => setPaymentData({...paymentData, paymentMode: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option>Cash</option>
                    <option>Online</option>
                    <option>Cheque</option>
                    <option>DD</option>
                    <option>Scholarship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ref / Cheque No</label>
                  <input
                    type="text"
                    value={paymentData.referenceId}
                    onChange={e => setPaymentData({...paymentData, referenceId: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea
                  rows={2}
                  value={paymentData.remarks}
                  onChange={e => setPaymentData({...paymentData, remarks: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 shadow-lg shadow-green-100 transition-colors"
              >
                {loading ? 'Processing...' : 'Confirm Payment'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// ──────────────── EXPORT REPORT HELPER ────────────────
const exportReport = (stats, assignments) => {
  const overview = stats?.overview || {};
  const lines = [
    'SVD GURUKUL - FEE REPORT',
    '=' .repeat(40),
    `Generated: ${new Date().toLocaleString()}`,
    '',
    'OVERVIEW',
    '-'.repeat(20),
    `Total Students: ${overview.totalStudents || 0}`,
    `Total Fees Assigned: ₹${(overview.totalExpected || 0).toLocaleString()}`,
    `Total Collected: ₹${(overview.totalCollected || 0).toLocaleString()}`,
    `Total Pending: ₹${(overview.totalPending || 0).toLocaleString()}`,
    `Overdue Students: ${overview.overdueStudents || 0}`,
    '',
    'RECENT ASSIGNMENTS',
    '-'.repeat(20),
  ];

  assignments.forEach(a => {
    const name = a.student ? `${a.student.firstName} ${a.student.lastName}` : 'Unknown';
    lines.push(`${name} | ${a.feeStructure?.name || 'Fee'} | ₹${a.totalAmount?.toLocaleString()} | ${a.status}`);
  });

  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Fee_Report_${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ──────────────── STUDENT FEE RECORDS ────────────────
const StudentFeeRecords = ({ onBack }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const LIMIT = 10;

  const [filters, setFilters] = useState({
    search: '',
    academicYear: '',
    department: '',
    semester: '',
    status: ''
  });

  // Payment modal state
  const [payModal, setPayModal] = useState({ show: false, record: null });
  const [payForm, setPayForm] = useState({ amount: '', paymentMode: 'UPI', remarks: '' });
  const [payLoading, setPayLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNote = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Add Record modal state
  const [addModal, setAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ studentSearch: '', selectedStudent: null, feeStructureId: '', customAmount: '' });
  const [addLoading, setAddLoading] = useState(false);
  const [studentResults, setStudentResults] = useState([]);
  const [searchingStudents, setSearchingStudents] = useState(false);
  const [allStructures, setAllStructures] = useState([]);

  // Fetch structures for dropdown
  useEffect(() => {
    if (addModal) {
      feeAPI.getStructures().then(res => setAllStructures(res.data.data)).catch(() => {});
    }
  }, [addModal]);

  // Student search with debounce
  useEffect(() => {
    if (!addForm.studentSearch || addForm.studentSearch.length < 2) { setStudentResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        setSearchingStudents(true);
        const res = await feeAPI.searchStudents({ search: addForm.studentSearch });
        setStudentResults(res.data.data || []);
      } catch { setStudentResults([]); }
      finally { setSearchingStudents(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [addForm.studentSearch]);

  const handleAddRecord = async () => {
    if (!addForm.selectedStudent || !addForm.feeStructureId) return;
    try {
      setAddLoading(true);
      await feeAPI.assignFeeSingle({
        studentId: addForm.selectedStudent._id,
        feeStructureId: addForm.feeStructureId
      });
      showNote('success', `Fee record added for ${addForm.selectedStudent.firstName} ${addForm.selectedStudent.lastName}`);
      setAddModal(false);
      setAddForm({ studentSearch: '', selectedStudent: null, feeStructureId: '', customAmount: '' });
      setStudentResults([]);
      fetchRecords(page);
    } catch (err) {
      showNote('error', err.response?.data?.message || 'Failed to add fee record');
    } finally {
      setAddLoading(false);
    }
  };

  const openPayModal = (record) => {
    setPayModal({ show: true, record });
    setPayForm({ amount: record.dueAmount || '', paymentMode: 'UPI', remarks: '' });
  };

  const handleRecordPayment = async () => {
    if (!payForm.amount || Number(payForm.amount) <= 0) return;
    try {
      setPayLoading(true);
      await feeAPI.recordPayment({
        studentFeeId: payModal.record._id,
        amount: Number(payForm.amount),
        paymentMode: payForm.paymentMode,
        remarks: payForm.remarks
      });
      showNote('success', 'Fee status updated successfully.');
      setPayModal({ show: false, record: null });
      fetchRecords(page);
    } catch (err) {
      showNote('error', err.response?.data?.message || 'Payment failed');
    } finally {
      setPayLoading(false);
    }
  };

  const fetchRecords = useCallback(async (pg = 1) => {
    try {
      setLoading(true);
      const params = { page: pg, limit: LIMIT };
      if (filters.search) params.search = filters.search;
      if (filters.academicYear) params.academicYear = filters.academicYear;
      if (filters.department) params.department = filters.department;
      if (filters.semester) params.semester = filters.semester;
      if (filters.status) params.status = filters.status;

      const res = await feeAPI.getStudentRecords(params);
      const data = res.data.data;
      setRecords(data.records);
      setTotal(data.total);
      setPage(data.page);
      setPages(data.pages);
    } catch (err) {
      console.error('Error fetching student records:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchRecords(1); }, [filters.academicYear, filters.department, filters.semester, filters.status]);

  const handleSearchSubmit = (e) => { e.preventDefault(); fetchRecords(1); };

  const resetFilters = () => {
    setFilters({ search: '', academicYear: '', department: '', semester: '', status: '' });
  };

  const getStatusBadge = (status) => {
    const map = {
      Paid: 'bg-green-50 text-green-700 border-green-200',
      Partial: 'bg-amber-50 text-amber-700 border-amber-200',
      Pending: 'bg-red-50 text-red-700 border-red-200'
    };
    return map[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getInitials = (firstName, lastName) => {
    return `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase();
  };

  const avatarColors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500',
    'bg-amber-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500'
  ];

  const getAvatarColor = (name) => {
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return avatarColors[Math.abs(hash) % avatarColors.length];
  };

  const startIdx = (page - 1) * LIMIT + 1;
  const endIdx = Math.min(page * LIMIT, total);

  return (
    <div className="space-y-5">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl flex items-center gap-3 shadow-2xl animate-fade-in-up text-sm font-medium ${
          notification.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <p>{notification.message}</p>
          <button onClick={() => setNotification(null)} className="ml-2 text-current opacity-50 hover:opacity-100"><X size={14} /></button>
        </div>
      )}

      {/* Breadcrumb & Title */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <button onClick={onBack} className="hover:text-blue-600 transition-colors">Fees Management</button>
            <span>›</span>
            <span className="text-blue-600 font-medium">Fee Records</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Student Fees Records</h2>
          <p className="text-gray-500 text-sm mt-1">Manage and track student fee payments, outstanding balances, and payment history across all academic courses.</p>
        </div>
        <button
          onClick={() => setAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-lg shadow-blue-200"
        >
          <Plus size={16} /> Add Fee Record
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Student Name or Roll Number..."
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </form>

          {/* Academic Year */}
          <select
            value={filters.academicYear}
            onChange={e => setFilters({ ...filters, academicYear: e.target.value })}
            className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none min-w-[160px]"
          >
            <option value="">All Academic Years</option>
            {['2024-2025', '2025-2026', '2026-2027'].map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          {/* Course */}
          <select
            value={filters.department}
            onChange={e => setFilters({ ...filters, department: e.target.value })}
            className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none min-w-[140px]"
          >
            <option value="">All Courses</option>
            {['B.Ed', 'B.T.C', 'B.A', 'LL.B'].map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          {/* Semester */}
          <select
            value={filters.semester}
            onChange={e => setFilters({ ...filters, semester: e.target.value })}
            className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none min-w-[120px]"
          >
            <option value="">All Semesters</option>
            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
          </select>

          {/* Status */}
          <select
            value={filters.status}
            onChange={e => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none min-w-[120px]"
          >
            <option value="">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
            <option value="Pending">Pending</option>
          </select>

          {/* Reset */}
          <button
            onClick={resetFilters}
            className="p-2.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
            title="Reset filters"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3.5 text-xs font-bold text-blue-600 uppercase tracking-wider">Student Name</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-blue-600 uppercase tracking-wider">Roll No</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-blue-600 uppercase tracking-wider">Course</th>
                <th className="text-center px-4 py-3.5 text-xs font-bold text-blue-600 uppercase tracking-wider">Sem</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-blue-600 uppercase tracking-wider">Fee Type</th>
                <th className="text-right px-4 py-3.5 text-xs font-bold text-blue-600 uppercase tracking-wider">Total</th>
                <th className="text-right px-4 py-3.5 text-xs font-bold text-blue-600 uppercase tracking-wider">Paid</th>
                <th className="text-right px-4 py-3.5 text-xs font-bold text-blue-600 uppercase tracking-wider">Pending</th>
                <th className="text-center px-4 py-3.5 text-xs font-bold text-blue-600 uppercase tracking-wider">Status</th>
                <th className="text-center px-4 py-3.5 text-xs font-bold text-blue-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="10" className="text-center py-16 text-gray-400">Loading records...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan="10" className="text-center py-16 text-gray-400">No fee records found matching your filters.</td></tr>
              ) : records.map(r => {
                const student = r.student || {};
                const fee = r.feeStructure || {};
                const fullName = `${student.firstName || ''} ${student.lastName || ''}`;
                return (
                  <tr key={r._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full ${getAvatarColor(fullName)} text-white flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                          {getInitials(student.firstName, student.lastName)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{fullName}</p>
                          <p className="text-xs text-gray-400">{student.email || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 font-mono">{student.rollNumber || '-'}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{student.department || '-'}</td>
                    <td className="px-4 py-4 text-sm text-gray-600 text-center">{fee.semester || student.currentSemester || '-'}</td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-blue-600 font-medium">{fee.name || '-'}</span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 font-semibold text-right">₹{r.totalAmount?.toLocaleString()}</td>
                    <td className="px-4 py-4 text-sm text-green-600 font-semibold text-right">₹{r.paidAmount?.toLocaleString()}</td>
                    <td className="px-4 py-4 text-sm text-red-600 font-semibold text-right">₹{r.dueAmount?.toLocaleString()}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {r.status === 'Paid' ? (
                        <span className="text-green-500 text-xs font-medium flex items-center justify-center gap-1"><CheckCircle size={14} /> Received</span>
                      ) : (
                        <button
                          onClick={() => openPayModal(r)}
                          className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                        >Pay Now</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-900">{startIdx}</span> to <span className="font-semibold text-gray-900">{endIdx}</span> of <span className="font-semibold text-gray-900">{total}</span> results
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => fetchRecords(page - 1)}
                disabled={page <= 1}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >‹</button>
              {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
                let pageNum;
                if (pages <= 5) pageNum = i + 1;
                else if (page <= 3) pageNum = i + 1;
                else if (page >= pages - 2) pageNum = pages - 4 + i;
                else pageNum = page - 2 + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => fetchRecords(pageNum)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      page === pageNum
                        ? 'bg-blue-600 text-white font-semibold shadow-sm'
                        : 'border border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >{pageNum}</button>
                );
              })}
              {pages > 5 && page < pages - 2 && (
                <>
                  <span className="px-1 text-gray-400">…</span>
                  <button
                    onClick={() => fetchRecords(pages)}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700"
                  >{pages}</button>
                </>
              )}
              <button
                onClick={() => fetchRecords(page + 1)}
                disabled={page >= pages}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >›</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Add Fee Record Modal ── */}
      {addModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Add Fee Record</h3>
                <p className="text-sm text-gray-500 mt-0.5">Assign a fee structure to a student.</p>
              </div>
              <button onClick={() => { setAddModal(false); setAddForm({ studentSearch: '', selectedStudent: null, feeStructureId: '', customAmount: '' }); setStudentResults([]); }} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Student Search */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Search Student</label>
                {addForm.selectedStudent ? (
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{addForm.selectedStudent.firstName} {addForm.selectedStudent.lastName}</p>
                      <p className="text-xs text-gray-500">{addForm.selectedStudent.rollNumber} • {addForm.selectedStudent.department} • Sem {addForm.selectedStudent.currentSemester}</p>
                    </div>
                    <button onClick={() => setAddForm({ ...addForm, selectedStudent: null, studentSearch: '' })} className="text-gray-400 hover:text-red-500 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Type student name or roll number..."
                      value={addForm.studentSearch}
                      onChange={e => setAddForm({ ...addForm, studentSearch: e.target.value })}
                      className="w-full pl-9 pr-3 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    {/* Dropdown results */}
                    {(studentResults.length > 0 || searchingStudents) && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-10 max-h-48 overflow-y-auto">
                        {searchingStudents ? (
                          <p className="p-3 text-sm text-gray-400 text-center">Searching...</p>
                        ) : studentResults.map(s => (
                          <button
                            key={s._id}
                            onClick={() => { setAddForm({ ...addForm, selectedStudent: s, studentSearch: '' }); setStudentResults([]); }}
                            className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0"
                          >
                            <p className="text-sm font-medium text-gray-900">{s.firstName} {s.lastName}</p>
                            <p className="text-xs text-gray-500">{s.rollNumber} • {s.department} • Sem {s.currentSemester}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Fee Structure */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Fee Structure</label>
                <select
                  value={addForm.feeStructureId}
                  onChange={e => setAddForm({ ...addForm, feeStructureId: e.target.value })}
                  className="w-full px-3 py-3 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select a fee structure</option>
                  {allStructures.map(s => (
                    <option key={s._id} value={s._id}>{s.name} — ₹{s.amount?.toLocaleString()} ({s.department}, Sem {s.semester})</option>
                  ))}
                </select>
              </div>

              {/* Selected structure info */}
              {addForm.feeStructureId && (() => {
                const sel = allStructures.find(s => s._id === addForm.feeStructureId);
                if (!sel) return null;
                return (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Fee Amount</span>
                      <span className="font-semibold text-gray-900">₹{sel.amount?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-gray-500">Academic Year</span>
                      <span className="text-gray-700">{sel.academicYear}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-gray-500">Due Date</span>
                      <span className="text-gray-700">{sel.dueDate ? new Date(sel.dueDate).toLocaleDateString() : '-'}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                onClick={() => { setAddModal(false); setAddForm({ studentSearch: '', selectedStudent: null, feeStructureId: '', customAmount: '' }); setStudentResults([]); }}
                className="px-5 py-2.5 text-gray-700 bg-white border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
              >Cancel</button>
              <button
                onClick={handleAddRecord}
                disabled={addLoading || !addForm.selectedStudent || !addForm.feeStructureId}
                className="px-5 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold shadow-lg shadow-blue-200 transition-all disabled:opacity-50 text-sm flex items-center gap-2"
              >
                {addLoading ? 'Assigning...' : <><Plus size={16} /> Assign Fee</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mark as Paid Modal ── */}
      {payModal.show && payModal.record && (() => {
        const r = payModal.record;
        const student = r.student || {};
        const fullName = `${student.firstName || ''} ${student.lastName || ''}`;
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl">
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Mark as Paid</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Record payment for <span className="font-semibold text-gray-700">{fullName} ({student.rollNumber})</span></p>
                </div>
                <button onClick={() => setPayModal({ show: false, record: null })} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {/* Payment Amount */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Payment Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₹</span>
                    <input
                      type="number"
                      required
                      min="1"
                      max={r.dueAmount}
                      value={payForm.amount}
                      onChange={e => setPayForm({ ...payForm, amount: e.target.value })}
                      className="w-full pl-7 pr-14 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">INR</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">Pending Balance: <span className="font-semibold text-gray-700">₹{r.dueAmount?.toLocaleString()}</span></p>
                </div>

                {/* Payment Mode */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Payment Mode</label>
                  <select
                    value={payForm.paymentMode}
                    onChange={e => setPayForm({ ...payForm, paymentMode: e.target.value })}
                    className="w-full px-3 py-3 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {['Cash', 'Online', 'Cheque', 'DD', 'Scholarship'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Remarks */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Remarks <span className="text-gray-400 font-normal">(Optional)</span></label>
                  <textarea
                    rows={3}
                    value={payForm.remarks}
                    onChange={e => setPayForm({ ...payForm, remarks: e.target.value })}
                    placeholder="Enter transaction ID or notes..."
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => setPayModal({ show: false, record: null })}
                  className="px-5 py-2.5 text-gray-700 bg-white border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
                >Cancel</button>
                <button
                  onClick={handleRecordPayment}
                  disabled={payLoading || !payForm.amount || Number(payForm.amount) <= 0}
                  className="px-5 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold shadow-lg shadow-blue-200 transition-all disabled:opacity-50 text-sm flex items-center gap-2"
                >
                  {payLoading ? 'Processing...' : <><CheckCircle size={16} /> Confirm Payment</>}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default FeeManagement;
