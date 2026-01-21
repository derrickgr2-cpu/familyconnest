import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authApi = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    // User photo album
    getPhotos: () => api.get('/auth/photos'),
    addPhoto: (data) => api.post('/auth/photos', data),
    deletePhoto: (photoId) => api.delete(`/auth/photos/${photoId}`),
};

// Public user endpoint
export const usersApi = {
    getPublic: (userId) => api.get(`/users/${userId}/public`),
};

// Members API
export const membersApi = {
    getAll: () => api.get('/members'),
    getAllPublic: () => api.get('/members/public'),
    getOnePublic: (id) => api.get(`/members/public/${id}`),
    getOne: (id) => api.get(`/members/${id}`),
    create: (data) => api.post('/members', data),
    update: (id, data) => api.put(`/members/${id}`, data),
    delete: (id) => api.delete(`/members/${id}`),
};

// Photos API
export const photosApi = {
    getAll: (memberId) => api.get(`/members/${memberId}/photos`),
    add: (memberId, data) => api.post(`/members/${memberId}/photos`, data),
    delete: (memberId, photoId) => api.delete(`/members/${memberId}/photos/${photoId}`),
};

// Upload API
export const uploadApi = {
    upload: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    // Public upload for registration (no auth required)
    uploadPublic: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/upload/public', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
};

// Events API
export const eventsApi = {
    getAll: () => api.get('/events'),
    getOne: (id) => api.get(`/events/${id}`),
    create: (data) => api.post('/events', data),
    update: (id, data) => api.put(`/events/${id}`, data),
    delete: (id) => api.delete(`/events/${id}`),
};

// Forum API
export const forumApi = {
    getPosts: () => api.get('/forum/posts'),
    getPost: (id) => api.get(`/forum/posts/${id}`),
    createPost: (data) => api.post('/forum/posts', data),
    updatePost: (id, data) => api.put(`/forum/posts/${id}`, data),
    deletePost: (id) => api.delete(`/forum/posts/${id}`),
    addReply: (postId, data) => api.post(`/forum/posts/${postId}/replies`, data),
    deleteReply: (postId, replyId) => api.delete(`/forum/posts/${postId}/replies/${replyId}`),
};

export default api;
