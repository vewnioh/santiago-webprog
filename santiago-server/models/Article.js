const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  genre: { type: String, required: true },
  director: { type: String, required: true },
  year: { type: Number, required: true },
  rating: { type: Number, required: true, min: 0, max: 10 },
  paragraphs: { type: Number, default: 0 },
  preview: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.models.articleSchema || mongoose.model('Article', articleSchema);
