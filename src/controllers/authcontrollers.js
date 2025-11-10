const User = require("../models/userSchema")
const Admin = require("../models/adminschema")
const { createrefferalcode } = require('../utils/refferalcodegenerator')
const Otp = require("../models/otp")
const sendOtp = require("../utils/sendotp")
const generateusertoken = require("../utils/usertoken")
const generateadmintoken = require("../utils/admintoken")
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


        //adding fullname password and email to session
        req.session.signupData = { fullName, email, password, purpose: "signup" }

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
        //getting purpuse and email from session memmory
        const { purpose } = req.session.signupData || req.session.forgotPassword;
        const email = req.session.signupData?.email || req.session.forgotPassword?.email;
        //find otp in collection
        const otpRecord = await Otp.findOne({ email, purpose }).sort({ createdAt: -1 });
        //compare otp
        if (!otpRecord || otpRecord.otpcode !== otp || otpRecord.expiresAt < Date.now()) {
            return res.render("otp", {
                errorMessage: "❌ Invalid or expired OTP"
            });
        }
        //signup otp verification
        if (purpose === "signup") {
            const { fullName, email, password } = req.session.signupData;
            //check refferal code exist!!
            let referredBy = null;
            if (req.session.referral) {
                const referrer = await User.findOne({ referralCode: req.session.referral });
                if (referrer) {
                    referredBy = referrer._id;
                }
                req.session.referral = null; // clear after use
            }
            ///create user if otp verified
            const user = await User.create({ fullName, email, password, isVerified: true, referralCode: await createrefferalcode(), referredBy })
            await Otp.deleteOne({ _id: otpRecord._id })
            req.session.signupData = null

            //generate jwt
            const token = generateusertoken(user._id)
            res.cookie('jwt', token, {
                httpOnly: true,
                maxAge: 1 * 60 * 60 * 1000 // 1 hour
            });
            console.log("Token:", req.cookies.jwt);

            res.redirect('/home')


        }
        // forgot password otp verification
        else if (purpose === "adminforgotpassword") {
            await Otp.deleteOne({ _id: otpRecord._id })
            res.redirect('/admin/reset-password')
        } else if (purpose === "forgotpassword") {
            await Otp.deleteOne({ _id: otpRecord._id })
            res.redirect('/reset-password')
        }
    }
    catch (error) {
        console.error(error)
        res.status(500).send("some error occured")
    }

}

//resend otp
exports.resendotp = async function (req, res) {
    try {
        //getting purpuse and email from session memmory
        const { purpose } = req.session.signupData || req.session.forgotPassword;
        const email = req.session.signupData?.email || req.session.forgotPassword?.email;
        await Otp.deleteMany({ email, purpose });
        const otpcode = createOtpcode()
        const expiresAt = new Date(Date.now() + 3 * 60 * 1000)
        await Otp.create({ otpcode, email, purpose, expiresAt })
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

        if (existinguser.isDeleted === true) {
            fieldErrors.email = "Unauthorized Access";
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
        // If remember me is checked/notchecked 
        res.cookie('jwt', token, {
            httpOnly: true,
            maxAge: rememberMeChecked ? 7 * 24 * 60 * 60 * 1000 : 1 * 60 * 60 * 1000
        });
        console.log("Token:", req.cookies.jwt);

        res.redirect('/home');
    } catch (error) {
        console.log(error)

        return res.render('login', { fieldErrors, formData })

    }

}




//FORGOT PASSWORD
exports.forgotpassword = async (req, res) => {
    const { email, type } = req.body;
    console.log(type)
    const fieldErrors = {};
    const formData = {
        email: email || '',
    };
    try {
        if (type === "user") {
            const existinguser = await User.findOne({ email });
            if (!existinguser) {
                fieldErrors.email = "User not registered";
                return res.render('forgotpassword', { fieldErrors, formData, type: "user" })
            }
            if (existinguser.isDeleted === true) {
                fieldErrors.email = "Unauthorized Access";
                return res.render('login', { fieldErrors, formData, type: "user" })
            }

            //delete otp records
            await Otp.deleteMany({ email, purpose: "forgotpassword" })
            //otp generate
            const otpcode = createOtpcode();
            const expiresAt = new Date(Date.now() + 3 * 60 * 1000)

            await Otp.create({ email, otpcode, purpose: "forgotpassword", expiresAt })
            //send dOTP via email
            await sendOtp(email, otpcode)  
            req.session.forgotPassword = { email, purpose: "forgotpassword" }
            console.log("redirecting to verify otp")
            res.redirect('/verify-otp')
        }
        else if (type === "admin") {
            const isadmin = await Admin.findOne({ email });
            if (!isadmin) {
                fieldErrors.email = "Not allowed";
                return res.render('forgotpassword', { fieldErrors, formData, type: "admin" })
            }
            if (isadmin.isActive === false) {
                fieldErrors.email = "Unauthorized Access";
                return res.render('login', { fieldErrors, formData, type: "admin" })
            }
            //delete otp records
            await Otp.deleteMany({ email, purpose: "adminforgotpassword" })
            //otp generate
            const otpcode = createOtpcode();
            const expiresAt = new Date(Date.now() + 3 * 60 * 1000)

            await Otp.create({ email, otpcode, purpose: "adminforgotpassword", expiresAt })
            //send dOTP via email
            await sendOtp(email, otpcode)
            req.session.forgotPassword = { email, purpose: "adminforgotpassword" }
            console.log("redirecting to verify otp")
            res.redirect('/admin/verify-otp')
        }


    } catch (error) {
        console.log(error)

        res.status(400).send("error")
    }

}


//reset password
exports.resetpassword = async (req, res) => {
    const fieldErrors = {};
    if (!req.session.forgotPassword) {
        return res.redirect('/login');
       
    }
    const { email, purpose } = req.session.forgotPassword
    console.log(purpose)
    const { password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
        fieldErrors.confirmPassword = "*Passwords do not match";
        return res.render('resetpassword', { fieldErrors })
    }
    try {
        if (purpose === "forgotpassword") {
            const existinguser = await User.findOne({ email });
            const isMatch = await bcrypt.compare(password, existinguser.password)
            if (isMatch) {
                fieldErrors.password = "cannot use old password";
                return res.render('resetpassword', { fieldErrors })
            }
            // set new password
            existinguser.password = password
            await existinguser.save();

            req.session.forgotPassword = null;


            res.redirect('/login')
        } else if (purpose === "adminforgotpassword") {

            const isadmin = await Admin.findOne({ email });

            const isMatch = await bcrypt.compare(password, isadmin.password)
            if (isMatch) {
                fieldErrors.password = "cannot use old password";
                return res.render('resetpassword', { fieldErrors })
            }
            isadmin.password = password;
            await isadmin.save()

            req.session.forgotPassword = null;
            res.redirect('/admin/login')


        }

    } catch (error) {
        if (error.name === "ValidationError") {
            // Extract mongoose validation errors
            Object.keys(error.errors).forEach((key) => {
                fieldErrors[key] = error.errors[key].message;
            });
            return res.render("resetpassword", { fieldErrors });
        }

        console.log(error);
        res.status(500).send("Server error");
    }
}



exports.adminlogin = async (req, res) => {
    fieldErrors = {}
    const { email, password } = req.body;

    try {

        const isadmin = await Admin.findOne({ email });
        if (!isadmin) {
            fieldErrors.email = "Not allowed";
            return res.render('adminlogin', { fieldErrors })
        }
        if (isadmin.isActive === false) {
            fieldErrors.email = "Unauthorized Access";
            return res.render('login', { fieldErrors, formData, type: "admin" })
        }

        const isMatch = await bcrypt.compare(password, isadmin.password)
        if (!isMatch) {
            fieldErrors.password = "Invalid credentials";
            return res.render('adminlogin', { fieldErrors })
        }

        // generate JWT
        const token = generateadmintoken(isadmin.id, isadmin.role);
        // If remember me is checked/notchecked 
        res.cookie('admin_jwt', token, {
            httpOnly: true,
            maxAge: 1 * 24 * 60 * 60 * 1000
        });
        console.log("Token is :", token);

        if (isadmin.role === "super_admin") {
            res.redirect('/admin/superadmindashboard')
        }
        else if (isadmin.role === "admin") {
            console.log("manager daashboard coming soon")
            res.redirect('/admin/managerdashboard')
        }
        else if (isadmin.role === "contributer") {
                        console.log("coontributer daashboard coming soon")

         res.redirect('/admin/contributerdashboard')
        }

    } catch (error) {
        res.send("error")

    }


}

exports.adminlogout = async (req, res) => {
    //clearing jwt
    res.clearCookie("admin_jwt", {

        httpOnly: true,
        secure: process.env.NODE_ENV === "production", 
        sameSite: "strict",
    })

    if (req.session) {
        req.session.destroy(() => {
            res.redirect("/admin/login"); 
        });
    } else {
        res.redirect("/admin/login");
    }
}



exports.getadminlogin = (req, res) => {

    res.render("adminlogin", { fieldErrors: {} })
}

exports.getforgotpassword = (req, res) => {
    res.render('forgotpassword', { fieldErrors: {}, formData: {}, type: "admin" })
}

exports.getverifyotp = (req, res) => {
    res.render('otp', { errorMessage: null })
}

exports.getresetpassword = (req, res) => {
    // Only allow if OTP step was done
    if (!req.session.forgotPassword || req.session.forgotPassword.purpose !== "adminforgotpassword") {
        return res.redirect('/admin/forgot-password');
    }

    // Otherwise render page
    res.render('resetpassword', { fieldErrors: {} });
}

exports.userLogOut =async (req,res)=>{
    res.clearCookie("jwt", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", 
        sameSite: "strict",
    })
        if (req.session) {
        req.session.destroy(() => {
            res.redirect("/login"); 
        });
    } else {
        res.redirect("/login");
    }

}