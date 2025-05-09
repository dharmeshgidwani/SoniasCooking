import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../css/Home.css"; // Import updated CSS

const Home = () => {
  const [recipes, setRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/recipes`);
        console.log("Recipes API Response:", response.data);
        setRecipes(response.data);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  // Recipe categories for filtering
  const filters = ["All", "Veg", "Non-Veg", "Snacks", "Breakfast", "Dessert", "Lunch"];

  // Filter recipes based on search input and selected category
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch =
      recipe.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.ingredients?.some((ingredient) =>
        ingredient.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesFilter =
      selectedFilter === "All" || recipe.categories.includes(selectedFilter);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="home-container">
    
      <section className="hero-section">
        <div className="hero-text">
          <h1>
            Welcome to <span className="highlight">Sonia's Cooking</span>
          </h1>
          <p>
            Discover a variety of{" "}
            <strong>easy and delicious homemade recipes</strong>. From quick
            snacks to gourmet meals, find step-by-step guides that make cooking{" "}
            <strong>fun and simple!</strong>
          </p>
        </div>
      </section>

      {/* ✅ Modern Highlights Section */}
      <section className="highlights-section">
        <div className="highlight-box">
          <h3>🍽️ Fresh Recipes Daily</h3>
          <p>Explore new and trending recipes updated regularly.</p>
        </div>
        <div className="highlight-box">
          <h3>🎥 Video Tutorials</h3>
          <p>Step-by-step videos to guide your cooking journey.</p>
        </div>
        <div className="highlight-box">
          <h3>👨‍🍳 Pro Cooking Tips</h3>
          <p>Expert tips to enhance your kitchen skills.</p>
        </div>
      </section>

      {/* ✅ Search & Filter Section */}
      <div className="search-filter-container">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search recipes by title or ingredient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-container">
          {filters.map((filter) => (
            <button
              key={filter}
              className={`filter-button ${
                selectedFilter === filter ? "active" : ""
              }`}
              onClick={() => setSelectedFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* ✅ Recipe List */}
      <h2 className="recipes-heading">🍳 Latest Recipes</h2>

      {loading ? (
        <p className="loading-text">Fetching recipes, please wait...</p>
      ) : (
        <div className="recipes-grid">
          {filteredRecipes.length > 0 ? (
            filteredRecipes.map((recipe, index) => (
              <RecipeCard key={recipe._id || index} recipe={recipe} />
            ))
          ) : (
            <p className="no-results">
              No matching recipes found. Try a different search!
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// ✅ Updated RecipeCard Component
const RecipeCard = ({ recipe }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images =
    recipe.images?.length > 0 ? recipe.images : ["/default-image.jpg"];

  const handleNextImage = (e) => {
    e.preventDefault(); // Prevents navigation issue
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrevImage = (e) => {
    e.preventDefault();
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  return (
    <Link to={`/recipe/${recipe._id}`} className="recipe-link">
      <div className="recipe-card">
        {/* ✅ Image Slider */}
        <div className="image-slider">
          {images.length > 1 && (
            <button className="prev-btn" onClick={handlePrevImage}>
              ❮
            </button>
          )}

          <img
            src={`https://soniascooking-production.up.railway.app/uploads/${images[currentImageIndex]
              ?.split("/")
              .pop()}`}
            className="recipe-image"
            alt={recipe.title}
            onError={(e) => (e.target.src = "/default-image.jpg")}
          />

          {images.length > 1 && (
            <button className="next-btn" onClick={handleNextImage}>
              ❯
            </button>
          )}
        </div>

        {/* ✅ Recipe Details */}
        <div className="recipe-info">
          <h3 className="recipe-title">{recipe.title}</h3>
          <p className="recipe-description">
            {recipe.description.length > 100
              ? recipe.description.substring(0, 100) + "..."
              : recipe.description}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default Home;
