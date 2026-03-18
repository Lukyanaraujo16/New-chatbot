const express = require("express");
const queueController = require("../controllers/queueController");
const isAuth = require("../middleware/isAuth");

const router = express.Router();

router.get("/queue", isAuth, queueController.index);
router.get("/queue/:queueId", isAuth, queueController.show);
router.post("/queue", isAuth, queueController.store);
router.put("/queue/:queueId", isAuth, queueController.update);
router.delete("/queue/:queueId", isAuth, queueController.remove);

module.exports = router;
