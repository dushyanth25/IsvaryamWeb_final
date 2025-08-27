// services/orderService.js
import axios from 'axios';

// Configure axios to include the token in all requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const createOrder = async order => {
  try {
    console.log('Creating order with data:', order);
    const { data } = await axios.post('/api/orders/create', order);
    console.log('Order created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating order:', error.response?.data || error.message);
    throw error;
  }
};

export const getNewOrderForCurrentUser = async () => {
  try {
    const { data } = await axios.get('/api/orders/newOrderForCurrentUser');
    return data;
  } catch (error) {
    console.error('Error getting new order:', error.response?.data || error.message);
    throw error;
  }
};

export const pay = async paymentId => {
  try {
    const { data } = await axios.put('/api/orders/pay', { paymentId });
    return data;
  } catch (error) {
    console.error('Error processing payment:', error.response?.data || error.message);
    throw error;
  }
};

export const trackOrderById = async orderId => {
  try {
    const { data } = await axios.get('/api/orders/track/' + orderId);
    return data;
  } catch (error) {
    console.error('Error tracking order:', error.response?.data || error.message);
    throw error;
  }
};

export const getAll = async state => {
  try {
    const { data } = await axios.get(`/api/orders/${state ?? ''}`);
    return data;
  } catch (error) {
    console.error('Error getting orders:', error.response?.data || error.message);
    throw error;
  }
};

export const getAllStatus = async () => {
  try {
    const { data } = await axios.get(`/api/orders/allstatus`);
    return data;
  } catch (error) {
    console.error('Error getting order statuses:', error.response?.data || error.message);
    throw error;
  }
};

export const getUserPurchaseCount = async () => {
  try {
    const { data } = await axios.get('/api/orders/user-purchase-count');
    return data.count;
  } catch (error) {
    console.error('Error getting user purchase count:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteOrder = async (orderId) => {
  try {
    const { data } = await axios.delete(`/api/orders/${orderId}`);
    return data;
  } catch (error) {
    console.error('Error deleting order:', error.response?.data || error.message);
    throw error;
  }
};

export const getOrderById = async (id) => {
  try {
    const { data } = await axios.get(`/api/orders/order/${id}`);
    return data;
  } catch (error) {
    console.error('Error getting order by ID:', error.response?.data || error.message);
    throw error;
  }
};

// Optional: Add a function to check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Optional: Add a function to get the token (for debugging)
export const getAuthToken = () => {
  return localStorage.getItem('token');
};