const multer = require("multer");

function createUploader({ storage, allowedFormats, maxSize }) {
  return multer({
    storage,
    limits: { fileSize: maxSize },

    fileFilter: (req, file, cb) => {
      if (!allowedFormats.includes(file.mimetype)) {
        const err = new multer.MulterError("LIMIT_INVALID_FORMAT");
        err.format = file.mimetype;
        return cb(err, false);
      }
      cb(null, true);
    }
  });
}

module.exports = createUploader;
