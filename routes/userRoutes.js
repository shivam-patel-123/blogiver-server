const express = require("express");

const { createNewAccount, login, validateSession, logout } = require("../controllers/userController");

const router = express.Router();

router.route("/").post(createNewAccount);
router.route("/login").post(login);
router.route("/session").get(validateSession);
router.route("/logout").get(logout);

module.exports = router;
