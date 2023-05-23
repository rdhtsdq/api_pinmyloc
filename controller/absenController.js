const { response } = require("../utils/response");
const DataAbsen = require("../model/absenModel");
const aws = require("../utils/aws")
const detect = require("../utils/label_detect")
let dataAbsen = new DataAbsen();

/**
 *
 * @param {Date} date
 */
function getLocalIso(date) {
  process.env.TZ = "Asia/Jakarta";
  var z = date.getTimezoneOffset() * 60 * 1000;
  var tLocal = date - z;
  var localDate = new Date(tLocal);
  var iso = localDate.toISOString().split(".")[0].replace("T", " ");
  return iso;
}

const getHistoriAbsensi = async (req, res) => {
  const param = ["id", "koor", "periode"];
  const kosong = param.find((p) => !req.query[p]);

  const query = req.query;

  if (kosong) {
    return response(res, false, `${kosong} kosong`);
  } else {
    var tipe = await dataAbsen.getTipePegawai(query.id);

    if (!tipe.error) {
      let start;
      let end;
      let periode = query.periode.split("-");

      console.log(tipe.data);

      if (tipe.data.tgl_awal > tipe.data.tgl_akhir) {
        let newPeriode =
          periode[0] +
          "-" +
          (parseInt(periode[1]) - 1).toString().padStart(2, "0");

        start = newPeriode + "-" + tipe.data.tgl_akhir;
        end = periode.join("-") + "-" + tipe.data.tgl_awal;
      } else {
        start = periode.join("-") + "-" + tipe.data.tgl_awal;
        end = periode.join("-") + "-" + tipe.data.tgl_akhir;
      }

      if (tipe.data.tipe == "Shift") {
        var absen = await dataAbsen.getDataAbsensiShift(query.id, start, end);
        return response(res, true, "");
      } else {
        var absen = await dataAbsen.getDataAbsensiFulltime(
          query.id,
          start,
          end
        );

        if (!absen.error) {
          return response(res, true, "Data Absensi Pegawai", absen.data);
        } else {
          return response(res, false, "Kendala Server " + absen.data);
        }
      }
    } else {
      return response(res, false, "Kendala Server");
    }
  }
};

const getJadwalAbsensi = async (req, res) => {
  const params = ["id", "koor"];
  const kosong = params.find((p) => !req.query[p]);

  if (kosong) {
    return response(res, false, `${kosong} kosong`);
  } else {
    var data = await dataAbsen.getDataJadwalAbsensi(
      req.query.id,
      req.query.koor
    );
    if (data != undefined) {

      if (data.error != true) {
        return response(res, true, "jadwal absensi", data.data);
      } else {
        return response(res, false, "Kendala server");
      }
    } else {
      return response(res, false, "Kendala server");
    }
  }
};

const check = async (req, res) => {
  const param = ['id', 'koor', 'lat', 'long', 'lokasi', 'type']
  const kosong = param.find((p) => !req.body[p])

  console.log(getLocalIso(new Date()));

  if (kosong) {
    return response(res, false, `${kosong} kosong`, req.body)
  } else {
    const buffer = req.file.buffer
    const type = req.body.type
    const id = req.body.id
    const koor = req.body.koor
    const contentType = req.file.mimetype;
    const lat = req.body.lat
    const long = req.body.long
    const reqLocation = req.body.lokasi
    await dataAbsen.checkLocation(id, lat, long)
      .then(async (d) => {
        if (!d.error) {
          const imageSource = "gms/absen/profile_pict/" + d.data.foto

          if (d.data.lokasi_dinas != null) {
            await checkImage(buffer, type, id, contentType, imageSource).then(async (r) => {
              if (r.data) {
                await dataAbsen.check(id, koor, type == "in" ? 0 : 1, r.data.imageName, `${lat},${long}`, reqLocation).then((d) => {
                  return response(res, !d.error, d.data)
                })
              } else {
                return response(res, false, r.errorMsg)
              }
            })
          } else {
            if (d.data.jarak < 25) {
              await checkImage(buffer, type, id, contentType, imageSource).then(async (r) => {
                if (r.data) {
                  await dataAbsen.check(id, koor, type == "in" ? 0 : 1, r.data.imageName, `${lat},${long}`, d.data.lokasi_absen).then((d) => {
                    return response(res, !d.error, d.data)
                  })
                } else {
                  return response(res, false, r.errorMsg)
                }
              })
            } else {
              return response(res, false, "Absen Ditolak karena diluar area kerja")
            }
          }
        } else {
          return response(res, false, d.data.message ?? d.data)
        }
      })
      .catch((e) => {
        return response(res, false, e)
      })
  }
}

const checkImage = async (buffer, type, id, contentType, imageSource) => {
  let result = { data: null, error: false, errorMsg: "" }
  try {
    const label = await aws.rekog.detectLabels({
      Image: {
        Bytes: buffer,
      }, MaxLabels: 100, MinConfidence: 30,
    }).promise()

    let resultMask = detect.checkMask(label.Labels)
    let resultSelfie = detect.verifySelfie(label.Labels)

    if (resultMask.check) {
      if (resultSelfie.check) {
        try {
          const recognition = await aws.rekog.compareFaces({
            SourceImage: {
              S3Object: {
                Bucket: process.env.BUCKET_NAME,
                Name: imageSource,
              },
            },
            TargetImage: {
              Bytes: buffer,
            },
          }).promise()

          let pictName = getLocalIso(new Date()) + "_" + id + ".jpg"
          let key = `gms/absen/pict_${type}/` + pictName
          const command = aws.command(aws.params(key, buffer, contentType))

          if (recognition.FaceMatches.length > 0 && recognition.FaceMatches[0].Similarity > 70) {
            try {
              await aws.s3.send(command)
              result.data = {
                confirm: true,
                imageName: pictName
              }
              return result
            } catch (error) {
              result.error = true
              result.errorMsg = ""
              console.log(error);
              return result
            }
          } else {
            result.error = true
            result.errorMsg = "Wajah tidak sama silahkan coba lagi"
            return result
          }

        } catch (compErr) {
          let errorpictName = `${getLocalIso(new Date())}_${id}.jpg`;
          let ErrorKey = "gms/test/" + errorpictName;
          const command = aws.command(aws.params(ErrorKey, buffer, contentType));
          await aws.s3.send(command);
          result.error = true
          console.log(compErr);
          result.errorMsg = "Tidak dapat mencocokan wajah"
          return result
        }
      } else {
        let errorpictName = `${getLocalIso(new Date())}_${id}.jpg`;
        let ErrorKey = "gms/test/" + errorpictName;
        const command = aws.command(aws.params(ErrorKey, buffer, contentType));
        await aws.s3.send(command);
        result.error = true
        result.errorMsg = resultSelfie.msg
        return result
      }
    } else {
      let errorpictName = `${getLocalIso(new Date())}_${id}.jpg`;
      let ErrorKey = "gms/test/" + errorpictName;
      const command = aws.command(aws.params(ErrorKey, buffer, contentType));
      await aws.s3.send(command);
      result.error = true
      result.errorMsg = resultMask.msg
      return result
    }

  } catch (labErr) {
    let errorpictName = `${getLocalIso(new Date())}_${id}.jpg`;
    let ErrorKey = "gms/test/" + errorpictName;
    const command = aws.command(aws.params(ErrorKey, buffer, contentType));
    await aws.s3.send(command);
    result.error = true
    console.log(labErr);
    result.errorMsg = "Tidak dapat memindai foto"
    return result
  }
}

module.exports = { getHistoriAbsensi, getJadwalAbsensi, check, };
