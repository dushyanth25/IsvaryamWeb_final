import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import {
  fetchWishlist,
  addToWishlist,
  removeFromWishlist,
} from '../services/wishlistService';

// In usewishlist.js
export function useWishlist() {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);

  const refreshWishlist = async () => {
    if (user) {
      const data = await fetchWishlist();
      setWishlist(data);
    }
  };

  useEffect(() => {
    refreshWishlist();
    // eslint-disable-next-line
  }, [user]);

  const toggleWishlist = async (product) => {
    if (!user) return;
    const exists = wishlist.find(i => i._id === product._id);
    if (exists) {
      await removeFromWishlist(product._id);
    } else {
      await addToWishlist(product._id);
    }
    await refreshWishlist(); // <-- force re-fetch after toggle
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item._id === productId);
  };

  return { wishlist, toggleWishlist, isInWishlist };
}