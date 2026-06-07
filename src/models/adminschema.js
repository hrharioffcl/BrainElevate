const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const adminSchema = new mongoose.Schema(
  {
  
          fullName: {
              type: String,
            required: [true, "*Full name must be at least 4 characters"],
              trim: true,
              minlength: [4, "Full name must be at least 4 characters"],
              maxlength: [30, "Full name can be max 30 characters"],
               validate(value) {
          if (!validator.isAlpha(value.replace(/\s/g, ""))) {
              throw new Error("*Full name can contain only letters");
          }
      }
          },
    email: {
      type: String,
required: [true, "*Please enter a valid email address"],      unique: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("*Invalid email address");
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error(
            "*Password must be at least 8 characters long, with at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol."
          );
        }
      },
    },
    passwordChangedAt: {
  type: Date,
  default: null
},
mustChangePassword: {
  type: Boolean,
  default: true
},
profileCompleted: {
    type: Boolean,
    default: false
},
 profilePic: {
    public_id: String,
    url: {
        type: String,
        default: "/images/defaultdp.svg"
    }
},
contactNumber: {
  type: String,
  trim: true,
  unique: true,
  sparse: true,
  validate(value) {

    if (!value || value.trim() === "") {
      throw new Error(
        "Contact number is required"
      );
    }

    if (!validator.isMobilePhone(value, "en-IN")) {
      throw new Error(
        "Please enter a valid 10-digit Indian mobile number"
      );
    }
  }
}
,address: {
  type: String,
  trim: true,
  default: "",
  validate(value) {

    if (!value || value.trim().length < 5) {

      throw new Error(
        "Address must contain at least 5 characters"
      );
    }

  }
},
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"], 
      default: "Other",
    },
  role: {
  type: String,
  enum: [
    "super_admin",
    "manager",
    "contributor"
  ],
  default: "contributor",
},

    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    createdBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Admin",
  default: null
},
    isDeleted: {
  type: Boolean,
  default: false
}
  },
  
  { timestamps: true } 
);
//Hash password before saving
adminSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model("Admin", adminSchema);
