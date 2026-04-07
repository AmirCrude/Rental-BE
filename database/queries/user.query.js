import pool from "../../configs/database.config";

export const createUser = async (name, email, password) => {
  const sql = `INSERT INTO users (name,email,password) VALUES (?,?,?)`;
  const [result] = await pool.execute(sql, [name, email, password]);
  return result.insertId;
};

export const getUserByEmail = async (email) => {
  const sql = `SELECT * FROM users WHERE email=?`;
  const [rows] = await pool.execute(sql, [email]);
  return rows[0];
};