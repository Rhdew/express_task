const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Register = require("./models/userRegistraion");

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

router.post("/Register", async (req, res) => {
  try {
    let firstName = req.body.firstName;
    let secondName = req.body.secondName;
    let userName = req.body.userName;
    let password = req.body.password;
    let confirmPassword = req.body.confirmPassword;
    let email = req.body.email;
    let validatedPassword;
    let bool = true;
    if (password === confirmPassword) {
      validatedPassword = bcrypt.hashSync(password, 10);
    } else {
      throw "password did not match";
    }
    let users = await Register.find();
    console.log("users", users);
    if (users.length >= 1) {
      await Promise.all(
        users.map(async (record, index) => {
          if (record.email === email || record.userName === userName) {
            throw "username or email is already exist";
          }
        })
      );
    }
    if (bool) {
      let userData = {
        firstName: firstName,
        secondName: secondName,
        userName: userName,
        password: validatedPassword,
        email: email,
      };
      let user = new Register(userData);
      await user.save();
    }
  } catch (error) {
    res.send({
      error: error,
    });
  }
});

app.listen(3000, () => {
  console.log("connected ");
});
