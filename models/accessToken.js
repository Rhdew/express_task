const mongoose = require("mongoose");

const accessTokenSchema = mongoose.Schema({
  userId: {
    type: String,
  },
  accessToken: {
    type: String,
  },
  expiry: {
    type: Date,
    default: () => Date.now() + 60 * 60 * 1000,
  },
});

module.exports = mongoose.model("accessToken", accessTokenSchema);
