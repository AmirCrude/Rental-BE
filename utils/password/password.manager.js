const bcrypt = require("bcrypt");
const crypto = require("crypto");
// password hashing
const hashedPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};
//compare password
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};
const generatePassword = (length = 12) => {
  return crypto
    .randomBytes(length)
    .toString("base64")
    .slice(0, length)
    .replace(/\+/g, "A") // avoid + and / chars
    .replace(/\//g, "B");
};

module.exports = {
  hashedPassword,
  comparePassword,
  generatePassword,
};
