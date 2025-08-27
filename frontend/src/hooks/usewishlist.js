import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import {
  fetchWishlist,
  addToWishlist,
  removeFromWishlist,
} from '../services/wishlistService';

// Custom hook for wishlist
export function useWishlist() {
  const { user } = useAuth(); // current logged-in user
  const [wishlist, setWishlist] = useState([]);

  // Fetch wishlist items from backend
  const refreshWishlist = async () => {
    if (!user) {
      setWishlist([]); // clear wishlist if not logged in
      return;
    }
    try {
      const data = await fetchWishlist();
      setWishlist(data);
    } catch (err) {
      if (err.response?.status === 401) {
        alert('Session expired. Please log in again!');
      } else {
        console.error('Failed to fetch wishlist:', err);
      }
    }
  };

  useEffect(() => {
    refreshWishlist();
    // eslint-disable-next-line
  }, [user]);

  // Toggle wishlist for a product
  const toggleWishlist = async (product) => {
    if (!user) {
      alert('Please log in first to use the wishlist!');
      return;
    }

    const exists = wishlist.find(i => i._id === product._id);
    try {
      if (exists) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product._id);
      }
      await refreshWishlist(); // refresh after toggle
    } catch (err) {
      if (err.response?.status === 401) {
        alert('Session expired. Please log in again!');
      } else {
        console.error('Wishlist action failed:', err);
      }
    }
  };

  // Check if a product is in wishlist
  const isInWishlist = (productId) => {
    return wishlist.some(item => item._id === productId);
  };

  return { wishlist, toggleWishlist, isInWishlist };
}

