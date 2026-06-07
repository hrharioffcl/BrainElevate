const createUploader = require("../utils/createUploader");
const fileTypes = require("../config/fileTypes");
const {adminProfileImageStorage}=require("../config/cloudinary")

module.exports = createUploader({
  storage: adminProfileImageStorage,
  allowedFormats: fileTypes.image,
  maxSize: 1 * 1024 * 1024, // 1 MB
});

