// Unified Connection Tester Module

// Imports
const pool = require("../../configs/database.config");
const { transporter } = require("../../configs/email.config");
const cloudinary = require("../../configs/cloudinary.config");

// Database helper
// Execute SQL query with optional parameters
const query = async (sql, params = []) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [results] = await connection.execute(sql, params);
    return results;
  } catch (err) {
    console.error("Database query error:", err.message);
    throw err;
  } finally {
    if (connection) connection.release();
  }
};

// Test database connection
const testDBConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Database connected successfully");
    connection.release();
  } catch (err) {
    console.error("Database connection failed:", err.message);
  }
};

// Email helper
// Test email server connection
const testEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log("Email server connected successfully");
  } catch (err) {
    console.error("Email connection failed:", err.message);
  }
};

// Cloudinary helper
// Test Cloudinary connection
const testCloudinaryConnection = async () => {
  try {
    const response = await cloudinary.api.ping();
    console.log("Cloudinary connection successful", response);
  } catch (err) {
    console.error("Cloudinary connection failed:", err.message);
  }
};

// Run all connection tests
const testAllConnections = async () => {
  await testDBConnection();
  await testEmailConnection();
  await testCloudinaryConnection();
};

// Exports
module.exports = {
  query,
  testAllConnections,
};
