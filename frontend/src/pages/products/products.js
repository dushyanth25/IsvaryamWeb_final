import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { getAll } from '../../services/foodService';
import Thumbnails from '../../components/Thumbnails/Thumbnails';
import NotFound from '../../components/NotFound/NotFound';
import Loading from '../../components/Loading/Loading';
import { FaSearch } from 'react-icons/fa';
import './product.css';

import ScrollToTop from '../../components/ScrollToTop/ScrollToTop';



export default function ProductPage() {
  useEffect(() => {
  const scrollToTop = () => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  };

  const timeout = setTimeout(scrollToTop, 100);
  return () => clearTimeout(timeout);
}, []);

  const [foods, setFoods] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bgColor, setBgColor] = useState('#ffffff');

  // Fetch products and background color
  const fetchData = useCallback(async () => {
    try {
      const [bgRes, products] = await Promise.all([
        axios.get('https://demo.isvaryam.com/api/colors/colorproduct'),
        getAll(),
      ]);

      setBgColor(bgRes.data?.color || '#ffffff');
      setFoods(products);
    } catch (err) {
      console.error(err);
      setError('Failed to load products or background.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtered products
  const filteredFoods = useMemo(() => {
    return foods.filter((food) => {
      const nameMatch = food.name.toLowerCase().includes(searchTerm.toLowerCase());
      const categoryMatch = category ? food.category === category : true;
      return nameMatch && categoryMatch;
    });
  }, [foods, searchTerm, category]);

  // Extract unique categories
  const categories = useMemo(() => {
    return [...new Set(foods.map((f) => f.category).filter(Boolean))];
  }, [foods]);

  if (loading) {
    return <Loading />;
  }

  return (
    <>
    <ScrollToTop/>
    <div className="product-page container" style={{ backgroundColor: bgColor }}>
      <h2 className="section-title1">Our Products</h2>

      {/* Search & Filter Container */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {/* Search Input with Icon */}
        <div style={{ position: 'relative', flex: '1 1 250px' }}>
          <FaSearch
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#888',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Search for a product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '10px 10px 10px 36px',
              borderRadius: '5px',
              border: '1px solid #ccc',
              width: '100%',
              fontSize: '1rem',
              outline: 'none',
            }}
          />
        </div>

        {/* Category Dropdown */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            minWidth: '160px',
            fontSize: '1rem',
            outline: 'none',
          }}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Display Products */}
      {error ? (
        <NotFound linkText="Try Again" message={error} />
      ) : filteredFoods.length === 0 ? (
        <NotFound linkText="Back to Home" message="No products found." />
      ) : (
        <Thumbnails foods={filteredFoods} />
      )}
      
    </div>
    </>
  );
} 
