require("dotenv").config();

const db = require("../config/db.config");
const { response } = require("../utils/response");
const jwt = require("jsonwebtoken");

const auth = async (req, res) => {
  if (!req.body.userid || !req.body.password) {
    return response(res, false, "Userid atau password kosong", []);
  } else {
    await db
      .query(
        `select pegawai.id_perusahaan as id_pegawai ,pegawai.nama,pegawai.id_koordinator,pegawai.lokasi,foto,pegawai_rule.sn,pegawai_rule.tipe_jam_kerja as tipe from akun_pegawai JOIN pegawai on akun_pegawai.id_perusahaan = pegawai.id_perusahaan left JOIN pegawai_rule on akun_pegawai.id_perusahaan = pegawai_rule.id_pegawai where username = '${req.body.userid}' and password = '${req.body.password}' and akun_pegawai.status_pegawai = 'Active' LIMIT 1`
      )
      .then(async (result) => {
        if (result[0].length > 0) {
          jwt.sign(result[0][0], process.env.SIGNATURE, async (err, token) => {
            if (err) {
              console.log(err);
              return response(res, false, "Kendala Server", null);
            } else {
              var data = { ...result[0][0], token: token };
              return response(res, true, `Halo ${result[0][0].nama}`, data);
            }
          });
        } else {
          return response(res, false, "Userid atau password salah", []);
        }
      })
      .catch((err) => {
        if (err) {
          console.log(err);
          return response(res, false, "Kendala server", []);
        }
      });
  }
};

module.exports = { auth };
