const db = require("../config/db.config");

class OtherData {
  async getLokasi() {
    let result = {
      error: false,
      data: null,
    };

    try {
      let lokasi = await db.query("select id,name from regencies");
      result.data = lokasi[0];
    } catch (qError) {
      console.log(qError);
      result.error = true;
      result.data = qError;
    }

    return result;
  }

  /**
   *
   * @param {String} id
   * @param {String} koor
   */
  async getPegawai(id, koor) {
    let result = {
      error: false,
      data: null,
    };
    try {
      let pegawai = await db.query(
        `
        select nama,id_perusahaan as id from pegawai where id_atasan = ${id} and id_koordinator = '${koor}' order by nama asc
        `
      );
      result.data = pegawai[0];

      return result;
    } catch (error) {
      console.log(error);
      result.error = true;
      result.data = error;
      return result;
    }
  }
}

module.exports = OtherData;
