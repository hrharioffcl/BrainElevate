const fileTypes = {
  image: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ],
  video: [
    "video/mp4",
    "video/quicktime", // .mov
    "video/x-matroska", // .mkv
  ],
  document: [
    "application/pdf",
    "application/msword",                   // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  ],
  audio: [
    "audio/mpeg",   // .mp3
    "audio/mp3",
    "audio/wav",
    "audio/ogg",
  ],
};

/* Common8 CommonJS export */
module.exports = fileTypes;