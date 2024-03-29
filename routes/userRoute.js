const crypto = require("crypto"); //this is a built in function basically use for generating randon strings expecially (passwordreset token)

const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");
// ROUTES
const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
// router.post("/forgotPassword", authController.forgotPassword);

router.route("/").get(userController.getAllUsers);

router
  .route("/:id")
  .get(userController.getUser)
  .delete(userController.deleteUser);

module.exports = router;
