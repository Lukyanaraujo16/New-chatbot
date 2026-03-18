const express = require("express");
const whatsappSessionController = require("../controllers/whatsappSessionController");
const isAuth = require("../middleware/isAuth");

const router = express.Router();

router.post("/whatsappsession/:whatsappId", isAuth, whatsappSessionController.store);
router.put("/whatsappsession/:whatsappId", isAuth, whatsappSessionController.update);
router.delete("/whatsappsession/:whatsappId", isAuth, whatsappSessionController.remove);

module.exports = router;
