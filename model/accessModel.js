const db = require("../config/db.config");

class Access {
  async getAccess(id) {
    let result = { data: null, error: false }
    try {
      let data = []
      const idMenu = await db.query(`select akses from akun_pegawai where id_perusahaan = '${id}' limit 1`)
      const ids = idMenu[0][0].akses.split("|")

      for (let f = 0; f < ids.length; f++) {
        const menu = ids[f];
        if (menu) {
          const features = await db.query(`select id,title,id_path,path from menu where kode = '${menu}'`)
          if (features[0]) {
            data.push({ id: features[0][0].id, title: features[0][0].title, path: features[0][0].path ?? null, data: [], })
            if (features[0][0].id_path) {
              const subFeatureId = features[0][0].id_path.split("|")
              for (let sf = 0; sf < subFeatureId.length; sf++) {
                const subFeatures = await db.query(`select * from path where id = '${subFeatureId[sf]}'`)
                if (subFeatures[0][0]) {
                  data[f].data.push(subFeatures[0][0])
                }
              }
            }
          }
        }
      }
      result.data = data
      return result
    } catch (error) {
      console.log(error);
      result.error = true
      result.data = error
      return result
    }
  }
}

module.exports = Access