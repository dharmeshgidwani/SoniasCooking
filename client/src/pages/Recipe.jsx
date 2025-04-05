import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { jsPDF } from "jspdf";
import "../css/Recipe.css"; // Ensure CSS is updated for modern styling

const Recipe = () => {
  const { recipeId } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [userRated, setUserRated] = useState(false);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await axios.get(
          `https://soniascooking-production.up.railway.app/api/recipes/${recipeId}`
        );
        setRecipe(response.data);
        setRating(response.data.averageRating || 0);
      } catch (error) {
        setError("Failed to fetch recipe details");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [recipeId]);

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

  // Function to extract YouTube video ID
  const getYouTubeVideoIDFromIframe = (iframe) => {
    const regex = /https:\/\/www\.youtube\.com\/embed\/([a-zA-Z0-9_-]+)/;
    const match = iframe.match(regex);
    return match ? match[1] : null;
  };

  // Extract the video ID from the full iframe URL
  const videoID = recipe.youtubeVideo
    ? getYouTubeVideoIDFromIframe(recipe.youtubeVideo)
    : null;

  // Function to save the recipe as a PDF
  const saveAsPDF = () => {
    const doc = new jsPDF();

    // Set background color for the PDF
    doc.setFillColor(255, 248, 235); // Light cream color
    doc.rect(
      0,
      0,
      doc.internal.pageSize.width,
      doc.internal.pageSize.height,
      "F"
    ); // Fill background

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 0, 0); // Red color
    doc.text(recipe.title, 10, 20);

    // Recipe Description
    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0); // Black color
    doc.text(`Description: ${recipe.description}`, 10, 40);

    // Cooking Time
    doc.text(`Cooking Time: ${recipe.cookingTime} minutes`, 10, 50);

    // Adding Ingredients
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 255); // Blue color for ingredients section
    doc.text("Ingredients:", 10, 60);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    recipe.ingredients.forEach((ingredient, index) => {
      doc.text(`- ${ingredient}`, 10, 70 + index * 10);
    });

    // Adding Kitchen Hacks (if available)
    if (recipe.kitchenHacks && recipe.kitchenHacks.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(0, 128, 0); // Green color for kitchen hacks section
      doc.text("Kitchen Hacks:", 10, 100 + recipe.ingredients.length * 10);
      doc.setFont("helvetica", "normal");
      recipe.kitchenHacks.forEach((hack, index) => {
        doc.text(
          `- ${hack}`,
          10,
          110 + (recipe.ingredients.length + index) * 10
        );
      });
    }

    // Health Benefits (if available)
    if (recipe.healthBenefits && recipe.healthBenefits.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(255, 165, 0); // Orange color for health benefits section
      doc.text(
        "Health Benefits:",
        10,
        130 + (recipe.ingredients.length + recipe.kitchenHacks.length) * 10
      );
      doc.setFont("helvetica", "normal");
      recipe.healthBenefits.forEach((benefit, index) => {
        doc.text(
          `- ${benefit}`,
          10,
          140 +
            (recipe.ingredients.length + recipe.kitchenHacks.length + index) *
              10
        );
      });
    }

    // Add a horizontal line
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);
    doc.line(10, 150, 200, 150); // Horizontal line

    // Image (if available)
    if (recipe.images && recipe.images.length > 0) {
      const imageUrl = `https://soniascooking-production.up.railway.app${recipe.images[0]}`;
      doc.addImage(imageUrl, "JPEG", 10, 160, 180, 120); // Adding an image to PDF
    }

    // Save the PDF
    doc.save(`${recipe.title}.pdf`);
  };

  const handleRating = async (rating) => {
    const token = localStorage.getItem("token");

    try {
      // Send the rating to the backend
      const response = await axios.post(
        `https://soniascooking-production.up.railway.app/api/recipes/${recipeId}/rate`,
        { rating },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Rating submitted:", response.data);
      alert("Rating submitted successfully");
      setRating(rating);
      setUserRated(true);
    } catch (error) {
      console.error("Error saving rating:", error);

      if (error.response && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        alert("Failed to submit rating");
      }
    }
  };

  console.log("kh----", recipe.kitchenHacks);
  console.log("ct", recipe.cookingTips);
  console.log("b", recipe.benefits);
  console.log("mrehtod", recipe.method);

  return (
    <div className="recipe-container">
      {/* Recipe Title */}
      <h1 className="recipe-title">{recipe.title}</h1>

      {/* Image Slider */}
      <div className="image-slider">
        {recipe.images.length > 1 && (
          <button className="prev-btn" onClick={handlePrevImage}>
            ❮
          </button>
        )}

        <img
          src={`https://soniascooking-production.up.railway.app${recipe.images[currentImageIndex]}`}
          alt={recipe.title}
          className="recipe-image"
        />

        {recipe.images.length > 1 && (
          <button className="next-btn" onClick={handleNextImage}>
            ❯
          </button>
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
          <li key={index} className="ingredient-item">
            {ingredient}
          </li>
        ))}
      </ul>

      {/* YouTube Video Embed */}
      {videoID && (
        <div className="video-container">
          <h2 className="section-title">Watch Tutorial</h2>
          <iframe
            width="100%"
            height="400"
            src={`https://www.youtube.com/embed/${videoID}?autoplay=1`}
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
              <li key={index} className="hack-item">
                {hack}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recipe Method */}
      {recipe.method && recipe.method.length > 0 && (
        <div className="method-container">
          <h2 className="section-title">Method</h2>
          <ol className="method-list">
            {recipe.method.map((step, index) => (
              <li key={index} className="method-item">
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Cooking Tips */}
      {recipe.cookingTips && recipe.cookingTips.length > 0 && (
        <div className="tips-container">
          <h2 className="section-title">Cooking Tips</h2>
          <ul className="tips-list">
            {recipe.cookingTips.map((tip, index) => (
              <li key={index} className="tip-item">
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Health Benefits */}
      {recipe.benefits && recipe.benefits.length > 0 && (
        <div className="benefits-container">
          <h2 className="section-title">Health Benefits</h2>
          <ul className="benefits-list">
            {recipe.benefits.map((benefit, index) => (
              <li key={index} className="benefit-item">
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rating-section">
        <h2 className="section-title">Rate this Recipe</h2>
        <div className={`star-rating ${userRated ? "userRated" : ""}`}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`star ${rating >= star ? "filled" : ""}`}
              onClick={() => {
                setRating(star);
                handleRating(star);
              }}
            >
              ★
            </span>
          ))}
        </div>
      </div>

      {/* Average Rating */}
      <p className="average-rating">
        <strong>Average Rating: </strong>
        {recipe.averageRating ? recipe.averageRating : "No ratings yet"}
      </p>

      {/* Save as PDF Button */}
      <div className="save-pdf-button-container">
        <button onClick={saveAsPDF} className="save-pdf-btn">
          Save Recipe as PDF
        </button>
      </div>
    </div>
  );
};

export default Recipe;
