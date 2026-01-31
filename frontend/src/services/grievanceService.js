import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const API_URL = `${BASE_URL}/grievances`;

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
};

const getAdminAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
};

// Student Services
export const createGrievance = async (grievanceData) => {
    const response = await axios.post(API_URL, grievanceData, getAuthHeader());
    return response.data;
};

export const getMyGrievances = async () => {
    const response = await axios.get(`${API_URL}/my`, getAuthHeader());
    return response.data;
};

// Admin Services
export const getAllGrievances = async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await axios.get(`${API_URL}?${params}`, getAdminAuthHeader());
    return response.data;
};

export const resolveGrievance = async (id, data) => {
    const response = await axios.put(`${API_URL}/${id}/resolve`, data, getAdminAuthHeader());
    return response.data;
};

// Shared
export const getGrievanceById = async (id, isAdmin = false) => {
    const header = isAdmin ? getAdminAuthHeader() : getAuthHeader();
    const response = await axios.get(`${API_URL}/${id}`, header);
    return response.data;
};
