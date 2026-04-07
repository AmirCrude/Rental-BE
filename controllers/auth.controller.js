const authService = require("../services/auth.service");

// login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    if (!result.success) {
      return res.status(400).json({ status: "error", message: result.message });
    }

    res.status(200).json({
      status: "success",
      message: result.message,
      user: result.data, // token info
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

// forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);

    if (!result.success) {
      return res.status(400).json({ status: "error", message: result.message });
    }

    res.status(200).json({
      status: "success",
      message: result.message,
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

// reset password (forgot-password flow, using token)
const resetPassword = async (req, res) => {
  try {
    const { newPassword, token } = req.body;

    const result = await authService.resetPassword(newPassword, token);

    if (!result.success) {
      return res.status(400).json({ status: "error", message: result.message });
    }

    res.status(200).json({
      status: "success",
      message: result.message,
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

// change password (logged-in user, requires old password)
const changePassword = async (req, res) => {
  try {
    const { userId } = req.user; // must be logged-in
    const { oldPassword, newPassword } = req.body;

    const result = await authService.changePassword(
      userId,
      oldPassword,
      newPassword
    );

    if (!result.success) {
      return res.status(400).json({ status: "error", message: result.message });
    }

    res.status(200).json({
      status: "success",
      message: result.message,
    });
  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

module.exports = {
  loginUser,
  forgotPassword,
  resetPassword,
  changePassword,
};
