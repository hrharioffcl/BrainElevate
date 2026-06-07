const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


// Storage for profile images for users
const profileImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "BrainElevate/ProfilePictures",
    allowed_formats: ["jpg", "png", "jpeg"],
    transformation: [{ width: 500, height: 500, crop: "fill" }]
  },
});

//profile image storrage for admins
const adminProfileImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "BrainElevate/adminProfilePictures",
    allowed_formats: ["jpg", "png", "jpeg"],
    transformation: [{ width: 500, height: 500, crop: "fill" }]
  },
});
//course thumbail storage
const courseThumbnailStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "BrainElevate/courseThumbnail",
    transformation: [
      { width: 800, height: 450, crop: "fill" } // 16:9 for courses
    ]

  }
})





module.exports = { cloudinary, profileImageStorage, courseThumbnailStorage ,adminProfileImageStorage};
