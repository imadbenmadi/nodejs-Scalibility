const express = require("express");
const { register, login } = require("../controllers/userController");
const auth = require("../middlewares/auth");
const router = express.Router();

// User registration
router.post("/register", register);

// User login
router.post("/login", login);

module.exports = router;
