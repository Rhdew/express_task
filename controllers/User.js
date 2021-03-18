require("dotenv").config();
const bcrypt = require("bcrypt");
const User = require("../models/userRegistration");
const Address = require("../models/address");
const AccessToken = require("../models/accessToken");
const getRandomInt = require("../middlewares/token");

const userRegister = async (req, res) => {
  try {
    let {
      firstName,
      secondName,
      userName,
      password,
      confirmPassword,
      email,
    } = req.body;
    let validatedPassword;
    if (password === confirmPassword) {
      const size = process.env.SALT;
      const salt = await bcrypt.genSalt(parseInt(size));
      validatedPassword = await bcrypt.hash(password, salt);
    } else {
      throw "password did not match";
    }
    let userRecord = await User.findOne({
      $or: [{ email: email }, { userName: userName }],
    });
    if (userRecord) {
      console.log("user");
      throw "username or email is already exist";
    }

    let userData = {
      firstName: firstName,
      secondName: secondName,
      userName: userName,
      password: validatedPassword,
      email: email,
    };
    let user = new User(userData);
    await user.save();

    res.json({
      error: 0,
      message: "registered successfully",
    });
  } catch (error) {
    res.json({
      err: 1,
      message: error.message,
      error,
    });
  }
};

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
    let accessToken;
    const userToken = await AccessToken.findOne({ userId: user._id });
    if (!userToken) {
      accessToken = getRandomInt();
      let accessTokenData = {
        userId: user._id,
        accessToken: accessToken,
      };
      let tokendata = new AccessToken(accessTokenData);
      await tokendata.save();
    } else accessToken = userToken.accessToken;
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

const saveUserAddress = async (req, res) => {
  try {
    let { address, city, state, pinCode, phone } = req.body;
    let userId = req.headers.token;
    let userAddress = {
      userId: userId,
      address: address,
      city: city,
      state: state,
      pinCode: pinCode,
      phone: phone,
    };
    const userAddressData = new Address(userAddress);
    const addressData = await userAddressData.save();
    await User.findOneAndUpdate(
      { _id: addressData.userId },
      { $push: { addresses: addressData._id } },
      { new: true }
    );
    res.json({
      error: 0,
      message: "address successfully saved",
    });
  } catch (error) {
    res.json({
      err: 1,
      message: error.message,
      error,
    });
  }
};

const getPageData = async (req, res) => {
  try {
    let skip = req.params.page * 10;
    const userList = await User.find().skip(skip).limit(10);
    res.json({
      error: 0,
      message: "user list",
      data: [userList],
    });
  } catch (error) {
    res.json({
      err: 1,
      message: error.message,
      error,
    });
  }
};

const getAllData = async (req, res) => {
  try {
    console.log(req.params.id);
    User.findOne({ _id: req.params.id })
      .populate("addresses")
      .then((user) => {
        res.json({
          error: 0,
          message: "fetched data successfully",
          data: [user],
        });
      });
  } catch (error) {
    res.json({
      err: 1,
      message: error.message,
      error,
    });
  }
};

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

module.exports = {
  userRegister,
  userLogin,
  saveUserAddress,
  getPageData,
  getAllData,
  deleteUser,
};
