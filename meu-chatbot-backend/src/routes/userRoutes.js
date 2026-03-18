const express = require("express");
const userController = require("../controllers/userController");
const isAuth = require("../middleware/isAuth");

const router = express.Router();

router.get("/users", isAuth, userController.index);
router.get("/users/:userId", isAuth, userController.show);
router.post("/users", isAuth, userController.store);
router.put("/users/:userId", isAuth, userController.update);
router.delete("/users/:userId", isAuth, userController.remove);

module.exports = router;
