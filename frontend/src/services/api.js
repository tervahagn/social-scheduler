import axios from 'axios';

// Use absolute URL for Tauri production, relative for dev with Vite proxy
const API_BASE = import.meta.env.DEV ? '' : 'http://localhost:3001';

// Configure axios interceptor to handle /api URLs in production
axios.interceptors.request.use((config) => {
    if (!import.meta.env.DEV && config.url?.startsWith('/api')) {
        config.url = API_BASE + config.url;
    }
    return config;
});

const api = axios.create({
    baseURL: import.meta.env.DEV ? '/api' : 'http://localhost:3001/api',
    headers: {
        'Content-Type': 'application/json'
    }
});



// Briefs
export const createBrief = async (formData) => {
    const response = await api.post('/briefs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const getBriefs = async () => {
    const response = await api.get('/briefs');
    return response.data;
};

export const getBrief = async (id) => {
    const response = await api.get(`/briefs/${id}`);
    return response.data;
};

export const updateBrief = async (id, data) => {
    const response = await api.put(`/briefs/${id}`, data);
    return response.data;
};

export const deleteBrief = async (id) => {
    const response = await api.delete(`/briefs/${id}`);
    return response.data;
};

export const generatePosts = async (briefId) => {
    const response = await api.post(`/briefs/${briefId}/generate`);
    return response.data;
};

export const getBriefPosts = async (briefId) => {
    const response = await api.get(`/briefs/${briefId}/posts`);
    return response.data;
};

// Posts
export const updatePost = async (postId, data) => {
    const response = await api.put(`/posts/${postId}`, data);
    return response.data;
};

export const approvePost = async (postId) => {
    const response = await api.post(`/posts/${postId}/approve`);
    return response.data;
};

export const publishPost = async (postId) => {
    const response = await api.post(`/posts/${postId}/publish`);
    return response.data;
};

// Publish
export const publishAllPosts = async (briefId) => {
    const response = await api.post(`/publish/brief/${briefId}`);
    return response.data;
};

// Platforms
export const getPlatforms = async () => {
    const response = await api.get('/platforms');
    return response.data;
};

export const updatePlatform = async (platformId, data) => {
    const response = await api.put(`/platforms/${platformId}`, data);
    return response.data;
};

// Analytics
export const getAnalyticsDashboard = async () => {
    const response = await api.get('/analytics/dashboard');
    return response.data;
};

export default api;
