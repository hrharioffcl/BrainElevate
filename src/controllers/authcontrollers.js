const User = require("../models/userSchema")
const Otp = require("../models/otp")
const sendOtp = require("../utils/sendotp")
const generateusertoken = require("../utils/usertoken")

//create otp logic
const createOtpcode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
}


//SIGNUP ROUTE
exports.signup = async (req, res) => {
    try {

        const { fullName, email, password, confirmPassword, terms } = req.body;

        //adding fullname password and email to session
        req.session.signupData = { fullName, email, password }

        //confirm existing user
        const existinguser = await User.findOne({ email });
        if (existinguser) return res.status(400).send("user already exist")

        //confirm password check
        if (password !== confirmPassword) {
            return res.status(400).send("password match disqaulified")
        }
        //terms and condition check
        if (terms !== "true") {
            return res.status(400).send("Accept termss and conditions")

        }
        //place user without saving anad validate
        const user = new User({ fullName, email, password })
        await user.validate()
        //delete otp records
        await Otp.deleteMany({ email, purpose: "signup" })
        //otp generate
        const otpcode = createOtpcode();
        const expiresAt = new Date(Date.now() + 3 * 60 * 1000)

        await Otp.create({ email, otpcode, purpose: "signup", expiresAt })
        //send dOTP via email
        await sendOtp(email, otpcode)
        res.status(200).send("otp send to mail")

    } catch (error) {
        console.log(error)
        res.status(500).send("error signing up")
    }
}



//otp verification
exports.verifyOtp = async (req, res) => {
    try {
        const { otp } = req.body
        const { fullName, email, password } = req.session.signupData;
        const otpRecord = await Otp.findOne({ email, purpose: "signup" }).sort({ createdAt: -1 })
        if (otpRecord.otpcode != otp) {
            return res.status(400).send("invalid otp")
        }
        ///create user if otp verified
        const user = await User.create({ fullName, email, password, isVerified: true })
        await Otp.deleteOne({ _id: otpRecord._id })
        req.session.signupData = null

        //generate jwt
        const token = generateusertoken(user._id)
        res.status(200).send("user created")


    } catch (error) {
        console.error(error)
        res.status(500).send("some error occured")
    }

}

//resend otp
exports.resendotp = async function (req, res) {
    try {
        const { email } = req.session.signupData;
        await Otp.deleteOne({ email, purpose: "signup" });
        const otpcode = createOtpcode()
        const expiresAt = new Date(Date.now() + 3 * 60 * 1000)
        await Otp.create({ otpcode, email, purpose: "signup", expiresAt })
        await sendOtp(email, otpcode)
        res.status(200).send("resend otp  successfully")

    } catch (error) {
        console.log(error)
        res.status(500).send("server error")
    }
}
