const db = require("../config/db.config");

class Dinas {
  /**
   * get dinas
   * @param {String} id
   * @param {String} koor
   */
  async getDinas(id, koor) {
    let result = {
      error: false,
      data: null,
    };

    try {
      const dinas = await db.query(
        `
              select 
              concat(
                  date_format(dn.tgl_awal,'%d %b'),' - ',
              date_format(dn.tgl_akhir,'%d %b '),year(dn.tgl_akhir)) as tgl, 
              dn.tujuan,
              (CASE 
                  WHEN dn.status_approval = 'terima' then 'diterima'
                  WHEN dn.status_approval = 'proses' then 'diproses'
                  WHEN dn.status_approval = 'tolak' then 'ditolak'
              END) as status,
              date_format(dn.tgl_konfirm,'dikonfirmasi pada %d %b %Y') as confirm,
              dn.attch,
              r.name as lokasi
              from tb_dinas dn left join regencies r on dn.lokasi = r.id
              where dn.id_karyawan = ${id} and dn.id_koordinator = '${koor}'
              order by dn.created_at desc limit 5
              `
      );
      result.data = dinas[0];
      return result;
    } catch (qError) {
      console.log(qError);
      result.error = true;
      result.data = qError;
      return result;
    }
  }

  /**
   *
   * @param {Object} data
   */
  async insertDinas(data) {
    await db.query(
      `
        insert into tb_dinas set
        `
    );
  }
}

module.exports = Dinas;
