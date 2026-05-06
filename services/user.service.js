
const {
    getUserById,
  } = require("../database/queries/auth.query");
  
  const getUserByIdService = async (id) => {
    try {
      const user = await getUserById(id);
      if (!user) {
        return { success: false, message: "User not found" };
      }
      return { success: true, data: user };
    } catch (error) {
      console.error("Get User By ID Service Error:", error);
      throw error;
    }
  }

    module.exports = {
        getUserByIdService,
    };