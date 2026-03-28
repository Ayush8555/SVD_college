export const getViewUrl = (url) => {
    if (!url) return '';
    let fullUrl = url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001'}${url}`;
    
    return fullUrl;
};

/**
 * Helper to get file type from URL
 * @param {string} url 
 * @returns {string} - 'pdf', 'image', or 'file'
 */
export const getFileType = (url) => {
    if (!url) return null;
    if (url.includes('/raw/upload/')) return 'pdf'; // Cloudinary raw PDF
    const ext = url.split('.').pop().toLowerCase().split('?')[0];
    if (['pdf'].includes(ext)) return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    return 'file';
};

/**
 * Helper to get readable file size
 * @param {number} size - Size in bytes
 * @returns {string} - Formatted size
 */
export const getFileSize = (size) => {
    if (!size) return 'PDF'; 
    return `${(size / 1024).toFixed(1)} KB`;
};
