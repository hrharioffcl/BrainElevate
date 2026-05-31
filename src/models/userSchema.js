const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcrypt")
const userSchema = new mongoose.Schema(
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
                     required: [true, "*Please enter a valid email address"],
            unique: true,
            trim: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error("*Please enter a valid email address")
                }
            }
        },
        password: {
            type: String,
           required: [true, "*Password must be at least 8 characters long, with at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol."],
            trim: true,
            validate(value) {
                if (!validator.isStrongPassword(value)) {
                    throw new Error("*Password must be at least 8 characters long, with at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol.")
                }
            }
        },
        profilepic: {
            type: String,
            default: "/images/defaultdp.svg"
        },
        profilepicId: {
            type: String,
            default: null
        },
        location: {
            type: String,

        },
        contactNumber: {
            type: String,
        },
        countryCode: {
            type: String,
        },
        gender: {
            type: String,
            enum: ["Male", "Female", "Others"],//enum for dropdown
        },
        referralCode: {
            type: String,
            unique: true,
        },
        referredBy: {
            type: String, // store referralCode or userId of the referrer
            default: null,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
        lastLogin: {
            type: Date,
            default: null,
        },
        // Soft delete field
        isDeleted: {
            type: Boolean,
            default: false
        },
        feedBack: {
            type: String,
            default: null
        },
        googleUser: {
            type: Boolean,
            default: false
        },
    },
    { timestamps: true }

)

//hashing password
userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10)
    }
    next()

})

module.exports = mongoose.model('User', userSchema)