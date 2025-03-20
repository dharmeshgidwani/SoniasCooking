const express = require("express");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middlewares/authMiddleware");
const multer = require("multer");
const Recipe = require("../models/Recipe");
const path = require("path");
const sharp = require("sharp");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const fs = require("fs");

const storage = multer.memoryStorage();
const upload = multer({ storage });

const generateRecipeToken = (recipeId) => {
  return jwt.sign({ recipeId }, process.env.JWT_SECRET);
};

// ✅ GET all recipes
router.get("/", async (req, res) => {
  try {
    const recipes = await Recipe.find();

    const recipesWithToken = recipes.map((recipe) => {
      const token = generateRecipeToken(recipe._id);
      return { ...recipe.toObject(), token };
    });

    res.status(200).json(recipesWithToken);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    res.status(500).json({ message: "Error fetching recipes" });
  }
});

// ✅ GET recipes (only accessible by admin)
router.get(
  "/admin/recipes",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const recipes = await Recipe.find();
      res.status(200).json({ message: "Only admins can see this", recipes });
    } catch (error) {
      res.status(500).json({ message: "Error fetching admin recipes" });
    }
  }
);

// ✅ Add a new recipe
router.post("/", upload.array("images", 5), async (req, res) => {
  try {
    const {
      title,
      description,
      categories,
      ingredients,
      cookingTime,
      cookingTips,
      benefits,
      kitchenHacks,
      youtubeVideo,
      method,
    } = req.body;

    const imagePaths = [];

    for (let file of req.files) {
      const filename = `uploads/${Date.now()}-${file.originalname}`;
      const filePath = path.join(__dirname, "../public", filename);

      await sharp(file.buffer)
        .resize(800)
        .jpeg({ quality: 80 })
        .toFile(filePath);

      imagePaths.push(`/${filename}`);
    }

    const newRecipe = new Recipe({
      title,
      description,
      categories: Array.isArray(categories) ? categories : [categories],
      images: imagePaths,
      ingredients: Array.isArray(ingredients) ? ingredients : [ingredients],
      method: Array.isArray(method) ? method : [method],
      cookingTime,
      cookingTips: Array.isArray(cookingTips) ? cookingTips : [cookingTips],
      benefits: Array.isArray(benefits) ? benefits : [benefits],
      kitchenHacks: Array.isArray(kitchenHacks) ? kitchenHacks : [kitchenHacks],
      youtubeVideo,
    });

    await newRecipe.save();

    res.status(201).json({ recipe: newRecipe });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding recipe" });
  }
});

// ✅ Update a recipe
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  upload.array("images", 5),
  async (req, res) => {
    try {
      const {
        title,
        description,
        categories,
        ingredients,
        cookingTime,
        cookingTips, 
        benefits, 
        kitchenHacks, 
        youtubeVideo, 
        method,
      } = req.body;

      const existingRecipe = await Recipe.findById(req.params.id);
      if (!existingRecipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }

      let imagePaths = existingRecipe.images;
      if (req.files.length > 0) {
        imagePaths = [];
        for (let file of req.files) {
          const filename = `uploads/${Date.now()}-${file.originalname}`;
          const filePath = path.join(__dirname, "../public", filename);

          await sharp(file.buffer)
            .resize(800)
            .jpeg({ quality: 80 })
            .toFile(filePath);

          imagePaths.push(`/${filename}`);
        }
      }

      const updatedRecipe = await Recipe.findByIdAndUpdate(
        req.params.id,
        {
          title,
          description,
          categories: Array.isArray(categories) ? categories : [categories],
          ingredients: Array.isArray(ingredients) ? ingredients : [ingredients],
          method: Array.isArray(method) ? method : [method],
          cookingTime,
          cookingTips: Array.isArray(cookingTips) ? cookingTips : [cookingTips],
          benefits: Array.isArray(benefits) ? benefits : [benefits],
          kitchenHacks: Array.isArray(kitchenHacks)
            ? kitchenHacks
            : [kitchenHacks],
          youtubeVideo,
          images: imagePaths,
        },
        { new: true }
      );

      res
        .status(200)
        .json({ message: "Recipe updated", recipe: updatedRecipe });
    } catch (error) {
      console.error("Error updating recipe:", error);
      res.status(500).json({ message: "Error updating recipe" });
    }
  }
);

// ✅ Delete a recipe
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const deletedRecipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!deletedRecipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    res.status(200).json({ message: "Recipe deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting recipe" });
  }
});

// ✅ Get recipe details by token
router.get("/:recipeId", async (req, res) => {
  try {
    const { recipeId } = req.params;

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.status(200).json(recipe);
  } catch (error) {
    console.error("Error decoding token:", error);
    res.status(500).json({ message: "Error fetching recipe details" });
  }
});

// ✅ Submit a rating for a recipe by recipeId
router.post("/:recipeId/rate", authMiddleware, async (req, res) => {
  // Add authMiddleware here
  const { recipeId } = req.params;
  const rating = parseInt(req.body.rating, 10);

  console.log("Rating received:", rating);

  if (isNaN(rating)) {
    return res.status(400).json({ message: "Invalid rating value" });
  }

  try {
    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    // Find the recipe by ID
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    console.log("recipe ", recipe);

    // Check if the user has already rated the recipe
    const existingRating = recipe.ratings.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (existingRating) {
      return res
        .status(400)
        .json({ message: "You have already rated this recipe" });
    }

    // Add the new rating
    recipe.ratings.push({ user: req.user._id, rating });

    // Calculate the new average rating
    const totalRatings = recipe.ratings.length;
    const sumRatings = recipe.ratings.reduce(
      (sum, r) => sum + (isNaN(r.rating) ? 0 : r.rating),
      0
    );

    // Ensure averageRating is a valid number
    const newAverageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

    // Update the averageRating field in the recipe
    recipe.averageRating = newAverageRating;

    // Save the recipe with updated ratings and average
    await recipe.save();

    console.log("Rating submitted successfully:", recipe.averageRating); // Log the new average rating

    res
      .status(200)
      .json({
        message: "Rating submitted successfully",
        averageRating: recipe.averageRating,
      });
  } catch (error) {
    console.error("Error submitting rating:", error);
    res.status(500).json({ message: "Error submitting rating" });
  }
});

// ✅ GET ratings for a recipe by token
router.get("/:recipeId/ratings", async (req, res) => {
  try {
    const { recipeId } = req.params;
    // Find the recipe by ID and populate the ratings
    const recipe = await Recipe.findById(recipeId).populate(
      "ratings.user",
      "username"
    ); // Optional, to include user info
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    console.log("Ratings fetched for recipe:", recipe.ratings); // Log the fetched ratings

    res.status(200).json(recipe.ratings); // Return only the ratings
  } catch (error) {
    console.error("Error fetching ratings:", error);
    res.status(500).json({ message: "Error fetching ratings" });
  }
});

module.exports = router;
