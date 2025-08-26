import axios from 'axios';

export const getAll = async () => {
  const { data } = await axios.get('/api/foods');
  return data;
};

export const search = async searchTerm => {
  const { data } = await axios.get('/api/foods/search/' + searchTerm);
  return data;
};

export const getAllTags = async () => {
  const { data } = await axios.get('/api/foods');
  // Extract unique categories/tags from products
  const categories = [...new Set(data.map(food => food.category).filter(Boolean))];
  return categories;
};

export const getAllByTag = async tag => {
  if (tag === 'All') return getAll();
  const { data } = await axios.get('/api/foods/category/' + tag);
  return data;
};

// src/services/foodService.js
export async function getById(id) {
  const { data } = await axios.get(`/api/foods/id/${id}`);
  return data;
}
export async function deleteById(foodId) {
  await axios.delete('/api/foods/' + foodId);
}

export async function update(food) {
  await axios.put('/api/foods', food);
}

export async function add(food) {
  const { data } = await axios.post('/api/foods', food);
  return data;
}