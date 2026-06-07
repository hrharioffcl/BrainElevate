
const Admin = require("../models/adminschema")
const validator = require("validator");
const bcrypt = require('bcrypt')
exports.getProfile = async (req, res) => {

    const formData =
        req.session.profileFormData || {};

    delete req.session.profileFormData;

    res.render("admin-profile", {
        admin: req.admin,
        formData
    });
};
exports.updateProfile = async (req, res) => {

    try {

        const {
            contactNumber,
            gender,
            address
        } = req.body;
        req.session.profileFormData = req.body;
        if (!contactNumber || contactNumber.trim() === "") {
            req.flash(
                "error",
                "Contact number is required"
            );
            return res.redirect("/admin/profile");
        }

        if (!/^\d+$/.test(contactNumber)) {
            req.flash(
                "error",
                "Contact number must contain only digits"
            );
            return res.redirect("/admin/profile");
        }

        if (contactNumber.length !== 10) {
            req.flash(
                "error",
                "Contact number must be exactly 10 digits"
            );
            return res.redirect("/admin/profile");
        }

        if (!validator.isMobilePhone(contactNumber, "en-IN")) {
            req.flash(
                "error",
                "Please enter a valid Indian mobile number"
            );
            return res.redirect("/admin/profile");
        }
        if (!address || address.trim().length < 5) {
            req.flash(
                "error",
                "Address must contain at least 5 characters"
            );
            return res.redirect("/admin/profile");
        }
        const admin =
            await Admin.findById(
                req.admin._id
            );

        if (!admin) {

            req.flash(
                "error",
                "Admin not found"
            );

            return res.redirect(
                "/admin/profile"
            );
        }

        admin.contactNumber =
            contactNumber;

        admin.gender =
            gender;

        admin.address =
            address;
        admin.profileCompleted = true;
        await admin.save();

        req.flash(
            "success",
            "Profile updated successfully"
        );

        return res.redirect(
            "/admin/profile"
        );

    } catch (error) {

        console.log(error);

        if (error.name === "ValidationError") {

            const firstError =
                Object.values(error.errors)[0].message;

            req.flash(
                "error",
                firstError
            );

        } else if (error.code === 11000) {

            req.flash(
                "error",
                "Contact number already exists"
            );

        } else {

            req.flash(
                "error",
                "Failed to update profile"
            );
        }

        return res.redirect("/admin/profile");
    }
};




exports.postAdminUploadProfilePic = async (req, res) => {
    const adminid = req.admin._id;
    const admin = await Admin.findById(adminid);
    try {
        console.log(req.file)
        if (!admin) {
            req.flash(
                "error",
                "Admin not found"
            );

            return res.redirect(
                "/admin/profile"
            );
        }

        if (!req.file) {

            req.flash(
                "error",
                "Please select an image"
            );

            return res.redirect(
                "/admin/profile"
            );
        }
        const profilepicId = admin.profilePic?.public_id;
        if (profilepicId) {
            const result = await cloudinary.uploader.destroy(profilepicId);
            console.log("Delete result:", result);
        }


        const imageUrl = req.file.path || req.file.url;  // FIX HERE


        admin.profilePic.url = imageUrl;
        admin.profilePic.public_id = req.file.filename || req.file.public_id;

        console.log(imageUrl)
        console.log(admin.profilePic)
        await admin.save(); // important!
        req.flash("success", "Profile picture updated!");
        return res.redirect(`/admin/profile`);

    } catch (err) {
        console.log("Upload Error:", err);
        req.flash("error", "Upload failed");
        return res.redirect(`/admin/profile`);
    }
};



exports.getChangePassword = (req, res) => {

    res.render(
        "admin-change-password",
        {
            admin: req.admin
        }
    );

};

exports.postChangePassword = async (
    req,
    res
) => {

    try {

        const {
            currentPassword,
            newPassword,
            confirmPassword
        } = req.body;

        if (
            !currentPassword ||
            !currentPassword.trim()
        ) {
            req.flash(
                "error",
                "Current password is required"
            );

            return res.redirect(
                "/admin/change-password"
            );
        }

        if (
            !newPassword ||
            !newPassword.trim()
        ) {
            req.flash(
                "error",
                "New password is required"
            );

            return res.redirect(
                "/admin/change-password"
            );
        }

        if (
            !confirmPassword ||
            !confirmPassword.trim()
        ) {
            req.flash(
                "error",
                "Confirm password is required"
            );

            return res.redirect(
                "/admin/change-password"
            );
        }

        const admin =
            await Admin.findById(
                req.admin._id
            );

        if (!admin) {

            req.flash(
                "error",
                "Admin not found"
            );

            return res.redirect(
                "/admin/change-password"
            );
        }

        const isMatch =
            await bcrypt.compare(
                currentPassword,
                admin.password
            );

        if (!isMatch) {

            req.flash(
                "error",
                "Current password is incorrect"
            );

            return res.redirect(
                "/admin/change-password"
            );
        }

        if (
            newPassword !==
            confirmPassword
        ) {

            req.flash(
                "error",
                "Passwords do not match"
            );

            return res.redirect(
                "/admin/change-password"
            );
        }

        if (
            !validator.isStrongPassword(
                newPassword
            )
        ) {

            req.flash(
                "error",
                "Password must contain uppercase, lowercase, number and special character"
            );

            return res.redirect(
                "/admin/change-password"
            );
        }

        if (
            currentPassword ===
            newPassword
        ) {

            req.flash(
                "error",
                "New password must be different from current password"
            );

            return res.redirect(
                "/admin/change-password"
            );
        }
        const isFirstLogin = admin.mustChangePassword;

        admin.password = newPassword;
        admin.passwordChangedAt = new Date();
        admin.mustChangePassword = false;
        admin.mustChangePassword = false;

        await admin.save();



        console.log(
            "After save:",
            admin.mustChangePassword
        );

       req.flash(
    "success",
    "Password changed successfully"
);

if (admin.role === "super_admin") {
    return res.redirect(
        "/admin/superadmindashboard"
    );
}

// First login → go to profile completion
if (isFirstLogin) {

    return res.redirect(
        "/admin/profile"
    );

}

// Normal password change later
if (admin.role === "contributor") {

    return res.redirect(
        "/admin/contributor/contributorDashBoard"
    );

}

if (admin.role === "manager") {

    return res.redirect(
        "/admin/managerdashboard"
    );

}

return res.redirect(
    "/admin/profile"
);
    } catch (error) {

        console.log(error);

        req.flash(
            "error",
            "Failed to change password"
        );

        return res.redirect(
            "/admin/change-password"
        );
    }
};