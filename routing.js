const express = require("express");
const router = express.Router();

const verifyToken = require("./verify");
const {
  userRegister,
  userLogin,
  saveUserAddress,
  getPageData,
  getAllData,
  deleteUser,
} = require("./controllers/index");

router.post("/register", userRegister);
router.post("/login", userLogin);
router.post("/address", verifyToken, saveUserAddress);
router.post("/page", verifyToken, getPageData);
router.post("/get", verifyToken, getAllData);
router.post("/delete", verifyToken, deleteUser);

module.exports = router