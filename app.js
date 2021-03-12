require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const randomString = require("crypto-random-string");
const Register = require("./models/userRegistraion");
const AccessToken = require("./models/accessToken");

const router = express.Router();
const app = express();

mongoose
  .connect(process.env.DATABASE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    reconnectTries: 30,
    reconnectInterval: 500,
    poolSize: 10,
    bufferMaxEntries: 0,
    autoIndex: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("Link established to database");
  })
  .catch(() => {
    console.log("No link to database.");
  });

router.post("/user/register", async (req, res) => {
  console.log(req);
  console.log(req.body);
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
      validatedPassword = await bcrypt.hash(password, 10);
    } else {
      throw "password did not match";
    }
    let userRecord = await Register.findOne({
      $or: [{ email: email }, { userName: userName }],
    });
    if (userRecord) {
      throw "username or email is already exist";
    }

    let userData = {
      firstName: firstName,
      secondName: secondName,
      userName: userName,
      password: validatedPassword,
      email: email,
    };
    let user = new Register(userData);
    await user.save();

    res.status(200).send("registered succefully");
  } catch (error) {
    res.status(500).send({
      error: error,
    });
  }
});

router.post("/user/login/:username/:password", async (req, res) => {
  try {
    let username = req.params.username;
    let password = req.params.password;
    const user = await Register.findOne({ userName: username });
    if (!user) {
      throw "user not found";
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw "not a valid password";
    }
    const userToken = await AccessToken.findOne({ userId: user._id });
    console.log(userToken);
    if (!userToken) {
      let accessToken = randomString({ length: 20, type: "base64" });
      let accessTokenData = {
        userId: user._id,
        accessToken: accessToken,
      };
      let tokendata = new AccessToken(accessTokenData);
      await tokendata.save();
    } else {
      const expiryTime = userToken.expiry;
      const currentTime = Date.now();
      if (currentTime > expiryTime) {
        console.log("expiry");
        await AccessToken.findOneAndDelete({ _id: userToken._id });
        throw "session ends again login";
      }
    }
    res.send(user.id);
  } catch (error) {
    res.status(500).send({
      error: error,
    });
  }
});

router.get("/user/get", verifyToken, async (req, res) => {
  try {
    const validatedUser = await Register.findOne({ _id: req.headers.token });
    res.send(validatedUser);
  } catch (error) {
    res.status(500).send({
      error: error,
    });
  }
});

router.put("/user/delete", verifyToken, async (req, res) => {
  try {
    await Register.findOneAndDelete({
      _id: req.headers.token,
    });
    res.send("user succesfully deleted");
  } catch (error) {
    res.status(500).send({
      error: error,
    });
  }
});

router.get("/user/list/:page", async (req, res) => {
  try {
    let skip = req.params.page * 10;
    const userList = await Register.find().skip(skip).limit(10);
    res.send(userList);
  } catch (error) {
    res.status(500).send({
      error: error,
    });
  }
});

async function verifyToken(req, res, next) {
  try {
    const findUser = await Register.findOne({ _id: req.headers.token });
    console.log(findUser);
    if (!findUser) {
      throw "invalid token";
    }
    next();
  } catch (error) {
    res.status(500).send({
      error: error,
    });
  }
}

app.use(bodyParser.json());
app.use(router);
app.listen(3000, () => {
  console.log("connected ");
});
