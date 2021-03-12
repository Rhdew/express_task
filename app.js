const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Register = require("./models/userRegistraion");
const bodyParser = require("body-parser");

const router = express.Router();
const app = express();

require("dotenv").config();
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
  console.log(req.body);
  try {
    let firstName = req.body.firstName;
    let secondName = req.body.secondName;
    let userName = req.body.userName;
    let password = req.body.password;
    let confirmPassword = req.body.confirmPassword;
    let email = req.body.email;
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

app.use(bodyParser.json());
app.use(router);
app.listen(3000, () => {
  console.log("connected ");
});
