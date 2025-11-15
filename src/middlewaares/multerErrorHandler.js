const multer = require("multer");

function multerErrorHandler(err, req, res, next) {
    const user = res.locals.user;
  if (err instanceof multer.MulterError) {

    switch (err.code) {
      case "LIMIT_INVALID_FORMAT":
        req.flash("error", `Invalid file format: ${err.format}`);
        return res.redirect(`/profile/${user._id}/editProfile`);

      case "LIMIT_FILE_SIZE":
        req.flash("error", "File is too large.");
   return res.redirect(`/profile/${user._id}/editProfile`);

      case "LIMIT_UNEXPECTED_FILE":
        req.flash("error", "Unexpected file uploaded.");
   return res.redirect(`/profile/${user._id}/editProfile`);

      default:
        req.flash("error", "Upload failed. Please try again.");
   return res.redirect(`/profile/${user._id}/editProfile`);
    }
  }

  next(err);
}

module.exports = multerErrorHandler;
