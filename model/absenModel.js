const db = require("../config/db.config");
const db2 = require("../config/db2.config");

/**
 * Fungsi untuk menjalankan query untuk mengambil data histori absensi
 * @param {String} id id pegawai1
 * @param {String} koor id koordinator
 * @param {String} search id koordinator
 */
const getDataHistoriAbsensi = async (id, koor, search) => {
  let result = { error: false, data: null };

  if (koor == "mps") {
    try {
      let d = await db.query(
        `
            SELECT GROUP_CONCAT(CAST( p.id_perusahaan AS UNSIGNED )) AS ids,
            IF(DAY (CURRENT_DATE ) < CAST( d.akhir AS UNSIGNED )  AND DAY (CURRENT_DATE) != CAST( d.awal AS UNSIGNED ),
              CONCAT( DATE_FORMAT( DATE_ADD(CURRENT_DATE, INTERVAL - 1 MONTH ), '%Y-%m-' ), d.awal ),
            IF(DAY (CURRENT_DATE) >= CAST( d.awal AS UNSIGNED ),CONCAT( DATE_FORMAT(CURRENT_DATE, '%Y-%m-' ), d.awal ),
              CONCAT( DATE_FORMAT( DATE_ADD(CURRENT_DATE, INTERVAL - 1 MONTH ), '%Y-%m-' ), d.awal )) ) AS awal,
            IF(DAY (CURRENT_DATE ) >= CAST( d.awal AS UNSIGNED ),CONCAT( DATE_FORMAT( DATE_ADD(CURRENT_DATE, INTERVAL 1 MONTH ), '%Y-%m-' ), d.akhir ),
              CONCAT( DATE_FORMAT(CURRENT_DATE, '%Y-%m-' ), d.akhir )) AS akhir 
            FROM
              pegawai p
              JOIN (SELECT p.nik,p.id_koordinator,p.id_perusahaan,pr.tgl_awal AS awal,pr.tgl_akhir AS akhir 
              FROM
                pegawai p
                JOIN pegawai_rule pr ON p.id_perusahaan = pr.id_pegawai 
              WHERE
              id_perusahaan = ?) d ON p.nik = d.nik
          `,
        [id]
      );

      var data = d[0][0];
      try {
        var ab = await db2.query(
          `SELECT
                REPLACE(DATE_FORMAT(d.tgl,'%W,  %d %b %Y' ),'Peb','Feb') as tgl,
                d.jam_masuk,d.fpin,
                IFNULL( DATE_FORMAT( c.checktime, '%H:%i' ),IF(CURRENT_TIMESTAMP > d.endShift,"Tidak Absen","Tunggu")) as jam_keluar,
                IFNULL(IF(LENGTH(c.lokasi) > 14,CONCAT(SUBSTR(c.lokasi,1,12),"..."),c.lokasi),IF(c.checktime = NULL,'',IF(c.koordinat = NULL AND c.lokasi = null,'Fingerprint',''))) AS fpout
               FROM(
                SELECT DATE( c.checktime ) AS tgl,DATE_FORMAT( c.checktime, '%H:%i' ) AS jam_masuk,
                IFNULL(IF(LENGTH(c.lokasi) > 14,CONCAT(SUBSTR(c.lokasi,1,12),"..."),c.lokasi),IF(c.koordinat is NULL OR c.koordinat = '','Fingerprint','')) AS fpin,
                DATE_ADD( c.checktime, INTERVAL - 2 HOUR ) AS startShift,
                DATE_ADD( c.checktime, INTERVAL + 15 HOUR ) AS endShift,
                u.userid 
               FROM userinfo u LEFT JOIN checkinout c ON u.userid = c.userid 
               WHERE
                 u.badgenumber in (${data.ids})
                 AND c.checktype = 0 ORDER BY tgl DESC ) d LEFT JOIN checkinout c ON d.userid = c.userid 
               AND c.checktype = 1 
               AND c.checktime BETWEEN d.startShift 
               AND d.endShift
               WHERE ${
                 search
                   ? `REPLACE(DATE_FORMAT(d.tgl,'%W, %d %b %Y'),'Peb','Feb') LIKE '%${search}%'`
                   : `d.tgl BETWEEN '${data.awal}'  AND '${data.akhir}'`
               } GROUP BY DATE(d.tgl) ORDER BY d.tgl DESC LIMIT 100`
        );

        result.data = ab[0];
        return result;
      } catch (err) {
        if (err) {
          console.log(err);
          result.data = err;
          result.error = true;
        }
      }
    } catch (error) {
      if (error) {
        console.log(error);
        result.error = true;
        result.data = error;
        return result;
      }
    }
  } else {
    try {
      let jData = await db.query(
        `
      SELECT *
      from (
          SELECT *,
          IFNULL(DATE_FORMAT(DATE_ADD(CONCAT(d.date, ' ', d.tIn),INTERVAL -2 HOUR), '%Y-%m-%d %H:%i'), DATE_FORMAT(CONCAT(d.date, ' ',d.tIn - '02:00'),'%Y-%m-%d %H:%i')) as start,
            IFNULL(DATE_FORMAT(DATE_ADD(CONCAT(if(d.tIn >= d.tOut, DATE_FORMAT(d.next,'%Y-%m-%d'),DATE_FORMAT(d.date,'%Y-%m-%d')), ' ', d.tOut), INTERVAL + 6 HOUR), '%Y-%m-%d %H:%i'), CONCAT(DATE_ADD(d.date,INTERVAL +1 DAY), ' ', DATE_FORMAT(ADDTIME(d.tOut, "06:00"),'%H:%i'))) as end
          from (
              SELECT 
                IF(pr.tipe_jam_kerja='Shift', ls.jam_masuk, pr.jam_masuk_1) as tIn,
                IF(pr.tipe_jam_kerja='Shift', ls.jam_keluar, pr.jam_keluar_1) as tOut, 
                pr.tipe_jam_kerja as type,
                IFNULL(s.tgl,DATE_FORMAT(CURRENT_DATE,'%Y-%m-%d'))  as date, DATE_FORMAT(DATE_ADD(s.tgl,INTERVAL + 1 DAY),'%Y-%m-%d') as next,
                IF
                  (
                    DATE_FORMAT( CURRENT_DATE, '%Y-%m-%d' ) >= CONCAT( DATE_FORMAT( CURRENT_DATE, '%Y-%m-' ), pr.tgl_akhir ),
                    CONCAT( DATE_FORMAT( CURRENT_DATE, '%Y-%m-' ), pr.tgl_awal ),
                    CONCAT( DATE_FORMAT( DATE_ADD( CURRENT_DATE, INTERVAL - 1 MONTH ), '%Y-%m-' ), pr.tgl_akhir ) 
                  ) as sDate,
                IF
                  (
                    DATE_FORMAT( CURRENT_DATE, '%Y-%m-%d' ) >= CONCAT( DATE_FORMAT( CURRENT_DATE, '%Y-%m-' ), pr.tgl_akhir ),
                    CONCAT( DATE_FORMAT( DATE_ADD( CURRENT_DATE, INTERVAL 1 MONTH ), '%Y-%m-' ), pr.tgl_akhir ),
                    CONCAT( DATE_FORMAT( CURRENT_DATE, '%Y-%m-' ), pr.tgl_awal ) 
                  ) as eDate
              from pegawai p
              join pegawai_rule pr on pr.id_pegawai=p.id_perusahaan and pr.id_koordinator=p.id_koordinator
              left join list_jadwal_shift s on 
                  s.id_pegawai=p.id_perusahaan and s.id_koordinator=p.id_koordinator 
                  and s.tgl <= CURRENT_DATE
                  AND s.tgl BETWEEN
                      IF
                        (
                          DATE_FORMAT( CURRENT_DATE, '%Y-%m-%d' ) >= CONCAT( DATE_FORMAT( CURRENT_DATE, '%Y-%m-' ), pr.tgl_akhir ),
                          CONCAT( DATE_FORMAT( CURRENT_DATE, '%Y-%m-' ), pr.tgl_awal ),
                          CONCAT( DATE_FORMAT( DATE_ADD( CURRENT_DATE, INTERVAL - 1 MONTH ), '%Y-%m-' ), pr.tgl_akhir ) 
                        ) 
                      AND
                      IF
                        (
                          DATE_FORMAT( CURRENT_DATE, '%Y-%m-%d' ) >= CONCAT( DATE_FORMAT( CURRENT_DATE, '%Y-%m-' ), pr.tgl_akhir ),
                          CONCAT( DATE_FORMAT( DATE_ADD( CURRENT_DATE, INTERVAL 1 MONTH ), '%Y-%m-' ), pr.tgl_akhir ),
                          CONCAT( DATE_FORMAT( CURRENT_DATE, '%Y-%m-' ), pr.tgl_awal ) 
                        )
              left join list_shift ls on ls.no_shift=s.no_shift and ls.id_koordinator=p.id_koordinator
  
              where p.id_perusahaan= ?  and p.id_koordinator= ?
              ORDER BY IFNULL(s.tgl, DATE_FORMAT(CURRENT_DATE,'%Y-%m-%d')) DESC
  
              limit 100
          ) d
      ) d
      `,
        [id, koor]
      );
      var data = [];

      if (jData[0].length > 0) {
        try {
          var c = 0;

          for (var i = 0; i < jData[0].length; i++) {
            const temp = jData[0][i];
            await db2
              .query(
                `
              SELECT 
                REPLACE( DATE_FORMAT( IF('Full Time' = 'Full Time', DATE_FORMAT(checktime,'%Y-%m-%d'), '` +
                  temp.date +
                  `'), '%W,  %d %b %Y' ), 'Peb', 'Feb' ) as tgl,
                IFNULL(DATE_FORMAT(GROUP_CONCAT(IF(c.checktype=0, checktime,null)),'%H:%i'), 'Absen') as tIn,  
                IFNULL(DATE_FORMAT(GROUP_CONCAT(IF(c.checktype=1, checktime,null)),'%H:%i'), IF(CURRENT_TIME >= '` +
                  temp.tOut +
                  `', 'Absen', '-')) as tOut,
                IFNULL(GROUP_CONCAT(IF(c.checktype=0, koordinat,null)), '') corIn,
                IFNULL(GROUP_CONCAT(IF(c.checktype=1, koordinat,null)), '') corOut,
                SUBSTRING_INDEX(IFNULL(GROUP_CONCAT(IF(c.checktype=0, lokasi,null)), ''),',',1) locIn,
                SUBSTRING_INDEX(IFNULL(GROUP_CONCAT(IF(c.checktype=1, lokasi,null)), ''),',',1) locOut,
                IF(DATE_FORMAT(checktime,'%Y-%m-%d') = DATE_FORMAT(CURRENT_DATE,'%Y-%m-%d'), 'now', 'last') as now
              from userinfo u
              left join checkinout c on c.userid=u.userid
  
              where 
                u.badgenumber= ` +
                  id +
                  `
                and ( 
                  (
                    '` +
                  search +
                  `' = '' and
                    '` +
                  temp.type +
                  `' = 'Shift' and
                    checktime BETWEEN '` +
                  temp.start +
                  `' and '` +
                  temp.end +
                  `'
                  ) or
                  (
                    '` +
                  search +
                  `' = '' and
                    '` +
                  temp.type +
                  `' = 'Full Time' and
                    checktime BETWEEN '` +
                  temp.sDate +
                  `' and '` +
                  temp.eDate +
                  `'
                  )
                  or 
                  (
                    '` +
                  search +
                  `' != '' and
                    REPLACE( DATE_FORMAT( IF('Full Time' = 'Full Time', DATE_FORMAT(checktime,'%Y-%m-%d'), '` +
                  temp.date +
                  `'), '%W,  %d %b %Y' ), 'Peb', 'Feb' ) like '%` +
                  search +
                  `%'
                  )
                )
                
              GROUP BY IF('` +
                  temp.type +
                  `' = 'Full Time', DATE_FORMAT(checktime,'%Y-%m-%d'), '` +
                  temp.date +
                  `')
              ORDER BY IF('` +
                  temp.type +
                  `' = 'Full Time', DATE_FORMAT(checktime,'%Y-%m-%d'), '` +
                  temp.date +
                  `') DESC
  
              limit 100
          `
              )
              .then((data1) => {
                c++;
                if (data1[0].length > 0) {
                  for (var j = 0; j < data1[0].length; j++) {
                    if (
                      data1[0][j].tIn != "Absen" &&
                      data1[0][j].tOut != "Absen"
                    ) {
                      data.push({
                        tgl: data1[0][j].tgl,
                        jam_masuk: data1[0][j].tIn,
                        jam_keluar: data1[0][j].tOut,
                        fpin:
                          data1[0][j].locIn == "" &&
                          data1[0][j].corIn != "" &&
                          data1[0][j].tIn != "-"
                            ? "Fingerprint"
                            : data1[0][j].locIn == "" &&
                              data1[0][j].tIn != "Absen" &&
                              data1[0][j].tIn != "-"
                            ? "Fingerprint"
                            : data1[0][j].tIn == "-" && data1[0][j].now != "now"
                            ? "Tidak Absen"
                            : data1[0][j].locIn,
                        fpout:
                          data1[0][j].locOut == "" &&
                          data1[0][j].corOut != "" &&
                          data1[0][j].tOut != "-"
                            ? "Fingerprint"
                            : data1[0][j].locOut == "" &&
                              data1[0][j].tOut != "Absen" &&
                              data1[0][j].tOut != "Tunggu" &&
                              data1[0][j].tOut != "-"
                            ? "Fingerprint"
                            : data1[0][j].tOut == "-" &&
                              data1[0][j].now != "now"
                            ? "Tidak Absen"
                            : data1[0][j].locOut,
                      });
                    }
                  }
                }
                if (c == jData[0].length) {
                  result.data = data;
                  return result;
                }
              })
              .catch((error) => {
                c++;
                if (c == jData[0].length) {
                  result.data = data;
                  return result;
                }
              });
          }
        } catch (e) {
          result.data = e;
          result.error = true;
          return result;
        }
      } else {
        result.data = "Tidak ada jadwal kerja";
        result.error = true;
        return result;
      }
    } catch (error) {
      if (error) {
        console.log(error);
        result.error = true;
        result.data = error;
      }
    }
  }
};

module.exports = { getDataHistoriAbsensi };
