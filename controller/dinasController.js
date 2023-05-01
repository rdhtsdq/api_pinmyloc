const { response } = require("../utils/response");
const Dinas = require("../model/dinasModel");

let dinas = new Dinas();

const getDinas = async (req, res) => {
  //   const params = ["lokasi", "tgl_awal", "tgl_akhir", "tujuan"];
  const params = ["id", "koor"];
  const kosong = params.find((p) => !req.query[p]);

  if (kosong) {
    return response(res, false, `${kosong} kosong!`);
  } else {
    const data = await dinas.getDinas(req.params.id, req.params.koor);
    if (!data.error) {
      return response(res, true, "Data Dinas Karyawan", data.data);
    } else {
      return response(res, false, data.data);
    }
  }
};

module.exports = { getDinas };
