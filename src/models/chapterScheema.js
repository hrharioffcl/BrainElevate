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
  required: [true, "Chapter title is required"],
      trim: true,
    },
   lectureVideo: {
  type: String,
  required: [true, "Lecture video is required"],
},

lectureVideoKey: {
  type: String,
  required: [true, "Lecture video is required"],
},
totalDuration: {
    type: Number,
    default: 0
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
  required: [true, "Chapter order is required"],
    },
  },
  {
    timestamps: true,      // adds createdAt, updatedAt automatically
  }
);
chapterSchema.index({ courseId: 1, order: 1 }, { unique: true });


module.exports = mongoose.model("Chapter", chapterSchema);
