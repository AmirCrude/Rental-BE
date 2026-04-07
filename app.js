// External Modules
const express = require("express");
const cors = require("cors");
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

app.use(cors({ origin: CLIENT_URL, credentials: true }));


// JSON parser
app.use(express.json());


// Test database connection
testAllConnections();


// Routes
app.use("/api", mainRouter);

// Server listener
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
