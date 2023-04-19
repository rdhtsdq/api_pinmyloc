const { response } = require("../utils/response");
const { getDataHistoriAbsensi } = require("../model/absenModel");

const getHistoriAbsensi = async (req, res) => {
  if (!req.query.id || !req.query.koor) {
    return response(res, false, "id kosong");
  } else {
    var data = await getDataHistoriAbsensi(req.query.id, req.query.koor);
    if (data != undefined) {
      if (data.error != true) {
        return response(req, true, "Data histori absensi", data.data);
      } else {
        return response(res, false, "Kendala server");
      }
    } else {
      return response(res, false, "Kendala server");
    }
  }
};

module.exports = { getHistoriAbsensi };
