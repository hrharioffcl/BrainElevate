const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcrypt")
const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
            minlength: [4, "Full name must be at least 4 characters"],
            maxlength: [30, "Full name can be max 30 characters"],
            validate(value) {
                if (!/^[A-Za-z\s]+$/.test(value)) {
                    throw new Error("Full name must contain only letters and spaces")
                }

            }


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


userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10)
    }
    next()

})

module.exports = mongoose.model('User', userSchema)