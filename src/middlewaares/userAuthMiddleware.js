const jwt = require("jsonwebtoken")
const User = require("../models/userSchema");
const verifytoken = async (req, res, next) => {
    
    const token = req.cookies.jwt
    let fieldErrors = {}
    if (!token) {
        fieldErrors.email = "Error logging in"
        return res.render('login', { fieldErrors, formData: null })
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.id).select("-password");

     
        if (!user || user.isDeleted) {
            res.clearCookie("jwt", {

                httpOnly: true,
                secure: process.env.NODE_ENV === "production", // only secure in prod
                sameSite: "strict",
            })

            fieldErrors.email = "User Not Found";
            return res.render('login', { fieldErrors, formData: null })
        }

           if(user.isBlocked){
            res.clearCookie("jwt", {

                httpOnly: true,
                secure: process.env.NODE_ENV === "production", // only secure in prod
                sameSite: "strict",
            })

            fieldErrors.email = "Your account has been blocked please contact Helpline";
            return res.render('login', { fieldErrors, formData: null })
        }
      
        req.user = user;
res.locals.user = user; // 👈 add this line
next();
        console.log("running the authentication middleware")

    } catch (error) {
        console.log(error)
        return res.render('login', { fieldErrors: "field error", formData: null })
    }

}

module.exports = { verifytoken };