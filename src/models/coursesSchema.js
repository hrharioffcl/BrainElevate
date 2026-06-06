const mongoose = require("mongoose");
const slugify = require("slugify");

const courseSchema = new mongoose.Schema(
    {
  name: {
  type: String,
  required: [true, "Course name is required"],
  trim: true,
  minlength: [3, "Course name must be at least 3 characters"],
  maxlength: [100, "Course name can be max 100 characters"],
},

details: {
  type: String,
  required: [true, "Course details are required"],
  trim: true,
},

author: {
  type: String,
  required: [true, "Author name is required"],
  trim: true,
}, 
level: {
    type: String,
    default: "Beginner",
  }, 
  thumbnail: {
  public_id: { type: String },
  url: { type: String,
    default:"/images/pexels-yankrukov-8837809.jpg"
   }
},
description: {
  type: String,
  required: [true, "Course description is required"],
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
ogPrice: {
  type: Number,
  required: [true, "Original price is required"],
  min: [0, "Price cannot be negative"]
},
price: {
  type: Number,
  required: [true, "Course price is required"],
  min: [0, "Price cannot be negative"]
},
category: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Category",
  required: [true, "Please select a category"],
   set: v => v === "" ? undefined : v,
},

duration: {
  type: String,
  required: [true, "Please select course duration"],
  enum: ["1-3 months", "3-6 months", "6-12 months"],
},

 
 
 status: {
  type: String,
  enum: [
    "draft",
    "saved",
    "pending",
    "approved",
    "rejected",
    "published"
  ],
  default: "draft",
},

createdBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Admin",
  default: null
},

approvedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Admin",
  default: null
},

approvedAt: {
  type: Date,
  default: null
},

approvalNote: {
  type: String,
  trim: true,
  default: ""
},

isDeleted: {
  type: Boolean,
  default: false,
},

  slug: {
  type: String,
  unique: true,
  index: true
}
,
rating: {
  type: Number,
  default: 0
},
reviewCount: {
  type: Number,
  default: 0
}

}, 
{ timestamps: true });


courseSchema.pre("save", async function (next) {
  if (!this.isModified("name")) return next();

  const baseSlug = slugify(this.name, {
    lower: true,
    strict: true
  });

  let slug = baseSlug;
  let count = 1;

  const Course = this.constructor;
  while (await Course.findOne({ slug })) {
    slug = `${baseSlug}-${++count}`;
  }

  this.slug = slug;
  next();
});

courseSchema.pre("validate", function(next) {

    if (
        this.ogPrice != null &&
        this.price != null &&
        this.ogPrice < this.price
    ) {
        this.invalidate(
            "ogPrice",
            "Original price must be greater than or equal to course price"
        );
    }

    next();
});

module.exports = mongoose.model("Course", courseSchema);
