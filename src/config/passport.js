const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/userSchema");
const { generateRandomPassword } = require("../utils/randompassword");
const { createrefferalcode } = require("../utils/refferalcodegenerator");

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

passport.use(new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
        passReqToCallback: true,
        userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
    },

    async (req, accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails?.[0]?.value;
            const randompassword = generateRandomPassword();
            
            let user = await User.findOne({ email });

            if (user) {
                
                if (!user.googleUser)
                    return done(null, false, { message: "Please sign in manually" });
                
                if (user.isBlocked)
                    return done(null, false, { message: "Account blocked" });

                if (user.isDeleted)
                    return done(null, false, { message: "Account not found" });


                user.lastLogin = new Date();
                await user.save();
            } else {
                let referredBy = null;

                if (req.session.referral) {
                    const referrer = await User.findOne({ referralCode: req.session.referral });
                    if (referrer) referredBy = referrer._id;
                    req.session.referral = null;
                }

                user = await User.create({
                    fullName: profile.displayName,
                    email,
                    password: randompassword,
                    profilepic: profile.photos?.[0]?.value,
                    isVerified: true,
                    lastLogin: new Date(),
                    referralCode: await createrefferalcode(),
                    referredBy,
                    googleUser: true
                });
            }

            return done(null, user);

        } catch (err) {
            return done(err, null);
        }
    }
));
