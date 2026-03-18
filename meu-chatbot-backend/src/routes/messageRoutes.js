const express = require("express");
const multer = require("multer");
const messageController = require("../controllers/messageController");
const isAuth = require("../middleware/isAuth");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/messages/:ticketId", isAuth, messageController.index);
router.post("/messages/:ticketId", isAuth, upload.array("medias", 5), messageController.store);
router.delete("/messages/:messageId", isAuth, messageController.remove);

module.exports = router;
