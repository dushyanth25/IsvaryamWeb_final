import React, { useEffect, useState, useRef } from 'react';
import axios from '../../axiosConfig';
import { Link } from 'react-router-dom';
import './RecipeDetails.css';

export default function RecipeDetails() {
  const [recipes, setRecipes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState('');
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  useEffect(() => {
    const fetchAllRecipes = async () => {
      try {
        const res = await axios.get('/api/recipes');
        setRecipes(res.data);
      } catch (err) {
        setError('Error loading recipes');
        console.error(err);
      }
    };

    fetchAllRecipes();
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? recipes.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === recipes.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    handleSwipe();
  };

  const handleSwipe = () => {
    const deltaX = touchStartX.current - touchEndX.current;
    if (deltaX > 50) {
      handleNext(); // Swiped left
    } else if (deltaX < -50) {
      handlePrev(); // Swiped right
    }
  };

  if (error) return <p>{error}</p>;
  if (recipes.length === 0) return <p>Loading recipes...</p>;

  const currentRecipe = recipes[currentIndex];

  return (
    <section
      className="recipe-slider-section"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="recipe-slide">
        <div key={currentRecipe._id} className="recipe-card">
          <div className="recipe-left">
            <h2 className="recipe-title">{currentRecipe.title}</h2>
            <p className="recipe-description">{currentRecipe.description}</p>
            <p className="recipe-author">
              <strong>Author:</strong> {currentRecipe.author?.name || 'Shankari'}
            </p>

            <Link to={`/recipes/${currentRecipe._id}`} className="recipe-button">
              View Full Recipe
            </Link>
          </div>

          <div className="recipe-right">
            {currentRecipe.images && currentRecipe.images.length > 0 ? (
              <img
                src={currentRecipe.images[0]}
                alt={currentRecipe.title}
                className="recipe-img"
              />
            ) : (
              <div className="recipe-no-img">No image available</div>
            )}
          </div>
        </div>

        <div className="slider-controls">
          <button onClick={handlePrev}>&larr;</button>
          <button onClick={handleNext}>&rarr;</button>
        </div>
      </div>
    </section>
  );
}
