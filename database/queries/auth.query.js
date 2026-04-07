const { query } = require("../../utils/connection/connections");


 // Get user by email

const getUserByEmail = async (email) => {
  const sql = `
    SELECT 
      user_id,
      name,
      email,
      password_hash,
      created_at
    FROM users
    WHERE email = ?
    LIMIT 1
  `;

  const [user] = await query(sql, [email]);
  return user || null;
};


 // Get user by ID

const getUserById = async (id) => {
  try {
    const sql = `
      SELECT 
        user_id,
        name,
        email,
        password_hash,
        created_at
      FROM users
      WHERE user_id = ?
      LIMIT 1
    `;

    const [user] = await query(sql, [id]);
    return user || null;
  } catch (error) {
    console.error("Get User By ID Query Error:", error);
    throw error;
  }
};


 //Update user password

const updateUserPassword = async (email, newPasswordHash) => {
  const sql = `
    UPDATE users
    SET password_hash = ?
    WHERE email = ?
  `;

  const result = await query(sql, [newPasswordHash, email]);
  return result.affectedRows > 0;
};

module.exports = {
  getUserByEmail,
  getUserById,
  updateUserPassword,
};
