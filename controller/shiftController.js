const { response } = require("../utils/response");
const model = require("../model/shiftModel");

const shift = new model();

const getMyShift = async (req, res) => {
  const params = ["id", "koor", "date"];
  const kosong = params.find((p) => !req.query[p]);

  if (kosong) {
    return response(res, false, `${kosong} kosong`);
  } else {
    var data = await shift.getMyshift(
      req.query.id,
      req.query.koor,
      req.query.date
    );

    if (data.error != true) {
      return response(res, true, "data shift", data.data);
    } else {
      return response(res, false, data.data);
    }
  }
};

const getOtherShift = async (req, res) => {
  const param = ["id", "koor", "date"]
  const kosong = param.find((p) => !req.query[p]);

  if (kosong) {
    return response(res, false, `${kosong} kosong`)
  } else {
    var data = await shift.getOtherShift(req.query.id, req.query.koor, req.query.date, req.query.name)

    if (!data.error) {
      return response(res, true, "data shift", data.data)
    } else {
      return response(res, false, data.data)
    }
  }
}

module.exports = { getMyShift, getOtherShift };
