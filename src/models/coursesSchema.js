const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
    {
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: [3, "Course name must be at least 3 characters"],
    maxlength: [100, "Course name can be max 100 characters"],
  },
  details: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  learnPoints: {
    type: [String], // Array of strings
    validate: {
      validator: function (arr) {
        return arr.length >= 1 && arr.length <= 4;
      },
      message: "You must add at least 1 and at most 4 learning points.",
  }},
  author: {
    type: String,
    required: true,
    trim: true,
  },
  level: {
    type: String,
    default: "Beginner",
  },
  thumbnail: {
    type: String,
  default: "/images/defaultcourse.svg",
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",   // relation to Category schema

  },
  status: {
    type: String,
    enum: ["draft", "saved", "published"],
    default: "draft",
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },price:{
    type:Number,

  },
  duration:{
    type:String,
     enum: ["1-3 months", "3-6 months", "6-12 months"],

  }
}, 
{ timestamps: true });

module.exports = mongoose.model("Course", courseSchema);
