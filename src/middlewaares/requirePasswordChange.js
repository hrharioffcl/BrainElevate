const requirePasswordChange = (
    req,
    res,
    next
) => {

    console.log(
        "PASSWORD MIDDLEWARE",
        req.path,
        req.admin?.mustChangePassword
    );

    if (
        !req.admin ||
        req.admin.role === "super_admin"
    ) {
        return next();
    }

    const allowedRoutes = [
        "/change-password",
        "/logout"
    ];

    if (
        req.admin.mustChangePassword &&
        !allowedRoutes.includes(req.path)
    ) {

        console.log(
            "REDIRECTING TO CHANGE PASSWORD"
        );

        return res.redirect(
            "/admin/change-password"
        );
    }

    next();
};
module.exports = {
    requirePasswordChange
};