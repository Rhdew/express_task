const User = require("../models/userRegistraion");
const AccessToken = require("../models/accessToken");
const bcrypt = require("bcrypt");

const userLogin = async (req, res) => {
  try {
    let username = req.body.username;
    let password = req.body.password;
    const user = await User.findOne({ userName: username });
    if (!user) {
      throw "user not found";
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw "not a valid password";
    }

    const userToken = await AccessToken.findOne({ userId: user._id });
    var accessToken = userToken.accessToken;
    if (!userToken) {
      accessToken = getRandomInt(10);
      let accessTokenData = {
        userId: user._id,
        accessToken: accessToken,
      };
      let tokendata = new AccessToken(accessTokenData);
      await tokendata.save();
    }
    res.json({
      error: 0,
      message: "successfully login",
      data: [
        {
          token: accessToken,
          userId: user._id,
        },
      ],
    });
  } catch (error) {
    res.json({
      err: 1,
      message: error.message,
      error,
    });
  }
};

function getRandomInt(max) {
  let arr = [];
  for (let i = 0; i < 20; i++) {
    arr[i] = Math.floor(Math.random() * Math.floor(max));
  }
  return arr.join("");
}

module.exports = userLogin;
