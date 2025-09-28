const jwt = require("jsonwebtoken")
const User = require("../models/userSchema");
const verifytoken = async (req, res, next) => {
    
    const token = req.cookies.jwt
    let fieldErrors = {}
    if (!token) {
        fieldErrors.email = "User not registered";

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

            fieldErrors.email = "User not registered";
            return res.render('login', { fieldErrors, formData: null })
        }
        req.user = user;
        console.log("running the authentication middleware")
        next()
    } catch (error) {
        console.log(error)
        return res.render('login', { fieldErrors: "field error", formData: null })
    }

}

module.exports = { verifytoken };