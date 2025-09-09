const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",       // references Course collection
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    lectureVideo: {
      type: String,        // could be a URL or file path
      default: null,
    },
    lectureDescription: {
      type: String,
      default: "",
      trim: true,
    },
    lectureNotes: {
      type: String,        // could store text notes or a file path
      default: "",
    },
    lecturePdf: {
      type: String,        // file path or URL to PDF
      default: null,
    },
    status: {
      type: String,
      enum: ["draft", "pendingApproval", "published"],
      default: "draft",
    },
    order: {
      type: Number,        // order/sequence in course
      required: true,
    },
  },
  {
    timestamps: true,      // adds createdAt, updatedAt automatically
  }
);

module.exports = mongoose.model("Chapter", chapterSchema);
