import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },

  fileFilter(req, file, cb) {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/png",
      "image/jpeg",
      "image/jpg", // some browsers/OSes send this non-standard mimetype for JPEGs
      "image/webp",
      "image/heic",
      "image/heif", // common for photos taken directly on iPhone
    ];

    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type "${file.mimetype}". Allowed: PDF, Word, PNG, JPG, WEBP, HEIC.`));
    }
  },
});
