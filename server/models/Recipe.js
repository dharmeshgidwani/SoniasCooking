const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String }], 
  categories: [{ type: String, required: true }], 
  ingredients: [{ type: String, required: true }], 
  cookingTime: { type: Number, required: true }, 
  cookingTips: { type: String }, 
  benefits: { type: String },
  kitchenHacks: { type: String }, 
  youtubeVideo: { type: String },
});

module.exports = mongoose.model("Recipe", recipeSchema);
