import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { encryptDocument, validateFile, isCryptoAvailable } from '../../utils/cryptoUtils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const DOCUMENT_TYPES = [
  { value: 'aadhaar', label: 'Aadhaar Card', required: true },
  { value: 'pan_card', label: 'PAN Card', required: false },
  { value: 'marksheet_10th', label: '10th Marksheet', required: true },
  { value: 'marksheet_12th', label: '12th Marksheet', required: true },
  { value: 'graduation_marksheet', label: 'Graduation Marksheet', required: false },
  { value: 'transfer_certificate', label: 'Transfer Certificate (TC)', required: true },
  { value: 'migration_certificate', label: 'Migration Certificate', required: false },
  { value: 'character_certificate', label: 'Character Certificate', required: true },
  { value: 'caste_certificate', label: 'Caste Certificate', required: false },
  { value: 'income_certificate', label: 'Income Certificate', required: false },
  { value: 'domicile_certificate', label: 'Domicile Certificate', required: false },
  { value: 'passport_photo', label: 'Passport Size Photo', required: true },
  { value: 'signature', label: 'Signature', required: true },
  { value: 'other', label: 'Other Document', required: false },
];

const DocumentUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('');
  const [consent, setConsent] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [publicKey, setPublicKey] = useState(null);
  const [cryptoAvailable, setCryptoAvailable] = useState(true);
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  // Check crypto availability
  useEffect(() => {
    if (!isCryptoAvailable()) {
      setCryptoAvailable(false);
      setError('Your browser does not support secure encryption. Please use a modern browser.');
    }
  }, []);

  // Fetch public key on mount
  useEffect(() => {
    const fetchPublicKey = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/documents/public-key`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPublicKey(response.data.data.publicKey);
      } catch (err) {
        console.error('Failed to fetch public key:', err);
        setError('Failed to initialize encryption. Please refresh and try again.');
      }
    };

    if (cryptoAvailable) {
      fetchPublicKey();
    }
  }, [cryptoAvailable]);

  // Fetch uploaded documents
  const fetchUploadedDocs = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/documents/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUploadedDocs(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setLoadingDocs(false);
    }
  }, []);

  useEffect(() => {
    fetchUploadedDocs();
  }, [fetchUploadedDocs]);

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    setSuccess('');

    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.errors.join(' '));
      setSelectedFile(null);
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
  };

  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (!file) return;

    setError('');
    setSuccess('');

    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.errors.join(' '));
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile || !documentType || !consent || !publicKey) {
      setError('Please complete all fields and provide consent.');
      return;
    }

    // Check if this document type is already uploaded
    const existingDoc = uploadedDocs.find(d => d.documentType === documentType);
    if (existingDoc && existingDoc.status !== 'rejected') {
      setError(`You have already uploaded a ${DOCUMENT_TYPES.find(t => t.value === documentType)?.label}. Please wait for verification.`);
      return;
    }

    setUploading(true);
    setProgress(10);
    setError('');

    try {
      // Step 1: Encrypt document client-side
      setProgress(20);
      const encryptedPayload = await encryptDocument(selectedFile, publicKey);
      setProgress(50);

      // Step 2: Create FormData with encrypted file
      const formData = new FormData();
      formData.append('document', encryptedPayload.encryptedFile);
      formData.append('documentType', documentType);
      formData.append('consent', 'true');
      formData.append('wrappedKey', encryptedPayload.wrappedKey);
      formData.append('iv', encryptedPayload.iv);
      formData.append('checksum', encryptedPayload.checksum);
      formData.append('originalMimeType', encryptedPayload.originalMimeType);
      formData.append('originalSize', encryptedPayload.originalSize);
      formData.append('originalName', encryptedPayload.originalName);

      // Step 3: Upload encrypted document
      const token = localStorage.getItem('token');
      setProgress(70);

      const response = await axios.post(`${API_URL}/documents/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = 70 + Math.round((progressEvent.loaded * 25) / progressEvent.total);
          setProgress(percentCompleted);
        }
      });

      setProgress(100);
      setSuccess(`${DOCUMENT_TYPES.find(t => t.value === documentType)?.label} uploaded successfully!`);
      
      // Reset form
      setSelectedFile(null);
      setDocumentType('');
      setConsent(false);
      
      // Refresh documents list
      fetchUploadedDocs();

    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending Review' },
      under_review: { color: 'bg-blue-100 text-blue-800', label: 'Under Review' },
      verified: { color: 'bg-green-100 text-green-800', label: 'Verified' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  // Handle document deletion
  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/documents/${docId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUploadedDocs(uploadedDocs.filter(d => d.id !== docId));
      setSuccess('Document deleted successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete document');
    }
  };

  if (!cryptoAvailable) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <h3 className="font-semibold">Encryption Not Supported</h3>
          <p className="mt-2">Your browser does not support secure document encryption. Please use a modern browser like Chrome, Firefox, Safari, or Edge.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload Documents</h2>
        <p className="text-gray-600 mb-6">
          Your documents are encrypted in your browser before upload. No one, including our server, can read your documents without authorization.
        </p>

        {/* Security Badge */}
        <div className="flex items-center gap-2 mb-6 p-3 bg-green-50 rounded-lg border border-green-100">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="text-sm text-green-700 font-medium">End-to-End Encrypted • AES-256</span>
        </div>

        {/* Error/Success Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700"
            >
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Document Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Type <span className="text-red-500">*</span>
          </label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            disabled={uploading}
          >
            <option value="">Select document type...</option>
            {DOCUMENT_TYPES.map((type) => {
              const uploaded = uploadedDocs.find(d => d.documentType === type.value);
              const isDisabled = uploaded && uploaded.status !== 'rejected';
              return (
                <option key={type.value} value={type.value} disabled={isDisabled}>
                  {type.label} {type.required && '(Required)'} 
                  {uploaded && ` - ${uploaded.status === 'verified' ? '✓ Verified' : uploaded.status}`}
                </option>
              );
            })}
          </select>
        </div>

        {/* File Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={`mb-6 border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
            ${selectedFile ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}
          onClick={() => document.getElementById('fileInput').click()}
        >
          <input
            id="fileInput"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          
          {selectedFile ? (
            <div className="space-y-2">
              <svg className="w-12 h-12 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-medium text-gray-800">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div className="space-y-2">
              <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="font-medium text-gray-700">Drop your file here or click to browse</p>
              <p className="text-sm text-gray-500">PDF, JPEG, or PNG • Max 5MB</p>
            </div>
          )}
        </div>

        {/* Consent Checkbox */}
        <div className="mb-6">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={uploading}
            />
            <span className="text-sm text-gray-700 group-hover:text-gray-900">
              I consent to upload this document for verification purposes. I understand that this document will be 
              encrypted and stored securely, and will only be accessed by authorized administrators for verification.
              <span className="text-red-500"> *</span>
            </span>
          </label>
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>
                {progress < 50 ? 'Encrypting document...' : 
                 progress < 70 ? 'Preparing upload...' : 
                 progress < 100 ? 'Uploading...' : 'Complete!'}
              </span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-blue-600 rounded-full"
              />
            </div>
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!selectedFile || !documentType || !consent || uploading || !publicKey}
          className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all
            ${(!selectedFile || !documentType || !consent || uploading || !publicKey)
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.99]'}`}
        >
          {uploading ? 'Uploading Securely...' : 'Upload Document Securely'}
        </button>
      </motion.div>

      {/* Uploaded Documents List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-4">Your Documents</h3>
        
        {loadingDocs ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : uploadedDocs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No documents uploaded yet.</p>
        ) : (
          <div className="space-y-3">
            {uploadedDocs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">
                    {DOCUMENT_TYPES.find(t => t.value === doc.documentType)?.label || doc.documentType}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>
                  {doc.status === 'rejected' && doc.verificationNote && (
                    <p className="text-sm text-red-600 mt-1">
                      Reason: {doc.verificationNote}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(doc.status)}
                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete document"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DocumentUpload;
