const express = require("express");
const router = express.Router();

const auth = require("../controller/authController");

router.post("/login", auth.auth);

module.exports = router;
