const { response } = require("../utils/response");
const DataAbsen = require("../model/absenModel");

let dataAbsen = new DataAbsen();

const getHistoriAbsensi = async (req, res) => {
  const param = [id, koor, periode];
  const kosong = param.find((p) => !req.query[p]);

  const query = req.query;

  if (kosong) {
    return response(res, false, `${kosong} kosong`);
  } else {
    var tipe = await dataAbsen.getTipePegawai(query.id);

    if (!tipe.error) {
      let start = query.periode + tipe.data.tgl_awal;
      let end = query.periode + tipe.data.tgl_akhir;

      if (tipe.data.tipe != "Shift") {
        var absen = await dataAbsen.getDataAbsensiShift(query.id, start, end);
      } else {
        var absen = await dataAbsen.getDataAbsensiFulltime(
          query.id,
          start,
          end
        );
        if (!absen.error) {
          return response(res, true, "Data Absensi Pegawai", absen.data);
        } else {
          return response(res, false, "Kendala Server " + absen.data);
        }
      }
    } else {
      return response(res, false, "Kendala Server");
    }

    // var data = await dataAbsen.getDataHistoriAbsensi(
    //   req.query.id,
    //   req.query.koor,
    //   req.query.periode
    // );
    // if (data.error != true) {
    //   return response(res, true, "data histori absensi");
    // } else {
    //   return response(res, false, "Kendala server");
    // }
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
