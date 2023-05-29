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

  /**
   * 
   * @param {String} id 
   * @param {String} koor 
   * @param {String} date 
   * @param {String} name 
   * @returns 
   */
  async getOtherShift(id, koor, date, name = "") {
    let result = { error: false, data: null };

    if (name != "") {
      name = `and dp.nama like '%${name}%'`
    }

    try {
      var shift = await db.query(`
      SELECT s.jam_masuk,s.jam_keluar,ls.tgl,dp.nama FROM list_jadwal_shift ls LEFT JOIN list_shift s ON ls.no_shift = s.no_shift LEFT JOIN (
        SELECT p.id_perusahaan as ids,p.nama,p.id_koordinator FROM pegawai p JOIN (
        SELECT posisi,id_koordinator FROM pegawai where id_perusahaan = ${id} and id_koordinator = '${koor}'
        ) p2 ON p.posisi = p2.posisi AND p.id_koordinator = p2.id_koordinator and p.status = 'Active'
      ) dp ON ls.id_koordinator = dp.id_koordinator AND ls.id_pegawai = dp.ids 
      WHERE tgl = '${date}' ${name}  GROUP BY ls.id_pegawai
      `)
      result.data = shift[0]
      return result
    } catch (e) {
      result.data = e;
      result.error = true
    }
  }
}

module.exports = ShiftModel;
