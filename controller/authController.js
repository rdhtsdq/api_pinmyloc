require("dotenv").config();

const { response } = require("../utils/response");
const jwt = require("jsonwebtoken");
const { login } = require("../model/authModel");

const auth = async (req, res) => {
  if (!req.body.userid || !req.body.password) {
    return response(res, false, "Userid atau password kosong", []);
  } else {
    var row = await login(req.body.userid, req.body.password);

    if (!row.error) {
      var data = row.data[0];
      if (!data) {
        return response(res, false, "Userid atau password salah");
      } else {
        jwt.sign(data, process.env.SIGNATURE, (err, token) => {
          if (err) {
            console.log(err);
            return response(res, false, "Kendala Server");
          } else {
            data = { ...data, token };
            return response(res, true, `Halo ${row.data[0].nama}`, data);
          }
        });
      }
    } else {
      console.log(row.data);
      return response(res, false, "Kendala Server", []);
    }
  }
};

module.exports = { auth };
