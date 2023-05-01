const { response } = require("../utils/response");
const OtherData = require("../model/otherModel");

const otherModel = new OtherData();

const getLokasi = async (req, res) => {
  const data = await otherModel.getLokasi();

  if (!data.error) {
    return response(res, true, "data lokasi", data.data);
  } else {
    return response(res, false, data.data);
  }
};

const getPegawai = async (req, res) => {
  const params = ["id", "koor"];
  const kosong = params.find((p) => !req.query[p]);

  if (kosong) {
    return response(res, false, `${kosong} kosong`);
  } else {
    let data = await otherModel.getPegawai(req.query.id, req.query.koor);
    if (!data.error) {
      return response(res, true, "Data Pegawai", data.data);
    } else {
      return response(res, false, "Kendala Server");
    }
  }
};

module.exports = { getLokasi, getPegawai };
