/**
 *
 * @param {Array} data
 * @returns
 */
function checkMask(data) {
  let check = true;
  let msg = "";
  for (let key in data) {
    if (data[key].Name == "Mask" && data[key].Confidence > 50) {
      check = false;
      msg = "Masker Terdeteksi Harap Lepaskan Masker";
      break;
    }
  }
  return { check, msg };
}

/**
 *
 * @param {Array} data
 * @returns
 */
function selfieCheck(data) {
  let check = false;
  let msg = "Sistem Tidak Mendeteksi Adanya Wajah";
  for (let key in data) {
    if (
      (data[key].Name == "Person" && data[key].Confidence > 70) ||
      (data[key].Name == "Face" && data[key].Confidence > 70) ||
      (data[key].Name == "Selfie" && data[key].Confidence > 30)
    ) {
      check = true;
      msg = "";
      break;
    }
  }
  return { check, msg };
}
/**
 *
 * @param {Array} data
 * @returns
 */
function verifySelfie(data) {
  let check = true;
  let msg = "";
  for (let key in data) {
    if (data[key].Name == "Selfie" && data[key].Confidence > 70) {
      break;
    }

    if (
      (data[key].Name == "License" && data[key].Confidence > 50) ||
      (data[key].Name == "Passport" && data[key].Confidence > 50) ||
      (data[key].Name == "Mobile Phone" && data[key].Confidence > 50) ||
      (data[key].Name == "Photo Booth" && data[key].Confidence > 50) ||
      (data[key].Name == "Id Cards" && data[key].Confidence > 50) ||
      (data[key].Name == "File Folder" && data[key].Confidence > 50) ||
      (data[key].Name == "Mask" && data[key].Confidence > 50) ||
      (data[key].Name == "Selfie" && data[key].Confidence <= 40)
    ) {
      check = false;
      msg = `Foto Ditolak\nSistem Mendeteksi Adanya ${data[key].Name} dengan Tingkat Confidence Sebesar ${data[key].Confidence}\nHarap Ulangi Foto`;
      break;
    }
  }

  return { check, msg };
}
module.exports = { checkMask, selfieCheck, verifySelfie };
