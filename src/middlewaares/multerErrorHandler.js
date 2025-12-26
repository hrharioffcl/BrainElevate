const multer = require("multer");

function multerErrorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case "LIMIT_INVALID_FORMAT":
        req.flash("error", `Invalid file format: ${err.format}`);
        break;

      case "LIMIT_FILE_SIZE":
        req.flash("error", "File is too large.");
        break;

      case "LIMIT_UNEXPECTED_FILE":
        req.flash("error", "Unexpected file uploaded.");
        break;

      default:
        req.flash("error", "Upload failed. Please try again.");
    }

    const redirectTo = req.session.returnTo
    console.log("redirectto:",redirectTo)
    delete req.session.returnTo
    return res.redirect(redirectTo);
  }

  next(err);
}

module.exports = multerErrorHandler;
