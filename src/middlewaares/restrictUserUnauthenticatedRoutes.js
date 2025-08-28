
const jwt = require('jsonwebtoken');

const restrictUnauthenticatedRoutes = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        try {
            jwt.verify(token, process.env.JWT_SECRET);
            return res.redirect('/home'); // Redirect authenticated users away
        } catch (err) {
            // Invalid token, allow access
        }
    }
    next();
};

module.exports = { restrictUnauthenticatedRoutes }