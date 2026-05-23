// External Modules
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// Internal Modules
const mainRouter = require("./routes/router");
const { testAllConnections } = require("./utils/connection/connections");

// App Initialization
const app = express();
const PORT = process.env.PORT || 5000;

// Allowed origin from environment
const CLIENT_URL = process.env.CLIENT_URL;

// CORS configuration
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// JSON parser
app.use(express.json());

// Create uploads directories if they don't exist
const uploadsDir = path.join(__dirname, "uploads");
const propertiesDir = path.join(uploadsDir, "properties");
const thumbnailsDir = path.join(uploadsDir, "thumbnails");

[uploadsDir, propertiesDir, thumbnailsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Test database connection
testAllConnections();

// Routes
app.use("/api", mainRouter);

// Server listener
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Static files served from: ${path.join(__dirname, "uploads")}`);
});