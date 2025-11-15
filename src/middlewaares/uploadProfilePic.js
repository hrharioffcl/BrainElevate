const createUploader = require("../utils/createUploader");
const fileTypes = require("../config/fileTypes");
const { profileImageStorage } = require("../config/cloudinary");

module.exports = createUploader({
  storage: profileImageStorage,
  allowedFormats: fileTypes.image,
  maxSize: 1 * 1024 * 1024, // 1 MB
});
