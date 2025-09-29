const jwt = require('jsonwebtoken');
const User = require("../models/userSchema");

const restrictUnauthenticatedRoutes = async (req, res, next) => {
    const token = req.cookies.jwt;

    if (!token) {
        // No token → allow access to login/signup
        return next();
    }
            console.log("Token here:", req.cookies.jwt);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select("_id");

        if (!user) {

            // Token valid but user not found in DB → allow access
            return next();
        }

        // If user exists → redirect authenticated users
        return res.redirect('/home');
    } catch (err) {
        console.log("JWT verification failed:", err.message);
        // Invalid token → allow access
        return next();
    }
};

module.exports = { restrictUnauthenticatedRoutes };
