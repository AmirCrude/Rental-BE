const userService = require("../services/user.service");

// Get user by ID

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await userService.getUserByIdService(id);
    
        if (!result.success) {
        return res.status(404).json({ status: "error", message: result.message });
        }
    
        res.status(200).json({
        status: "success",
        data: result.data,
        });
    } catch (error) {
        console.error("Get User By ID Error:", error);
        res.status(500).json({ status: "error", message: "Server error" });
    }
}

module.exports = {
    getUserById,
}