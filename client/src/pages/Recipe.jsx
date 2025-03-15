import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../css/Recipe.css"; // Ensure CSS is updated for modern styling

const Recipe = () => {
  const { token } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/recipes/${token}`);
        setRecipe(response.data);
      } catch (error) {
        setError("Failed to fetch recipe details");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [token]);

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === recipe.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? recipe.images.length - 1 : prevIndex - 1
    );
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  console.log(recipe.youtubeVideo);
  return (
    <div className="recipe-container">
      {/* Recipe Title */}
      <h1 className="recipe-title">{recipe.title}</h1>

      {/* Image Slider */}
      <div className="image-slider">
        {recipe.images.length > 1 && (
          <button className="prev-btn" onClick={handlePrevImage}>❮</button>
        )}

        <img
          src={`http://localhost:5001${recipe.images[currentImageIndex]}`}
          alt={recipe.title}
          className="recipe-image"
        />

        {recipe.images.length > 1 && (
          <button className="next-btn" onClick={handleNextImage}>❯</button>
        )}
      </div>

      {/* Recipe Details */}
      <div className="recipe-details">
        <p className="recipe-description">
          <strong>Description:</strong> {recipe.description}
        </p>
        <p className="recipe-time">
          <strong>Cooking Time:</strong> {recipe.cookingTime} minutes
        </p>
      </div>

      {/* Ingredients */}
      <h2 className="section-title">Ingredients</h2>
      <ul className="ingredients-list">
        {recipe.ingredients.map((ingredient, index) => (
          <li key={index} className="ingredient-item">{ingredient}</li>
        ))}
      </ul>

      {/* YouTube Video Embed */}
      {recipe.youtubeVideo && (
        <div className="video-container">
          <h2 className="section-title">Watch Tutorial</h2>
          <iframe
            width="100%"
            height="400"
            src={`https://www.youtube.com/embed/${recipe.youtubeVideo}`}
            title="YouTube Recipe Video"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </div>
      )}

      {/* Kitchen Hacks */}
      {recipe.kitchenHacks && recipe.kitchenHacks.length > 0 && (
        <div className="hacks-container">
          <h2 className="section-title">Kitchen Hacks</h2>
          <ul className="hacks-list">
            {recipe.kitchenHacks.map((hack, index) => (
              <li key={index} className="hack-item">{hack}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Health Benefits */}
      {recipe.healthBenefits && recipe.healthBenefits.length > 0 && (
        <div className="benefits-container">
          <h2 className="section-title">Health Benefits</h2>
          <ul className="benefits-list">
            {recipe.healthBenefits.map((benefit, index) => (
              <li key={index} className="benefit-item">{benefit}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Recipe;
