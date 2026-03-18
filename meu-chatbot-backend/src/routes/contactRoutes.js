const express = require("express");
const contactController = require("../controllers/contactController");
const isAuth = require("../middleware/isAuth");

const router = express.Router();

router.get("/contacts", isAuth, contactController.index);
router.get("/contacts/:contactId", isAuth, contactController.show);
router.post("/contacts", isAuth, contactController.store);
router.post("/contact", isAuth, contactController.getContact);
router.put("/contacts/:contactId", isAuth, contactController.update);
router.delete("/contacts/:contactId", isAuth, contactController.remove);

module.exports = router;
