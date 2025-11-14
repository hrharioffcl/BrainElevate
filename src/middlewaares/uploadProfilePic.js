const multer = require("multer");
const { profileImageStorage } = require("../config/cloudinary");

const uploadProfilePic = multer({ storage: profileImageStorage });

module.exports = uploadProfilePic;
