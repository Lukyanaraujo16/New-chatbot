const express = require("express");
const settingController = require("../controllers/settingController");
const isAuth = require("../middleware/isAuth");

const router = express.Router();

router.get("/settings", isAuth, settingController.index);
router.put("/settings/:settingKey", isAuth, settingController.update);

module.exports = router;
