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
        const response = await axios.get("http://localhost:5001/api/recipes");
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

  // Categories for filtering
  const filters = ["All", "Veg", "Non-Veg", "Snacks", "Breakfast", "Dessert"];

  // Filter recipes based on search, selected category, and ingredient search
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
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-text">
          <h1>
            Welcome to <span className="highlight">Sonia's Cooking</span>
          </h1>
          <p>
            Explore a world of **delicious homemade recipes**. Whether you're a
            beginner or a kitchen expert, discover easy-to-follow recipes that
            bring amazing flavors to your table.
          </p>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="highlights-section">
        <div className="highlight-box">
          <h3>🔥 New Recipes Daily</h3>
          <p>Get **fresh and trending** recipes updated regularly.</p>
        </div>
        <div className="highlight-box">
          <h3>📺 Step-by-Step Videos</h3>
          <p>Follow along with **detailed YouTube tutorials**.</p>
        </div>
        <div className="highlight-box">
          <h3>✨ Expert Cooking Tips</h3>
          <p>Learn **pro cooking tricks** to enhance your skills.</p>
        </div>
      </section>

      {/* Search & Filter Section */}
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

      {/* Show All Recipes */}
      <h2 className="recipes-heading">🍽️ Latest Recipes</h2>

      {loading ? (
        <p className="loading-text">Loading...</p>
      ) : (
        <div className="recipes-grid">
          {filteredRecipes.length > 0 ? (
            filteredRecipes.map((recipe, index) => (
              <RecipeCard key={recipe._id || index} recipe={recipe} />
            ))
          ) : (
            <p className="no-results">No recipes found.</p>
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

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  return (
    <Link to={`/recipe/${recipe.token}`} className="recipe-link">
      <div className="recipe-card">
        <div className="image-slider">
          {images.length > 1 && (
            <button className="prev-btn" onClick={(e) => { e.preventDefault(); handlePrevImage(); }}>
              ❮
            </button>
          )}

          <img
            src={`http://localhost:5001/uploads/${images[currentImageIndex]
              ?.split("/")
              .pop()}`}
            className="recipe-image"
            onError={(e) => (e.target.src = "/default-image.jpg")}
          />

          {images.length > 1 && (
            <button className="next-btn" onClick={(e) => { e.preventDefault(); handleNextImage(); }}>
              ❯
            </button>
          )}
        </div>

        <div className="recipe-info">
          <h3 className="recipe-title">{recipe.title}</h3>
          <p className="recipe-description">{recipe.description}</p>
        </div>
      </div>
    </Link>
  );
};

export default Home;
