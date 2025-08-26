import axios from 'axios';

export const getReviewsByProductId = async (productId) => {
  const { data } = await axios.get(`/api/reviews/product/${productId}`);
  return data;
};