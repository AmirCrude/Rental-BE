const multer = require("multer");

// Use memory storage to keep uploaded files as buffers
const storage = multer.memoryStorage();

// Allowed image MIME types for validation
const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];

// --- Multer Configuration ---
const uploadConfig = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Max 5MB
  },
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, and GIF image files are allowed."), false);
    }
  },
});

// --- Single Image Middleware ---
const uploadSingleImage = uploadConfig.single("image");

function uploadSingleImageMiddleware(req, res, next) {
  uploadSingleImage(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? "The file must be less than 5MB."
          : "An unexpected file was uploaded.";
      return res.status(400).json({ success: false, message });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}

// --- Multiple Images Middleware ---
const uploadMultipleImages = uploadConfig.array("images", 10);

// --- Optional Update Images Middleware ---
// Only validate if files exist in request
function updateImagesValidatorMiddleware(req, res, next) {
  // If no files sent, skip multer validation
  if (
    !req.headers["content-type"] ||
    !req.headers["content-type"].includes("multipart/form-data")
  ) {
    req.files = [];

    return next();
  }
  console.log(req.files);
  const updateImagesValidator = uploadConfig.array("images", 10);

  updateImagesValidator(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      let message;
      switch (err.code) {
        case "LIMIT_FILE_SIZE":
          message = "Each file must be less than 5MB.";
          break;
        case "LIMIT_FILE_COUNT":
          message = "You can upload a maximum of 10 images.";
          break;
        default:
          message = "An unexpected file was uploaded.";
      }
      return res.status(400).json({ success: false, message });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    req.files = req.files || [];
    next();
  });
}

module.exports = {
  uploadSingleImageMiddleware,
  updateImagesValidatorMiddleware,
};
