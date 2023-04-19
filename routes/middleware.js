require("dotenv").config();
const { rateLimit } = require("express-rate-limit");
const { response } = require("../utils/response");
const jwt = require("jsonwebtoken");
const { dec } = require("../utils/crypt");
const db = require("../config/db.config");
const db2 = require("../config/db2.config");

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 menit
  max: 50,
  message: async (req, res) => response(res, false, "Akses ditolak", null),
});

const checkToken = (req, res, next) => {
  if (req.headers["authorization"] != null) {
    token = req.headers["authorization"].split(" ")[1];
    console.log(token);
    jwt.verify(token, process.env.SIGNATURE, (err, re) => {
      if (err) {
        console.log(err);
        return response(res, false, "unauthenticated");
      } else {
        next();
      }
    });
  } else {
    return response(req, 0, 401, "unauthenticated");
  }
};

const setLocalTime = async (req, res, next) => {
  await db.query(`SET @@session.time_zone = "+07:00"`);
  await db2.query(`SET @@session.time_zone = "+07:00"`);

  next();
};

module.exports = { limiter, checkToken, setLocalTime };
