const jwt = require("jsonwebtoken");
require("dotenv").config();

const {
  hashedPassword,
  comparePassword,
} = require("../utils/password/password.manager");

const {
  getUserById,
  getUserByEmail,
  updateUserPassword,
} = require("../database/queries/auth.query");

const { sendResetTokenEmail } = require("../utils/template/email.template");

const login = async (email, password) => {
  const user = await getUserByEmail(email);
  if (!user) return { success: false, message: "Invalid email or password" };

  const isValid = await comparePassword(password, user.password_hash);
  if (!isValid) return { success: false, message: "Invalid email or password" };

  // Include everything inside JWT
  const tokenPayload = {
    userId: user.user_id,
    role: user.role,
  };

  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: "1d", // expires in 1 day
  });

  return {
    success: true,
    message: "Login successful",
    data: {
      token,
      role: user.role,
    },
  };
};

// forgot password (sends reset link via email)
const forgotPassword = async (email) => {
  const user = await getUserByEmail(email);
  if (!user) return { success: false, message: "Email not found" };

  const token = jwt.sign(
    { userId: user.user_id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  await sendResetTokenEmail(email, token);

  return { success: true, message: "Reset link sent to your email" };
};

// reset password (forgot-password flow using token)
const resetPassword = async (newPassword, token) => {
  if (!token) return { success: false, message: "Token is required" };

  let user;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    user = await getUserById(payload.userId);
    if (!user) return { success: false, message: "User not found" };
  } catch (err) {
    return { success: false, message: "Invalid or expired token" };
  }

  const newHashed = await hashedPassword(newPassword);
  const updated = await updateUserPassword(user.email, newHashed);
  if (!updated) return { success: false, message: "Failed to reset password" };

  return { success: true, message: "Password reset successful" };
};

// change password (logged-in user, old password required)
const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await getUserById(userId);
  if (!user) return { success: false, message: "User not found" };

  const isMatch = await comparePassword(oldPassword, user.password_hash);
  if (!isMatch) return { success: false, message: "Old password is incorrect" };

  const newHashed = await hashedPassword(newPassword);
  const updated = await updateUserPassword(user.email, newHashed);
  if (!updated) return { success: false, message: "Failed to change password" };

  return { success: true, message: "Password changed successfully" };
};

module.exports = {
  login,
  forgotPassword,
  resetPassword,
  changePassword,
};
