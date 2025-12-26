const createUploader = require("../utils/createUploader");
const fileTypes = require("../config/fileTypes");
const { courseThumbnailStorage } = require("../config/cloudinary");

module.exports = createUploader({
  storage: courseThumbnailStorage,
  allowedFormats: fileTypes.image,
  maxSize: 3 * 1024 * 1024 
});
