// models/Recipe.js
const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    images: [String],
    ingredients: [String],
    cookingTime: { type: Number },
    categories: [String],
    cookingTips: [String],
    benefits: [String],
    kitchenHacks: [String],
    youtubeVideo: { type: String },
    ratings: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, rating: { type: Number, min: 1, max: 5 } }],
    averageRating: { type: Number, default: 0 }, 
  },
  { timestamps: true }
);

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;
