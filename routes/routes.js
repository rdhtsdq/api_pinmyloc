const express = require("express");
const router = express.Router();

const auth = require("../controller/authController");
const absen = require("../controller/absenController");
const { checkToken } = require("./middleware");

router.post("/login", auth.auth);
router.get("/absen/histori", checkToken, absen.getHistoriAbsensi);

module.exports = router;
