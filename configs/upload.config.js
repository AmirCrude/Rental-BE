const path = require("path");
require("dotenv").config();

const UPLOAD_DIR = path.join(__dirname, "..", process.env.UPLOAD_PATH || "uploads");
const PROPERTIES_DIR = path.join(UPLOAD_DIR, "properties");
const THUMBNAILS_DIR = path.join(UPLOAD_DIR, "thumbnails");

// Allowed image types
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5MB

module.exports = {
  UPLOAD_DIR,
  PROPERTIES_DIR,
  THUMBNAILS_DIR,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE,
};