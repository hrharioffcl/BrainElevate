exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {

        console.log("route hit");

        if (!req.admin) {
            return res.redirect("/admin/login");
        }

        if (!roles.includes(req.admin.role)) {

            req.flash(
                "error",
                "You do not have permission to access this page"
            );

            if (req.admin.role === "contributor") {
                return res.redirect("/admin/contributor/contributorDashBoard");
            }

            if (req.admin.role === "admin") {
                return res.redirect("/admin/managerdashboard");
            }

            return res.redirect("/admin/superadmindashboard");
        }

        console.log("calling next()");
        next();
    };
};