const express = require("express");
const whatsappController = require("../controllers/whatsappController");
const isAuth = require("../middleware/isAuth");

const router = express.Router();

router.get("/whatsapp/", isAuth, whatsappController.index);
router.post("/whatsapp/", isAuth, whatsappController.store);
router.get("/whatsapp/:whatsappId", isAuth, whatsappController.show);
router.put("/whatsapp/:whatsappId", isAuth, whatsappController.update);
router.delete("/whatsapp/:whatsappId", isAuth, whatsappController.remove);

module.exports = router;
