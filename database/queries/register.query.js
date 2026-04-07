const { query } = require("../../utils/connection/connections");

// Single query module for registration
// Supports inserting a user or lawyer documents
const register = async (data) => {
  // Case 1: Insert a user
  if (data.email) {
    const sql = `
      INSERT INTO users
      (email, password_hash, name)
      VALUES (?, ?, ?)
    `;
    const params = [
      data.email,
      data.password_hash,
      data.name,
    ];

    const result = await query(sql, params);
    // return the newly inserted user
    const [user] = await query("SELECT * FROM users WHERE user_id = ?", [
      result.insertId,
    ]);
    return user;
  }

};

module.exports = { register };
