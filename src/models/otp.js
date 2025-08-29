const mongoose = require("mongoose");

const otpschema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    }
    ,
    otpcode: {
        type: String,
        required: true

    },
    purpose: {
        type: String,
        enum: ["signup", "resetpassword","forgotpassword",'adminforgotpassword'],
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true
    }

},
    {
        timestamps: true
    }
);
otpschema.index({expiresAt:1},{expireAfterSeconds:0})


module.exports = mongoose.model('Otp',otpschema)