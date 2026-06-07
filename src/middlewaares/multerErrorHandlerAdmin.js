const multer = require("multer");


//error handler for creating course
function multerErrorHandlerCreateCourse(err, req, res, next) {
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

    const redirectTo = req.session.createCourseReturn
    console.log("redirectto:", redirectTo)
    delete req.session.createCourseReturn
    return res.redirect(redirectTo);
  }

  next(err);
}

//error handler for updating course

function multerErrorHandlerUpdateCourse(err, req, res, next) {
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

    const redirectTo = req.session.updateCourseReturn
    console.log("redirectto:", redirectTo)
    delete req.session.updateCourseReturn
    return res.redirect(redirectTo);
  }

  next(err);
}


//error handler for creating Chapter

function multerErrorHandlerCreateChapter(err, req, res, next) {
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

    const redirectTo = req.session.createChapterReturn
    console.log("redirectto:", redirectTo)
    delete req.session.createChapterReturn
    return res.redirect(redirectTo);
  }

  next(err);
}



//error handler for Updating Chapter

function multerErrorHandlerUpdateChapter(err, req, res, next) {
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

    const redirectTo = req.session.updateChapterReturn
    console.log("redirectto:", redirectTo)
    delete req.session.updateChapterReturn
    return res.redirect(redirectTo);
  }

  next(err);
}



function multerErrorHandlerUpdateAdminProfilePic(err, req, res, next) {
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

    const redirectTo =  req.session.updateProfilePicAdmin 
    console.log("redirectto:", redirectTo)
    delete  req.session.updateProfilePicAdmin 
    return res.redirect(redirectTo);
  }

  next(err);
}



module.exports = {
  multerErrorHandlerCreateCourse, multerErrorHandlerUpdateCourse,
  multerErrorHandlerCreateChapter, multerErrorHandlerUpdateChapter,multerErrorHandlerUpdateAdminProfilePic
}
