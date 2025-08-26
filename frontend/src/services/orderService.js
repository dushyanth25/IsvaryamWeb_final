import axios from 'axios';

export const createOrder = async order => {
  try {
    const { data } = await axios.post('/api/orders/create', order);
    return data;
  } catch (error) {
    // Optionally handle error
    throw error;
  }
};

export const getNewOrderForCurrentUser = async () => {
  const { data } = await axios.get('/api/orders/newOrderForCurrentUser');
  return data;
};

export const pay = async paymentId => {
  try {
    const { data } = await axios.put('/api/orders/pay', { paymentId });
    return data;
  } catch (error) {
    throw error;
  }
};

export const trackOrderById = async orderId => {
  const { data } = await axios.get('/api/orders/track/' + orderId);
  return data;
};

export const getAll = async state => {
  const { data } = await axios.get(`/api/orders/${state ?? ''}`);
  return data;
};

export const getAllStatus = async () => {
  const { data } = await axios.get(`/api/orders/allstatus`);
  return data;
};

export const getUserPurchaseCount = async () => {
  // Adjust endpoint as per your backend (e.g., /api/orders/user-purchase-count)
  const { data } = await axios.get('/api/orders/user-purchase-count');
  return data.count;
};

export const deleteOrder = async (orderId) => {
  return axios.delete(`api/orders/${orderId}`);
};


export const getOrderById = async (id) => {
  const { data } = await axios.get(`/api/orders/order/${id}`);
  return data;
};

