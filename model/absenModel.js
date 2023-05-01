const db = require("../config/db.config");
const db2 = require("../config/db2.config");
class DataAbsen {
  /**
   * Method get histori absensi
   * @param {String} id id pegawai
   * @param {String} koor id koordinator
   * @param {String} periode periode absensi
   */
  async getDataHistoriAbsensi(id, koor, periode) {
    let result = { error: false, data: null };
    // result.error = true;
    // result.data = "Kendala server";
    // return result;

    try {
      const jadwal = await db.query(
        `
        select
        COALESCE(e.jam_masuk,if(pr.tipe_jam_kerja = 'Shift',s.jam_masuk,if(weekday(CURRENT_DATE) = 6,pr.jam_masuk_2,pr.jam_masuk_1))) as masuk,
        COALESCE(e.jam_keluar,if(pr.tipe_jam_kerja = 'Shift',s.jam_keluar,if(weekday(CURRENT_DATE) = 6,pr.jam_keluar_2,pr.jam_keluar_1))) as pulang,
        COALESCE(ls.tgl,e.tgl,CURRENT_DATE) as tgl,
        pr.tgl_awal,
        pr.tgl_akhir
        from
          pegawai p
          left join pegawai_rule pr on p.id_perusahaan = pr.id_pegawai and p.id_koordinator = pr.id_koordinator
          left join list_jadwal_shift ls on p.id_perusahaan = ls.id_pegawai and p.id_koordinator = ls.id_koordinator
          left join list_shift s on ls.no_shift = s.no_shift and ls.id_koordinator = s.id_koordinator
          left join list_event e on p.id_perusahaan = e.id_pegawai and e.id_koordinator = p.id_koordinator
        where p.id_perusahaan = ${id} and p.id_koordinator = '${koor}'
        `
      );
    } catch (jError) {}
  }

  /**
   * Method get jadwal absensi
   * @param {String} id id pegawai
   * @param {String} koor id koordinator
   * @returns
   */
  async getDataJadwalAbsensi(id, koor) {
    let result = { error: false, data: null };

    await db.query(`SET @@session.time_zone = "+07:00"`);
    await db2.query(`SET @@session.time_zone = "+07:00"`);

    if (koor == "mps") {
      try {
        var jadwal = await db2.query(
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
          console.log(error);
          result.error = true;
          result.data = error;
          return result;
        }
      }
    } else {
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
      try {
        var rowJadwal = await db.query(
          `
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
            ) AND status_verifikasi like '%terima%' 
            LEFT JOIN list_event e ON e.id_pegawai = p.id_perusahaan AND e.id_koordinator = p.id_koordinator AND (
              CURRENT_DATE = e.tgl OR CURRENT_DATE = DATE_ADD(e.tgl,INTERVAL - 1 DAY)
            )
            WHERE p.id_perusahaan = ${id} AND p.id_koordinator = '${koor}'
            ORDER BY tgl DESC
          ) j
          ) f
            WHERE DATE_FORMAT(CURRENT_TIMESTAMP,'%Y-%m-%d %H:%i') BETWEEN DATE_ADD(f.tIn,INTERVAL -2 HOUR) AND DATE_ADD(f.tOut,INTERVAL +6 HOUR )
            LIMIT 1`
        );

        if (rowJadwal[0].length > 0) {
          var jw = rowJadwal[0][0];
          try {
            var ab = await db2.query(
              `
            SELECT
              IFNULL(DATE_FORMAT(GROUP_CONCAT(IF(c.checktype=0, checktime,null)),'%H:%i'), 'Absen') as tIn,
              IFNULL(DATE_FORMAT(GROUP_CONCAT(IF(c.checktype=1, checktime,null)),'%H:%i'),
                IF(CURRENT_TIMESTAMP >= DATE_ADD(?,INTERVAL -6 HOUR) AND (c.checktype = 0 AND c.checktime != NULL), 'Absen', 'Tunggu')) as tOut,
              IFNULL(GROUP_CONCAT(IF(c.checktype=0, koordinat,null)), '') corIn,
              IFNULL(GROUP_CONCAT(IF(c.checktype=1, koordinat,null)), '') corOut,
              SUBSTRING_INDEX(IFNULL(GROUP_CONCAT(IF(c.checktype=0, lokasi,null)), ''),',',1) locIn,
              SUBSTRING_INDEX(IFNULL(GROUP_CONCAT(IF(c.checktype=1, lokasi,null)), ''),',',1) locOut
            from userinfo u
            left join checkinout c on c.userid=u.userid
            where
              u.badgenumber= ?
              and checktime BETWEEN ? and ?
            `,
              [jw.end, id, jw.start, jw.end]
            );

            initialResponse.dIn.time = ab[0][0].tIn;
            initialResponse.dIn.location = ab[0][0].locIn;
            initialResponse.dOut.time = ab[0][0].tOut;
            initialResponse.dOut.location = ab[0][0].locOut;

            result.data = initialResponse;
            console.log(result.data);
            return result;
          } catch (err) {
            if (err) {
              console.log(err);
              result.error = true;
              result.data = err;
              return result;
            }
          }
        } else {
          result.data = "Tidak ada jadwal kerja";
          console.log(result.data);
          return result;
        }
      } catch (error) {
        if (error) {
          console.log(error);
          result.error = true;
          result.data = error;
          return result;
        }
      }
    }
  }
}

module.exports = DataAbsen;
