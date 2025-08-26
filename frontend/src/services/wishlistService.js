import axios from 'axios';

// Fetch current user's wishlist (returns array of { productId: { ...product } })
export async function fetchWishlist() {
  const res = await axios.get('/api/whishlist');
  // Map to array of product objects
  return res.data.map(item => item.productId);
}

// Add a product to wishlist (send { productId })
export async function addToWishlist(productId) {
  const res = await axios.post('/api/whishlist', { productId });
  return res.data.productId; // populated product
}

// Remove a product from wishlist
export async function removeFromWishlist(productId) {
  const res = await axios.delete(`/api/whishlist/${productId}`); // <-- fixed quotes
  return res.data;
}