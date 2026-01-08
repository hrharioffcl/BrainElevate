const createUploader = require("../utils/createUploader");
const fileTypes = require("../config/fileTypes");
const { videoStorage } = require("../config/s3Storage");

module.exports = createUploader({
  storage: videoStorage,
  allowedFormats: fileTypes.video,
  maxSize: 1024 * 1024 * 500, // 500 MB
});
