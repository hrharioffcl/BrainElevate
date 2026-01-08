const multerS3 = require("multer-s3");
const s3 = require("./s3");

const videoStorage = multerS3({
  s3,
  bucket: process.env.AWS_BUCKET_NAME,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: (req, file, cb) => {
    const ext = file.originalname.split(".").pop();
    cb(null, `videos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`);
  },
});

module.exports = { videoStorage };
