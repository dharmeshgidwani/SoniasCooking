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
      cookingTime,
      cookingTips, 
      benefits, 
      kitchenHacks, 
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
        cookingTips, // ✅ New Field
        benefits, // ✅ New Field
        kitchenHacks, // ✅ New Field
        youtubeVideo, // ✅ New Field
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
          cookingTime,
          cookingTips, 
          benefits, 
          kitchenHacks, 
          youtubeVideo, 
          images: imagePaths,
        },
        { new: true }
      );

      res.status(200).json({ message: "Recipe updated", recipe: updatedRecipe });
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
router.get("/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const recipe = await Recipe.findById(decoded.recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.status(200).json(recipe);
  } catch (error) {
    console.error("Error decoding token:", error);
    res.status(500).json({ message: "Error fetching recipe details" });
  }
});

module.exports = router;
