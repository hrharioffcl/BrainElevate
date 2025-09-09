const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,   // each category should be unique
    trim: true,
    minlength: [3, "Category name must be at least 3 characters"],
    maxlength: [30, "Category name can be max 30 characters"],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, "Description too long"],
  },
  isDeleted: {
    type: Boolean,
    default: false,  // soft delete
  }
}, { timestamps: true });

module.exports = mongoose.model("Category", categorySchema);
