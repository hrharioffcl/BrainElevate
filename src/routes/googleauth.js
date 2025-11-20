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
router.get("/auth/google/callback", (req, res, next) => {
    passport.authenticate("google", (err, user, info) => {

        if (err) {
            return res.redirect("/login?error=server");
        }

        if (!user) {
            const msg = info?.message;

            if (msg === "Account blocked")
                return res.redirect("/login?error=blocked");

            if (msg === "Account not found")
                return res.redirect("/login?error=notfound");

            if (msg === "Please sign in manually")
                return res.redirect("/login?error=manual");

            return res.redirect("/login?error=unknown");
        }

        // SUCCESSFUL LOGIN
        const token = generateusertoken(user._id);

        res.cookie("jwt", token, {
            httpOnly: true,
            maxAge: 7 * 60 * 60 * 1000 // 7 hours
        });

        return res.redirect("/home");

    })(req, res, next);
});


module.exports = router;
