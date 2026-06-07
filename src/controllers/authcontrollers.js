const User = require("../models/userSchema")
const Admin = require("../models/adminschema")
const { createrefferalcode } = require('../utils/refferalcodegenerator')
const Otp = require("../models/otp")
const sendOtp = require("../utils/sendotp")
const generateusertoken = require("../utils/usertoken")
const generateadmintoken = require("../utils/admintoken")
const bcrypt = require("bcrypt")

// create otp logic
const createOtpcode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// SIGNUP ROUTE
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

    // confirm existing user
    const existinguser = await User.findOne({ email });
    if (existinguser) fieldErrors.email = "*User already exists, try logging in!";

    // confirm password check
    if (password !== confirmPassword) fieldErrors.confirmPassword = "*Passwords do not match";
    // terms and condition check
    if (terms !== "true") fieldErrors.terms = "*Please accept Terms & Conditions";

    try {
        const tempuser = new User({ fullName, email, password });
        await tempuser.validate();
        
        if (Object.keys(fieldErrors).length > 0) {
            return res.render('signup', { fieldErrors, formData });
        }
        
        await Otp.deleteMany({ email, purpose: "signup" });
        
        const otpcode = createOtpcode();
        const expiresAt = new Date(Date.now() + 1 * 60 * 1000); // 1 minute

        req.session.otpExpiresAt = expiresAt.getTime();
        req.session.signupData = { fullName, email, password, purpose: "signup" };

        await Otp.create({ email, otpcode, purpose: "signup", expiresAt });
        await sendOtp(email, otpcode);

        // CRITICAL: Explicitly save session before redirecting to prevent race condition
        req.session.save((err) => {
            if (err) {
                console.error("Session save error:", err);
            }
            console.log("redirecting to verify");
            return res.redirect('/verify-otp');
        });
    } catch (error) {
        console.log(error);
        if (error.name === "ValidationError") {
            for (let field in error.errors) {
                fieldErrors[field] = error.errors[field].message;
            }
            if (terms !== "true") {
                fieldErrors.terms = "*Please accept Terms & Conditions";
            }
            return res.render('signup', { fieldErrors, formData });
        }
        return res.status(500).send("An unexpected error occurred during signup.");
    }
}

exports.getVerifyOtp = (req, res) => {

    console.log("signupData:", req.session.signupData);
    console.log("otpExpiresAt:", req.session.otpExpiresAt);

    const remainingTime = Math.max(
        0,
        (req.session.otpExpiresAt || 0) - Date.now()
    );

    console.log("remainingTime:", remainingTime);

    res.render("otp", {
        errorMessage: null,
        remainingTime
    });
}
// OTP verification
exports.verifyOtp = async (req, res) => {
    try {
        const { otp1, otp2, otp3, otp4, otp5, otp6 } = req.body;
        const otp = otp1 + otp2 + otp3 + otp4 + otp5 + otp6;
        
        // Safe check for session existence
        const sessionData = req.session.signupData || req.session.forgotPassword || req.session.changeUserPassword;
        if (!sessionData) {
            return res.render("otp", {
                errorMessage: "❌ Session expired or invalid request. Please start over.",
                remainingTime: 0
            });
        }
        
        const { purpose } = sessionData;
        const email = sessionData.email;
        
        // Find latest OTP
        const otpRecord = await Otp.findOne({ email, purpose }).sort({ createdAt: -1 });
        
        // Compare OTP
       if (
    !otpRecord ||
    otpRecord.otpcode !== otp ||
    otpRecord.expiresAt < Date.now()
) {

    const remainingTime = Math.max(
        0,
        (req.session.otpExpiresAt || 0) - Date.now()
    );

    return res.render("otp", {
        errorMessage: "❌ Invalid or expired OTP",
        remainingTime
    });
}
        
        // Signup OTP verification
        if (purpose === "signup") {
            const { fullName, email, password } = req.session.signupData;
            
            let referredBy = null;
            if (req.session.referral) {
                const referrer = await User.findOne({ referralCode: req.session.referral });
                if (referrer) {
                    referredBy = referrer._id;
                }
                req.session.referral = null; // clear after use
            }
            
            const user = await User.create({ 
                fullName, 
                email, 
                password, 
                isVerified: true, 
                referralCode: await createrefferalcode(), 
                referredBy, 
                googleUser: false 
            });
            
            await Otp.deleteOne({ _id: otpRecord._id });
            req.session.signupData = null;
            req.session.otpExpiresAt = null;

            const token = generateusertoken(user._id);
            res.cookie('jwt', token, {
                httpOnly: true,
                maxAge: 1 * 60 * 60 * 1000 // 1 hour
            });

            return res.redirect('/home');
        }
        // Forgot password OTP verification
        else if (purpose === "adminforgotpassword") {
            await Otp.deleteOne({ _id: otpRecord._id });
            req.session.otpExpiresAt = null;
            return res.redirect('/admin/reset-password');
        } else if (purpose === "forgotpassword") {
            await Otp.deleteOne({ _id: otpRecord._id });
            req.session.otpExpiresAt = null;
            return res.redirect('/reset-password');
        } else if (purpose === 'changeUserPassword') {
            await Otp.deleteOne({ _id: otpRecord._id });
            req.session.otpExpiresAt = null;
            req.session.forgotPassword = req.session.changeUserPassword;
            req.session.changeUserPassword = null;
            return res.redirect('/reset-password');
        }
    }
    catch (error) {
        console.error(error);
        return res.status(500).send("Some error occurred during verification.");
    }
}

// Resend OTP
exports.resendotp = async (req, res) => {
    try {

        const sessionData =
            req.session.signupData ||
            req.session.forgotPassword ||
            req.session.changeUserPassword;

        if (!sessionData) {
            return res.status(400).json({
                success: false,
                message: "Session expired"
            });
        }

        const OTP_DURATION = 60 * 1000;

        const { email, purpose } = sessionData;

        await Otp.deleteMany({ email, purpose });

        const otpcode = createOtpcode();

        const expiresAt = new Date(
            Date.now() + OTP_DURATION
        );

        req.session.otpExpiresAt = expiresAt.getTime();

        await Otp.create({
            otpcode,
            email,
            purpose,
            expiresAt
        });

        await sendOtp(email, otpcode);

        return res.json({
            success: true,
            remainingTime: OTP_DURATION
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Failed to resend OTP"
        });
    }
};
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
          req.session.otpExpiresAt = expiresAt.getTime();

req.session.forgotPassword = {
   email,
   purpose: "adminforgotpassword"
};

req.session.save(() => {
   res.redirect('/verify-otp');
});
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
        if (purpose === "forgotpassword" || purpose === "changeUserPassword") {
            const existinguser = await User.findOne({ email });
            const isMatch = await bcrypt.compare(password, existinguser.password)
            if (isMatch) {
                fieldErrors.password = "cannot use old password";
                return res.render('resetpassword', { fieldErrors })
            }
            // set new password
            existinguser.password = password
            existinguser.googleUser = false
            await existinguser.save();

            req.session.forgotPassword = null;

            req.flash('success', "Password Changed Successfully")
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
        else if (isadmin.role === "manager") {
            console.log("manager daashboard coming soon")
            res.redirect('/admin/manager/managerDashBoard')
        }
        else if (isadmin.role === "contributor") {
             console.log(isadmin)
            console.log("coontributer daashboard coming soon")

            res.redirect('/admin/contributor/contributorDashBoard')
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

    const remainingTime = Math.max(
        0,
        (req.session.otpExpiresAt || 0) - Date.now()
    );

    res.render('otp', {
        errorMessage: null,
        remainingTime
    });
}
exports.getresetpassword = (req, res) => {
    // Only allow if OTP step was done
    if (!req.session.forgotPassword || req.session.forgotPassword.purpose !== "adminforgotpassword") {
        return res.redirect('/admin/forgot-password');
    }

    // Otherwise render page
    res.render('resetpassword', { fieldErrors: {} });
}

exports.userLogOut = async (req, res) => {
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