const express = require("express");

const { createNewAccount, login } = require("../controllers/userController");

const router = express.Router();

router.route("/").post(createNewAccount);
router.route("/login").post(login);
module.exports = router;
