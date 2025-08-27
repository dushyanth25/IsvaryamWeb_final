
import axios from 'axios';
// Get current user's cart
export const getCart = async () => {
  const { data } = await axios.get('/api/cart');
  return data;
};

// Add or update an item in the cart
export const addToCart = async (productId, size, price, quantity = 1) => {
  const { data } = await axios.post('/api/cart', { productId, size, price, quantity });
  return data;
};

// Change quantity of an item (just call addToCart with new quantity)
export const updateCartItem = async (productId, size, price, quantity) => {
  const { data } = await axios.post('/api/cart', { productId, size, price, quantity });
  return data;
};

// Remove an item from the cart
export const removeFromCart = async (productId, size) => {
  const { data } = await axios.delete(`/api/cart/${productId}/${size}`);
  return data;
};

// Clear the cart
export const clearCart = async () => {
  const { data } = await axios.delete('/api/cart');
  return data;
};