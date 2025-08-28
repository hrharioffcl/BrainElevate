const express = require("express");
const router = express.Router();
const passport = require("passport");
const generateusertoken = require("../utils/usertoken");
console.log("1step done")
// Redirect user to Google for authentication
router.get("/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
    
);
console.log("previous step done")
// Google callback URL
router.get("/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {
        // Generate JWT after successful login
        const token = generateusertoken(req.user._id);
        res.cookie('jwt', token, {
            httpOnly: true,
            maxAge: 7 * 60 * 60 * 1000 // 1 hour
        });
        res.redirect("/home");
    }
);

module.exports = router;
