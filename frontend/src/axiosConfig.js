import axios from 'axios';

// Set the backend base URL (hardcoded for production)
axios.defaults.baseURL = '';

// Automatically attach the token if available
axios.interceptors.request.use(config => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Handle responses & auto-logout on error
axios.interceptors.response.use(
  response => response,
  error => {
    console.error('❌ Axios Error:', {
      message: error.message,
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });

    // If unauthorized or token invalid → logout user
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('user');
      window.location.href = '/'; // redirect to home or login page
    }

    return Promise.reject(error);
  }
);

export default axios;
