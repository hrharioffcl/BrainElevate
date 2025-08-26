const User = require("../models/userSchema")
const Otp = require("../models/otp")
const sendOtp = require("../utils/sendotp")
const generateusertoken = require("../utils/usertoken")
const bcrypt = require("bcrypt")

//create otp logic
const createOtpcode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
}


//SIGNUP ROUTE
exports.signup = async (req, res) => {
    const { fullName, email, password, confirmPassword, terms } = req.body;

    const fieldErrors = {};
    const formData = {
        fullName: fullName || '',
        email: email || '',
        password: password || '',
        confirmPassword: confirmPassword || '',
        terms: terms === "true" ? "true" : "false"
    };


    //adding fullname password and email to session
    req.session.signupData = { fullName, email, password }

    //confirm existing user
    const existinguser = await User.findOne({ email });
    if (existinguser) fieldErrors.email = "*User already exists, try logging in!";


    //confirm password check
    if (password !== confirmPassword) fieldErrors.confirmPassword = "*Passwords do not match";
    //terms and condition check
    if (terms !== "true") fieldErrors.terms = "*Please accept Terms & Conditions";

    if (Object.keys(fieldErrors).length > 0) {
        return res.render('signup', { fieldErrors, formData });
    }
    try {

        //place user without saving anad validate
        const tempuser = new User({ fullName, email, password })
        await tempuser.validate()

        //delete otp records
        await Otp.deleteMany({ email, purpose: "signup" })
        //otp generate
        const otpcode = createOtpcode();
        const expiresAt = new Date(Date.now() + 3 * 60 * 1000)

        await Otp.create({ email, otpcode, purpose: "signup", expiresAt })
        //send dOTP via email
        await sendOtp(email, otpcode)
        console.log("redirecting to verify")
        res.redirect('/verify-otp')
    } catch (error) {
        console.log(error)
        if (error.name === "ValidationError") {
            for (let field in error.errors) {
                fieldErrors[field] = error.errors[field].message
            }
            return res.render('signup', { fieldErrors, formData })

        }

    }
}

//otp verification
exports.verifyOtp = async (req, res) => {
    try {
        const { otp1, otp2, otp3, otp4, otp5, otp6 } = req.body
        const otp = otp1 + otp2 + otp3 + otp4 + otp5 + otp6;
        const { fullName, email, password } = req.session.signupData;
        const otpRecord = await Otp.findOne({ email, purpose: "signup" }).sort({ createdAt: -1 })
        if (!otpRecord || otpRecord.otpcode !== otp || otpRecord.expiresAt < Date.now()) {
            return res.render("otp", {
                errorMessage: "❌ Invalid or expired OTP"
            });
        }
        ///create user if otp verified
        const user = await User.create({ fullName, email, password, isVerified: true })
        await Otp.deleteOne({ _id: otpRecord._id })
        req.session.signupData = null

        //generate jwt
        const token = generateusertoken(user._id)
        res.cookie('jwt', token, {
            httpOnly: true,
            maxAge: 1 * 60 * 60 * 1000 // 1 hour
        });
        res.redirect('/home')


    } catch (error) {
        console.error(error)
        res.status(500).send("some error occured")
    }

}

//resend otp
exports.resendotp = async function (req, res) {
    try {
        const { email } = req.session.signupData;
        await Otp.deleteMany({ email, purpose: "signup" });
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


//login
exports.login = async (req, res) => {
    const { email, password, rememberMe } = req.body;
    console.log(req.body.rememberMe)

    const fieldErrors = {};
    const formData = {
        email: email || '',
    };


    try {

        const existinguser = await User.findOne({ email });
        if (!existinguser) {
            fieldErrors.email = "User not registered";
            return res.render('login', { fieldErrors, formData })
        }

        const isMatch = await bcrypt.compare(password, existinguser.password)
        if (!isMatch) {
            fieldErrors.password = "Invalid credentials";
            return res.render('login', { fieldErrors, formData })
        }


        // generate JWT
        const token = generateusertoken(existinguser._id);
        const rememberMeChecked = rememberMe === "on"; // standard HTML checkbox
        // If remember me is checked/notchecked )
        res.cookie('jwt', token, {
            httpOnly: true,
            maxAge: rememberMeChecked ? 7 * 24 * 60 * 60 * 1000 : 1 * 60 * 60 * 1000
        });

        res.redirect('/home');
    } catch (error) {
        console.log(error)

        return res.render('login', { fieldErrors, formData })

    }

}




//FORGOT PASSWORD
exports.forgotpassword = async (req, res) => {
    const { email } = req.body;
     const fieldErrors = {};
    const formData = {
        email: email || '',
    };
    try {
        const existinguser = await User.findOne({ email });
        if (!existinguser) {
            fieldErrors.email = "User not registered";
            return res.render('forgotpassword', { fieldErrors, formData })
        }

        //delete otp records
        await Otp.deleteMany({ email, purpose: "forgotpassword" })
        //otp generate
        const otpcode = createOtpcode();
        const expiresAt = new Date(Date.now() + 3 * 60 * 1000)

        await Otp.create({ email, otpcode, purpose: "forgotpassword", expiresAt })
        //send dOTP via email
        await sendOtp(email, otpcode)
        console.log("redirecting to verify otp")
        res.redirect('/verifyotp')



    } catch (error) {
        console.log(error)

        res.status(400).send("error")
    }

}

