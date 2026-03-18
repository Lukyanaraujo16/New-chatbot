const express = require("express");
const ticketController = require("../controllers/ticketController");
const isAuth = require("../middleware/isAuth");

const router = express.Router();

router.get("/tickets", isAuth, ticketController.index);
router.get("/tickets/:ticketId", isAuth, ticketController.show);
router.post("/tickets", isAuth, ticketController.store);
router.put("/tickets/:ticketId", isAuth, ticketController.update);
router.delete("/tickets/:ticketId", isAuth, ticketController.remove);

module.exports = router;
