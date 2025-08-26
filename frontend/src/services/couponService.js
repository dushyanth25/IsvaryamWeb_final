import axios from 'axios';

export const getCouponByCode = async (code) => {
  const { data } = await axios.get(`/api/coupons/${code}`);
  return data;
};

export const getAllCoupons = async () => {
  const { data } = await axios.get('/api/coupons');
  return data;
};