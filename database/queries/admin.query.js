const { query } = require("../../utils/connection/connections");

// Users Table Queries

// Get user by email
const getUserByEmail = async (email) => {
  const sql = `
    SELECT 
      user_id,
      first_name,
      last_name,
      email,
      phone_number,
      password_hash,
      role,
      is_verified,
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
  const sql = `
    SELECT 
      user_id,
      first_name,
      last_name,
      email,
      phone_number,
      password_hash,
      role,
      is_verified,
      created_at
    FROM users
    WHERE user_id = ?
    LIMIT 1
  `;
  const [user] = await query(sql, [id]);
  return user || null;
};

// Insert new user
const insertUser = async ({
  email,
  passwordHash,
  first_name,
  last_name,
  phone_number,
  role,
}) => {
  const sql = `
    INSERT INTO users (email, password_hash, first_name, last_name, phone_number, role, is_verified)
    VALUES (?, ?, ?, ?, ?, ?, FALSE)
  `;
  const result = await query(sql, [
    email,
    passwordHash,
    first_name,
    last_name,
    phone_number || null,
    role,
  ]);
  return result.insertId;
};

// Government Official Profile Queries

// Insert government official profile
const insertGovernmentProfile = async ({
  user_id,
  department,
  position_title,
  office_region,
}) => {
  const sql = `
    INSERT INTO government_official_profiles (user_id, department, position_title, office_region)
    VALUES (?, ?, ?, ?)
  `;
  const result = await query(sql, [
    user_id,
    department,
    position_title,
    office_region,
  ]);
  return result.insertId;
};

// Get government official profile by user_id
const getGovernmentProfileByUserId = async (user_id) => {
  const sql = `
    SELECT profile_id, user_id, department, position_title, office_region, created_at
    FROM government_official_profiles
    WHERE user_id = ?
    LIMIT 1
  `;
  const [profile] = await query(sql, [user_id]);
  return profile || null;
};

module.exports = {
  getUserByEmail,
  getUserById,
  insertUser,
  insertGovernmentProfile,
  getGovernmentProfileByUserId,
};
