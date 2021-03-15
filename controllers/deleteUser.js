const User = require("../models/userRegistraion");

const deleteUser = async (req, res) => {
  try {
    await User.findOneAndDelete({
      _id: req.headers.token,
    });
    res.json({
      error: 0,
      message: "user deleted successfully",
    });
  } catch (error) {
    res.json({
      err: 1,
      message: error.message,
      error,
    });
  }
};

module.exports = deleteUser;
