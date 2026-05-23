const multer = require("multer");
const { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } = require("../../configs/upload.config");

const storage = multer.memoryStorage();

const uploadConfig = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, and WebP image files are allowed."), false);
    }
  },
});

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

const uploadArray = uploadConfig.array("images", 10);

function uploadArrayImagesMiddleware(req, res, next) {
  uploadArray(req, res, (err) => {
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

function updateImagesValidatorMiddleware(req, res, next) {
  if (
    !req.headers["content-type"] ||
    !req.headers["content-type"].includes("multipart/form-data")
  ) {
    req.files = [];
    return next();
  }

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
  uploadArrayImagesMiddleware,
  updateImagesValidatorMiddleware,
};