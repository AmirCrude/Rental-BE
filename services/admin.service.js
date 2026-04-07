const {
  getUserByEmail,
  insertUser,
  insertGovernmentProfile,
} = require("../database/queries/admin.query");
const {
  generatePassword,
  hashedPassword,
} = require("../utils/password/password.manager");
const {
  sendGovernmentWelcomeEmail,
} = require("../utils/template/email.template");

// Service to create a government official
const createGovernmentOfficial = async ({
  email,
  first_name,
  last_name,
  phone_number,
  department,
  position_title,
  office_region,
}) => {
  // Check if email already exists
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new Error("Email already exists");
  }

  // Generate system password
  const plainPassword = generatePassword(12);
  const passwordHash = await hashedPassword(plainPassword); // ✅ await here

  try {
    // Insert user into users table
    const userId = await insertUser({
      email,
      passwordHash,
      first_name,
      last_name,
      phone_number,
      role: "government_official",
    });

    // Insert government official profile
    await insertGovernmentProfile({
      user_id: userId,
      department,
      position_title,
      office_region,
    });

    // Send welcome email with generated password
    await sendGovernmentWelcomeEmail(email, first_name, plainPassword);

    // Return created official info
    return {
      user_id: userId,
      role: "government_official",
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createGovernmentOfficial,
};
