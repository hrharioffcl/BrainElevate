const mongoose = require("mongoose")
const validator = require("validator")
const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error("Invalid email address")
                }
            }
        },
        password: {
            type: String,
            required: true,
            trim: true,
            validate(value) {
                if (!validator.isStrongPassword(value)) {
                    throw new Error("Password must be at least 8 characters long, with at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol.")
                }
            }
        },
        profilepic: {
            type: String,
            default: "/images/defualtdp.svg"
        },
        location: {
            type: String,

        },
        contactNumber: {
            type: String,

        },
        gender: {
            type: String,
            enum: ["Male", "Female", "Other"],//enum for dropdown
            default: "Other",
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
    },
    { timestamps: true }

)
