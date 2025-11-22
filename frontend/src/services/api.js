import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
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

// Master Drafts
export const generateMasterDraft = async (briefId) => {
    const response = await api.post('/masters/generate', { briefId });
    return response.data;
};

export const getMasterDrafts = async (briefId) => {
    const response = await api.get(`/masters/brief/${briefId}`);
    return response.data;
};

export const getLatestMasterDraft = async (briefId) => {
    const response = await api.get(`/masters/brief/${briefId}/latest`);
    return response.data;
};

export const correctMasterDraft = async (masterId, correctionPrompt) => {
    const response = await api.post(`/masters/${masterId}/correct`, { correctionPrompt });
    return response.data;
};

export const approveMasterDraft = async (masterId) => {
    const response = await api.post(`/masters/${masterId}/approve`);
    return response.data;
};

export const generatePostsFromMaster = async (masterId) => {
    const response = await api.post(`/masters/${masterId}/generate-posts`);
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
