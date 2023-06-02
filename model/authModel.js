const db = require("../config/db.config");
const db2 = require("../config/db2.config");

/**
 * Method untuk query login
 * @param {String} userid userid untuk login
 * @param {String} password password untuk login
 */
const login = async (userid, password) => {
  let result = { error: false };

  try {
    let res = await db.query(`
    select 
    pegawai.id_perusahaan as id_pegawai ,
    pegawai.nama,
    pegawai.id_koordinator,
    pegawai.lokasi,
    foto,
    pegawai_rule.sn,
    pegawai_rule.tipe_jam_kerja as tipe 
  from akun_pegawai JOIN pegawai on akun_pegawai.id_perusahaan = pegawai.id_perusahaan 
    left JOIN pegawai_rule on akun_pegawai.id_perusahaan = pegawai_rule.id_pegawai 
  where username = '${userid}' and password = '${password}' and akun_pegawai.status_pegawai = 'Active' LIMIT 1
    `);
    result.data = res[0];
    return result;
  } catch (error) {
    result.error = true;
    result.data = error;
    return result;
  }
};

/**
 * 
 * @param {String} userid 
 * @param {String} password 
 */
const changePassword = async (userid, password) => {
  let result = { data: null, error: false }
  try {
    await db.query("update akun_pegawai set password = ? where id_perusahaan = ? and")
  } catch (error) {
    result.error = true
    result.data = error
    return result
  }
}

module.exports = { login, changePassword };
