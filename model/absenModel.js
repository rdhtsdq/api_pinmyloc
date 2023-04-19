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

const getDataJadwalAbsensi = async (id, koor) => {
  let result = { error: false, data: null };
  // await db.query(`SET @@session.time_zone = "+07:00"`);
  // await db2.query(`SET @@session.time_zone = "+07:00"`);

  if (koor == "mps") {
    try {
      var jadwal = await db.query(
        `
        SELECT
        IF(z.timeOut IS NULL,z.tIn,IF(DATE_ADD(z.timeOut,INTERVAL +6 HOUR) <= CURRENT_TIMESTAMP,z.tIn,'Absen')) as tIn,
        IF(z.timeOut IS NULL,z.lIn,IF(DATE_ADD(z.timeOut,INTERVAL +6 HOUR) <= CURRENT_TIMESTAMP,z.lIn,"")) as lIn,
        IF(z.timeOut IS NULL,z.tOut,IF(DATE_ADD(z.timeOut,INTERVAL +6 HOUR) <= CURRENT_TIMESTAMP,z.tOut,'Absen')) AS tOut,
        IF(z.timeOut IS NULL,z.lOut,IF(DATE_ADD(z.timeOut,INTERVAL +6 HOUR) <= CURRENT_TIMESTAMP,z.lOut,"")) as lOut,
        CURRENT_TIMESTAMP
        FROM (
          SELECT 
                  DATE_FORMAT(d.tIn,'%H:%i') as tIn, d.lIn,
                  IFNULL(DATE_FORMAT(c.checktime,'%H:%i'),'Absen') as tOut, 
                  IFNULL(IF(LENGTH(c.lokasi) > 14,CONCAT(SUBSTR(c.lokasi,1,12),"..."),c.lokasi),IF(c.checktime IS NOT NULL AND c.lokasi is NULL AND c.koordinat is NULL,'Fingerprint','')) as lOut, d.userid,
                  c.checktime as timeOut
                from (
                  SELECT
                    IFNULL(DATE_FORMAT(c.checktime,'%Y-%m-%d %H:%i'), '%Y-%m-%dAbsen') as tIn,
                    IFNULL(DATE_FORMAT(DATE_ADD(c.checktime,INTERVAL +15 HOUR),'%Y-%m-%d %H:%i'), '') as tOut,
                    IFNULL(DATE_FORMAT(c.checktime,'%Y-%m-%d %H:%i'), '') as tMin, 
                    IFNULL(IF(LENGTH(c.lokasi) > 14,CONCAT(SUBSTR(c.lokasi,1,12),"..."),c.lokasi),IF(c.checktime IS NOT NULL AND c.lokasi is NULL AND c.koordinat is NULL,'Fingerprint','')) as lIn, u.userid
                  FROM
                    userinfo u
                    left join checkinout c on c.userid = u.userid and c.checktype = 0 
                      and (
                        DATE_FORMAT(c.checktime,'%Y-%m-%d') = DATE_FORMAT(CURRENT_DATE,'%Y-%m-%d') 
                        or
                        DATE_FORMAT(c.checktime,'%Y-%m-%d') = DATE_FORMAT(DATE_ADD(CURRENT_DATE, INTERVAL -1 DAY),'%Y-%m-%d') 
                      )
                  WHERE
                  u.badgenumber = ${id}
                  ORDER BY c.checktime DESC limit 1
                ) d
                left join checkinout c on c.userid=d.userid and c.checktype=1 and c.checktime BETWEEN d.tIn and d.tOut 
                WHERE CURRENT_TIMESTAMP <= d.tOut
                GROUP BY c.userid limit 1
        ) z`
      );

      let initialResponse = {
        dIn: {
          time: "Absen",
          location: "",
        },
        dOut: {
          time: "Tunggu",
          location: "",
        },
      };

      if (jadwal[0].length > 0) {
        var absen = jadwal[0][0];
        result.data = {
          dIn: {
            time: absen.tIn,
            location: absen.lIn ?? "",
          },
          dOut: {
            time: absen.tOut,
            location: absen.lOut ?? "",
          },
        };
        return result;
      } else {
        result.data = initialResponse;
        return result;
      }
    } catch (error) {
      if (error) {
        result.error = true;
        result.data = error;
        return result;
      }
    }
  } else {
    try {
      var jadwal = await db.query(
        `SET @@session.time_zone = "+07:00";

        SELECT
          DATE_ADD(f.tIn,INTERVAL -2 HOUR) as start,
          DATE_ADD(f.tOut,INTERVAL +6 HOUR ) as end
          FROM (
            SELECT
              CONCAT(DATE_FORMAT(j.tgl,'%Y-%m-%d'),' ',j.tIn) as tIn,
              IF(j.tIn >= j.tOut,CONCAT(DATE_FORMAT(j.next,'%Y-%m-%d')," ",j.tOut),CONCAT(DATE_FORMAT(j.tgl,'%Y-%m-%d')," ",j.tOut)) as tOut
            FROM (
              SELECT
              COALESCE(e.jam_masuk,IF(pr.tipe_jam_kerja = "Shift",ls.jam_masuk,IF(WEEKDAY(CURRENT_DATE) = 6,pr.jam_masuk_1,pr.jam_masuk_2))) as tIn,
              COALESCE(a.time,e.jam_keluar,IF(pr.tipe_jam_kerja = "Shift",ls.jam_keluar,IF(WEEKDAY(CURRENT_DATE) = 6,pr.jam_keluar_1,pr.jam_keluar_2))) as tOut,
              IFNULL(ljs.tgl,CURRENT_DATE) as tgl,
              IFNULL(DATE_ADD(ljs.tgl,INTERVAL +1 DAY),DATE_ADD(CURRENT_DATE,INTERVAL + 1 DAY)) as next
            FROM pegawai p 
            LEFT JOIN pegawai_rule pr ON pr.id_pegawai = p.id_perusahaan AND pr.id_koordinator = p.id_koordinator
            LEFT JOIN list_jadwal_shift ljs ON ljs.id_pegawai = p.id_perusahaan AND ljs.id_koordinator = p.id_koordinator
            LEFT JOIN list_shift ls ON ls.id_koordinator = p.id_koordinator AND ls.no_shift = ljs.no_shift
            LEFT JOIN tb_absen a ON a.id_pegawai = p.id_perusahaan AND a.id_koordinator = p.id_koordinator AND a.status in ('Pulang Lebih Awal') AND (
              CURRENT_DATE BETWEEN a.tgl_awal AND a.tgl_akhir OR CURRENT_DATE BETWEEN DATE_ADD(a.tgl_awal,INTERVAL -1 DAY) AND DATE_ADD(a.tgl_akhir,INTERVAL -1 DAY)
            )
            LEFT JOIN list_event e ON e.id_pegawai = p.id_perusahaan AND e.id_koordinator = p.id_koordinator AND (
              CURRENT_DATE = e.tgl OR CURRENT_DATE = DATE_ADD(e.tgl,INTERVAL - 1 DAY)
            )
            WHERE p.id_perusahaan = '88222002' AND p.id_koordinator = 'gestalt'
            ORDER BY tgl DESC
          ) j
          ) f
            WHERE DATE_FORMAT(CURRENT_TIMESTAMP,'%Y-%m-%d %H:%i') BETWEEN DATE_ADD(f.tIn,INTERVAL -2 HOUR) AND DATE_ADD(f.tOut,INTERVAL +6 HOUR )
            LIMIT 1`
      );

      try {
        //         SET @@session.time_zone = "+07:00";
        // SELECT
        // 	IFNULL(DATE_FORMAT(GROUP_CONCAT(IF(c.checktype=0, checktime,null)),'%H:%i'), 'Absen') as tIn,
        // 	IFNULL(DATE_FORMAT(GROUP_CONCAT(IF(c.checktype=1, checktime,null)),'%H:%i'),
        // 		IF(CURRENT_TIMESTAMP >= DATE_ADD('2023-04-19 22:00:00',INTERVAL -6 HOUR) AND (c.checktype = 0 AND c.checktime != NULL), 'Absen', 'Tunggu')) as tOut,
        // 	IFNULL(GROUP_CONCAT(IF(c.checktype=0, koordinat,null)), '') corIn,
        // 	IFNULL(GROUP_CONCAT(IF(c.checktype=1, koordinat,null)), '') corOut,
        // 	SUBSTRING_INDEX(IFNULL(GROUP_CONCAT(IF(c.checktype=0, lokasi,null)), ''),',',1) locIn,
        // 	SUBSTRING_INDEX(IFNULL(GROUP_CONCAT(IF(c.checktype=1, lokasi,null)), ''),',',1) locOut
        // from userinfo u
        // left join checkinout c on c.userid=u.userid
        // where
        // 	u.badgenumber= 11223344
        // 	and checktime BETWEEN '2023-04-19 06:00:00' and '2023-04-19 22:00:00'
      } catch (err) {}
    } catch (error) {
      if (error) {
        result.error = true;
        result.data = error;
        return result;
      }
    }
  }
};

module.exports = { getDataHistoriAbsensi };
