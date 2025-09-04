const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/userSchema");
const { generateRandomPassword } = require("../utils/randompassword")
const { createrefferalcode } = require('../utils/refferalcodegenerator')

// Serialize user for session (required by passport)
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Google OAuth strategy

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
        passReqToCallback: true,   // ✅ important!

}, async (req,accessToken, refreshToken, profile, done) => {
    try {
        const randompassword = generateRandomPassword()
        const email = profile.emails[0].value;
        let user = await User.findOne({ email });
        if (user) {
            
            // Update user info if necessary
            user.fullName = profile.displayName || user.fullName;
            user.profilepic = profile.photos[0]?.value || user.profilepic;
            user.lastLogin = new Date();
            await user.save();
        } else {
            let referredBy = null;
            if (req.session.referral) {
                const referrer = await User.findOne({ referralCode: req.session.referral });
                if (referrer) {
                    referredBy = referrer._id;
                }
                req.session.referral = null; // clear after use
            }
            // Create new user
            user = await User.create({
                fullName: profile.displayName,
                email: email,
                password: randompassword,
                profilepic: profile.photos[0]?.value,
                isVerified: true,
                lastLogin: new Date(),
                referralCode: await createrefferalcode(),
                 referredBy: referredBy,
            });
        }

        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
}));
