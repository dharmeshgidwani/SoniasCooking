import { useEffect, useState } from "react";
import axios from "axios";
import "../css/AdminDashboard.css"; // Import the CSS file
import imageCompression from "browser-image-compression";

const categoryOptions = ["Veg", "Non-Veg", "Snacks", "Breakfast", "Dessert"];

const AdminDashboard = () => {
  const [recipes, setRecipes] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cookingTime, setCookingTime] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cookingTips, setCookingTips] = useState("");
  const [benefits, setBenefits] = useState("");
  const [kitchenHacks, setKitchenHacks] = useState("");
  const [youtubeVideo, setYoutubeVideo] = useState("");
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [view, setView] = useState("add");

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const response = await axios.get("http://localhost:5001/api/recipes");
      setRecipes(response.data);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    const compressedImages = [];

    for (let file of files) {
      try {
        const options = {
          maxSizeMB: 0.2,
          maxWidthOrHeight: 800,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);
        compressedImages.push(compressedFile);
      } catch (error) {
        console.error("Image compression error:", error);
      }
    }

    setImages(compressedImages);
  };

  const handleCategoryChange = (category) => {
    setCategories((prevCategories) =>
      prevCategories.includes(category)
        ? prevCategories.filter((c) => c !== category)
        : [...prevCategories, category]
    );
  };

  const handleIngredientsChange = (e) => {
    const value = e.target.value;
    setIngredients(value.split("\n")); // ✅ Splitting ingredients by new line
  };

  const handleAddOrUpdateRecipe = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Unauthorized! Please log in again.");
      return;
    }

    if (!title || !description || categories.length === 0 || !cookingTime) {
      alert("All fields are required!");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("cookingTime", cookingTime);
    formData.append("cookingTips", cookingTips);
    formData.append("benefits", benefits);
    formData.append("kitchenHacks", kitchenHacks);
    formData.append("youtubeVideo", youtubeVideo);

    ingredients.forEach((ingredient) =>
      formData.append("ingredients", ingredient)
    );
    categories.forEach((category) => formData.append("categories", category));

    if (images.length > 0) {
      images.forEach((image) => formData.append("images", image));
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    };

    try {
      if (editingRecipe) {
        await axios.put(
          `http://localhost:5001/api/recipes/${editingRecipe._id}`,
          formData,
          config
        );
        alert("Recipe updated successfully");
      } else {
        await axios.post("http://localhost:5001/api/recipes", formData, config);
        alert("Recipe added successfully");
      }

      setTitle("");
      setDescription("");
      setCookingTime("");
      setIngredients([]);
      setCategories([]);
      setImages([]);
      setEditingRecipe(null);
      fetchRecipes();
      setView("add");
    } catch (error) {
      console.error("Error saving recipe:", error);
      alert(error.response?.data?.message || "Failed to save recipe");
    }
  };

  const handleEditSelect = (recipe) => {
    setTitle(recipe.title);
    setDescription(recipe.description);
    setCookingTime(recipe.cookingTime);
    setIngredients(recipe.ingredients);
    setCategories(recipe.categories);
    setCookingTips(recipe.cookingTips || "");
    setBenefits(recipe.benefits || "");
    setKitchenHacks(recipe.kitchenHacks || "");
    setYoutubeVideo(recipe.youtubeVideo || "");
    setImages([]);
    setEditingRecipe(recipe);
    setView("add");
  };

  const handleDelete = async (recipeId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Unauthorized! Please log in again.");
      return;
    }

    const confirmation = window.confirm(
      "Are you sure you want to delete this recipe?"
    );
    if (confirmation) {
      try {
        await axios.delete(`http://localhost:5001/api/recipes/${recipeId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        alert("Recipe deleted successfully");
        fetchRecipes();
      } catch (error) {
        console.error("Error deleting recipe:", error);
        alert("Failed to delete recipe");
      }
    }
  };

  return (
    <div className="admin-container">
      <h1 className="admin-title">Admin Dashboard</h1>

      {/* Navigation */}
      <div className="admin-nav">
        <button onClick={() => setView("add")} className="add-btn">
          Add Recipe
        </button>
        <button onClick={() => setView("edit")} className="edit-btn">
          Edit Recipe
        </button>
        <button onClick={() => setView("delete")} className="delete-btn">
          Delete Recipe
        </button>
      </div>

      {/* Add/Edit Recipe Form */}
      {view === "add" && (
        <form onSubmit={handleAddOrUpdateRecipe} className="recipe-form">
          <input
            type="text"
            placeholder="Recipe Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Recipe Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
          <input
            type="text"
            placeholder="Cooking Time (minutes)"
            value={cookingTime}
            onChange={(e) => setCookingTime(e.target.value)}
            required
          />
          <textarea
            placeholder="Ingredients (one per line)"
            value={ingredients.join("\n")}
            onChange={handleIngredientsChange}
            required
          ></textarea>

          <textarea
            placeholder="Cooking Tips"
            value={cookingTips}
            onChange={(e) => setCookingTips(e.target.value)}
          ></textarea>
          <textarea
            placeholder="Benefits"
            value={benefits}
            onChange={(e) => setBenefits(e.target.value)}
          ></textarea>
          <textarea
            placeholder="Kitchen Hacks"
            value={kitchenHacks}
            onChange={(e) => setKitchenHacks(e.target.value)}
          ></textarea>
          <input
            type="text"
            placeholder="YouTube Video Link"
            value={youtubeVideo}
            onChange={(e) => setYoutubeVideo(e.target.value)}
          />

          <input type="file" multiple onChange={handleImageChange} />

          <div className="category-selector">
            <h3>Select Categories:</h3>
            {categoryOptions.map((cat) => (
              <label key={cat} className="category-label">
                <input
                  type="checkbox"
                  checked={categories.includes(cat)}
                  onChange={() => handleCategoryChange(cat)}
                />
                {cat}
              </label>
            ))}
          </div>

          <button type="submit">
            {editingRecipe ? "Update Recipe" : "Add Recipe"}
          </button>
        </form>
      )}

      {/* Edit/Delete Recipe Sections */}
      {view === "edit" && (
        <div>
          <h2>Select a Recipe to Edit</h2>
          <div className="recipe-grid">
            {recipes.map((recipe) => (
              <div
                key={recipe._id}
                onClick={() => handleEditSelect(recipe)}
                className="recipe-card edit"
              >
                <h2>{recipe.title}</h2>
                <p>{recipe.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === "delete" && (
        <div>
          <h2>Select a Recipe to Delete</h2>
          <div className="recipe-grid">
            {recipes.map((recipe) => (
              <div key={recipe._id} className="recipe-card delete">
                <h2>{recipe.title}</h2>
                <p>{recipe.description}</p>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(recipe._id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
