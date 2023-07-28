const model = require("../model/accessModel")
const { response } = require("../utils/response")
const sevice = new model()

const getAccess = async (req, res) => {
  const param = ['id']
  const kosong = param.find(d => !req.query[d])

  if (kosong) {
    return response(res, false, `${kosong} kosong`)
  } else {
    const access = await sevice.getAccess(req.query.id)
    if (!access.error) {
      return response(res, true, "Data Access", access.data)
    } else {
      console.log(access.data);
      return response(res, false, "Kendala Server")
    }
  }
}

module.exports = { getAccess }