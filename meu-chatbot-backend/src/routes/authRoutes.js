const express = require("express");
const authController = require("../controllers/authController");
const isAuth = require("../middleware/isAuth");

const router = express.Router();

router.post("/login", authController.login);
router.post("/refresh_token", authController.refreshToken);
router.post("/signup", authController.signup);
router.delete("/logout", isAuth, authController.logout);

module.exports = router;
