const AccessToken = require("./models/accessToken");

const verifyToken = async function verifyToken(req, res, next) {
  try {
    const token = await AccessToken.findOne({ accessToken: req.headers.token });
    if (!token) {
      throw "invalid token";
    }
    const expiryTime = new Date(token.expiry).valueOf();
    const currentTime = Date.now();
    if (currentTime > expiryTime) {
      await AccessToken.findOneAndDelete({ _id: token._id });
      throw "token is expired , login again";
    }
    next();
  } catch (error) {
    res.json({
      err: 1,
      message: error.message,
      error,
    });
  }
};
module.exports = verifyToken;
