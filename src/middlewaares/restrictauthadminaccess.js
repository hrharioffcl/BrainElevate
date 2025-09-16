const jwt = require('jsonwebtoken')
const Admin = require('../models/adminschema')


const restrictauthadminaccess = async (req, res, next) => {
    const token = req.cookies.admin_jwt;

    if (!token) {
        // No token → allow access to login/signup
        return next();
    }
            console.log("Token here:", req.cookies.jwt);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
console.log(decoded.role)
        // ✅ Redirect based on role inside token
        const roleRedirects = {
            super_admin: '/admin/superadmindashboard',
            editor: '',
            moderator: ''
        };

        const redirectPath = roleRedirects[decoded.role] || '/admin/login';
        return res.redirect(redirectPath);

    } catch (err) {
        console.log("JWT verification failed:", err.message);
        // Invalid token → allow access
        return next();
    }
};

module.exports = {restrictauthadminaccess };