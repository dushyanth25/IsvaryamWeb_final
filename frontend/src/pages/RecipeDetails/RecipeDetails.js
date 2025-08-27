import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../../axiosConfig';
import './RecipeDetails.css';
export default function RecipeDetails() {
  useEffect(() => {
  const scrollToTop = () => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  };

  const timeout = setTimeout(scrollToTop, 100);
  return () => clearTimeout(timeout);
}, []);

  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await axios.get(`/api/recipes/${id}`);
        setRecipe(res.data);
      } catch (err) {
        setError('Recipe not found or server error.');
      }
    };
    fetchRecipe();
  }, [id]);

  if (error) return <p>{error}</p>;
  if (!recipe) return <p></p>;

  return (
    <div className="recipe-details" style={{ padding: '20px' }}>
      <h2>{recipe.title}</h2>

      {/* Display first image */}
      {recipe.images?.length > 0 && (
        <img
          src={recipe.images[0]}
          alt={recipe.title}
          style={{ width: '100%', maxWidth: '500px', borderRadius: '12px', marginBottom: '20px' }}
        />
      )}

      <p>{recipe.description}</p>

      <h3>Ingredients</h3>
      <ul>
        {recipe.ingredients?.map((item, idx) => (
          <li key={idx}>
            {item.name} — {item.quantity}
          </li>
        ))}
      </ul>

      <h3>Instructions</h3>
      <ol>
        {recipe.instructions?.map((step, idx) => (
          <li key={idx}>{step}</li>
        ))}
      </ol>

      <p><strong>Preparation Time:</strong> {recipe.prepTime} mins</p>
      <p><strong>Cooking Time:</strong> {recipe.cookingTime} mins</p>
      <p><strong>Difficulty:</strong> {recipe.difficulty}</p>

      {recipe.tags?.length > 0 && (
        <p><strong>Tags:</strong> {recipe.tags.join(', ')}</p>
      )}

      {recipe.videoUrl && (
        <div style={{ marginTop: '20px' }}>
          <h3>Video</h3>
          <iframe
            width="100%"
            height="315"
            src={recipe.videoUrl}
            title="Recipe Video"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </div>
      )}
    </div>
  );
}
