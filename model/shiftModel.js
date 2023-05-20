const db = require("../config/db.config");
class ShiftModel {
  /**
   * Get Shift
   * @param {String} id
   * @param {String} koor
   * @param {String} date
   */
  async getMyshift(id, koor, date) {
    let result = { error: false, data: null };
    try {
      var data = await db.query(
        `
                select
                    s.jam_masuk,
                    s.jam_keluar,
                    ls.kode
                from
                    list_jadwal_shift ls
                    left join list_shift s on s.no_shift = ls.no_shift
                    and s.id_koordinator = ls.id_koordinator
                where
                    ls.id_pegawai = ${id}
                    and ls.id_koordinator = '${koor}'
                    and ls.tgl = '${date}'
                `
      );
      result.data = data[0][0];
      return result;
    } catch (error) {
      if (error) {
        console.log(error);
        result.error = true;
        result.data = error;
        return result;
      }
    }
  }

  async getOtherShift(id, koor, date) {
    let result = { error: false, data: null };

    try {
    } catch (e) {}
  }
}

module.exports = ShiftModel;
