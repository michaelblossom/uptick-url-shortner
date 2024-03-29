const express = require("express");
const urlController = require("../controllers/urlController");
const authController = require("../controllers/authController");
// ROUTES
const router = express.Router();
// router.use(authController.protect); // this will protect all the middlewares under it from users that are not logged in

router
  .route("/shorten")
  .post(urlController.creatUrl)
  .get(urlController.getAllUrls);

// router
//   .route("/:id")
//   .get(urlController.getUrl)
//   .patch(authController.restrictTo("user"), urlController.updateUrl)
//   .delete(authController.restrictTo("user", "admin"), urlController.deleteUrl);
router
  .route("/:code")
  .get(urlController.getUrl)
  .patch(urlController.updateUrl)
  .delete(urlController.deleteUrl);

module.exports = router;
