const cloudinaryService = require("./cloudinary.service");
const { hashedPassword } = require("../utils/password/password.manager");
const registerQuery = require("../database/queries/register.query");
const { sendRegistrationEmail } = require("../utils/template/email.template");
const { getUserByEmail } = require("../database/queries/auth.query");

const registerUser = async (userData) => {
  const {
    email,
    password,
    first_name,
    last_name,
    phone_number,
    role,
    national_id,
    document_type,
    specialization,
    years_of_experience,
    file,
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
    first_name,
    last_name,
    phone_number,
    role,
    national_id,
    is_verified,
  });
  // Save lawyer professional information if the user is a lawyer
  if (role === "lawyer") {
    await registerQuery.addLawyerDocument({
      lawyer_id: newUser.user_id,
      document_type: document_type || null,
      document_url,
      cloudinary_public_id: document_public_id,
      specialization,
      years_of_experience,
    });
  }

  // Send registration email
  await sendRegistrationEmail(email, first_name, role);

  return newUser;
};

module.exports = { registerUser };
