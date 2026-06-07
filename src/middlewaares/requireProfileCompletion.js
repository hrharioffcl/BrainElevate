const requireProfileCompletion = (
    req,
    res,
    next
) => {

    if (
        !req.admin ||
        req.admin.role === "super_admin"
    ) {
        return next();
    }

    const allowedRoutes = [
        "/profile",
        "/profile/update",
        "/profile/upload-photo",
        "/logout"
    ];

    if (
        !req.admin.profileCompleted &&
        !allowedRoutes.includes(req.path)
    ) {

        return res.redirect(
            "/admin/profile"
        );
    }

    next();
};

module.exports = {
    requireProfileCompletion
};