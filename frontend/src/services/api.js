import axios from 'axios';

const API = axios.create({
    baseURL: 'http://127.0.0.1:5000/api'
});

// Automatically attach token to every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// AUTH
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);

// MENU
export const getCategories = () => API.get('/categories');
export const createCategory = (data) => API.post('/categories', data);
export const updateCategory = (id, data) => API.put(`/categories/${id}`, data);
export const deleteCategory = (id) => API.delete(`/categories/${id}`);

export const getMenuItems = (params) => API.get('/menu-items', { params });
export const createMenuItem = (data) => API.post('/menu-items', data);
export const updateMenuItem = (id, data) => API.put(`/menu-items/${id}`, data);
export const toggleMenuItem = (id) => API.patch(`/menu-items/${id}/toggle`);
export const deleteMenuItem = (id) => API.delete(`/menu-items/${id}`);

// TABLES
export const getTables = () => API.get('/tables');
export const createTable = (data) => API.post('/tables', data);
export const updateTable = (id, data) => API.put(`/tables/${id}`, data);
export const deleteTable = (id) => API.delete(`/tables/${id}`);

// ORDERS
export const placeOrder = (data) => API.post('/orders', data);
export const getMyOrders = () => API.get('/orders/my');
export const getAllOrders = () => API.get('/orders');
export const updateOrderStatus = (id, status) => API.patch(`/orders/${id}/status`, { status });

// BILLING
export const generateBill = (data) => API.post('/bills', data);
export const getBill = (orderId) => API.get(`/bills/order/${orderId}`);
export const getAllBills = () => API.get('/bills');

// ANALYTICS
export const getRevenue = () => API.get('/analytics/revenue');
export const getBestSellers = () => API.get('/analytics/best-sellers');
export const getOrderTypes = () => API.get('/analytics/order-types');
export const getRevenueTrend = () => API.get('/analytics/revenue-trend');

export default API;