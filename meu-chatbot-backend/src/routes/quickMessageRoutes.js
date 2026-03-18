const express = require("express");
const quickMessageController = require("../controllers/quickMessageController");
const isAuth = require("../middleware/isAuth");

const router = express.Router();

router.get("/quickMessages", isAuth, quickMessageController.index);
router.post("/quickMessages", isAuth, quickMessageController.store);
router.put("/quickMessages/:id", isAuth, quickMessageController.update);
router.delete("/quickMessages/:id", isAuth, quickMessageController.remove);

module.exports = router;
