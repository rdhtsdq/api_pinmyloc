const { response } = require("../utils/response");
const DataAbsen = require("../model/absenModel");

let dataAbsen = new DataAbsen();

const getHistoriAbsensi = async (req, res) => {
  if (!req.query.id || !req.query.koor || !req.query.periode) {
    return response(res, false, "id kosong");
  } else {
    var data = await dataAbsen.getDataHistoriAbsensi(
      req.query.id,
      req.query.koor,
      req.query.periode
    );
    if (data.error != true) {
      return response(res, true, "data histori absensi");
    } else {
      return response(res, false, "Kendala server");
    }
  }
};

const getJadwalAbsensi = async (req, res) => {
  const params = ["id", "koor"];
  const kosong = params.find((p) => !req.query[p]);

  if (kosong) {
    return response(res, false, `${kosong} kosong`);
  } else {
    var data = await dataAbsen.getDataJadwalAbsensi(
      req.query.id,
      req.query.koor
    );
    if (data != undefined) {
      if (data.error != true) {
        return response(res, true, "jadwal absensi", data.data);
      } else {
        return response(res, false, "Kendala server");
      }
    } else {
      return response(res, false, "Kendala server");
    }
  }
};

module.exports = { getHistoriAbsensi, getJadwalAbsensi };
