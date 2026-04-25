const cloudinaryService = require("./cloudinary.service");
const { hashedPassword } = require("../utils/password/password.manager");
const registerQuery = require("../database/queries/register.query");
const { sendRegistrationEmail } = require("../utils/template/email.template");
const { getUserByEmail } = require("../database/queries/auth.query");

const registerUser = async (userData) => {
  const {
    email,
    password,
    phone_number,
    name,
    role,
  } = userData;

  // Check if email is already registered
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new Error("User already exists");
  }

  // Hash the password
  const password_hash = await hashedPassword(password);

  // Create the user in the database
  const newUser = await registerQuery.register({
    email,
    password_hash,
    phone_number,
    name,
    role,
  });
  

  // Send registration email
  await sendRegistrationEmail(email, name, role);

  return newUser;
};

module.exports = { registerUser };
