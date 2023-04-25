const express = require("express");
const router = express.Router();

const auth = require("../controller/authController");
const absen = require("../controller/absenController");
const task = require("../controller/taskController");
const periode = require("../controller/periodeController");
const shift = require("../controller/shiftController");
const { checkToken } = require("./middleware");

router.post("/login", auth.auth);

router.get("/absen/histori", checkToken, absen.getHistoriAbsensi);
router.get("/absen/jadwal", checkToken, absen.getJadwalAbsensi);

router.get("/task/dashboard", checkToken, task.getDashboardTask);
router.get("/task/all", checkToken, task.getTask);

router.get("/shift/myshift", checkToken, shift.getMyShift);

router.get("/periode", periode.periode);

module.exports = router;
