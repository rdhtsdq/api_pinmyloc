const { response } = require("../utils/response");

const getApproval = (req, res) => {
  var data = { fAlasan: [], fWaktu: [] };
  // data.push();
  data.fAlasan.push({
    id: "Ijin Sakit",
    name: "Ijin Sakit",
    startDays: 0,
    endDays: 3,
    delay: 180,
    settings: {
      vIndication: true,
      vFeel: true,
      vDuraton: true,
      vAttch: true,
      vReason: true,
    },
  });

  data.fAlasan.push({
    id: "Ijin Cuti",
    name: "Ijin Cuti",
    data: [],
    settings: { vDate: true, vReason: true },
  });
  data.fAlasan[data.fAlasan.length - 1].data.push({
    id: "Cuti Tahunan",
    name: "Cuti Tahunan",
    startDays: 3,
    endDays: 30,
    delay: 12,
  });
  data.fAlasan[data.fAlasan.length - 1].data.push({
    id: "Cuti Melahirkan",
    name: "Cuti Melahirkan",
    startDays: 0,
    endDays: 30,
    delay: 90,
  });

  // data.fAlasan.push({'id': 'Ijin Tidak Tepat Waktu', 'name':"Ijin Tidak Tepat Waktu", "data":[],
  //   'settings':{'vDate': true, 'vReason': true, 'vTime':true}
  // });
  data.fAlasan.push({
    id: "Datang Terlambat",
    name: "Datang Terlambat",
    startDays: 0,
    endDays: 3,
    delay: 0,
    settings: { vDate: true, vReason: true, vTime: true, vAttch: true },
  });
  data.fAlasan.push({
    id: "Pulang Lebih Awal",
    name: "Pulang Lebih Awal",
    startDays: 0,
    endDays: 3,
    delay: 0,
    settings: { vDate: true, vReason: true, vTime: true },
  });

  data.fAlasan.push({
    id: "Ijin Khusus",
    name: "Ijin Khusus",
    data: [],
    settings: { vType: true, vDate: true, vReason: true },
  });
  data.fAlasan[data.fAlasan.length - 1].data.push({
    id: "Kedukaan",
    name: "Kedukaan",
    startDays: 0,
    endDays: 7,
    delay: 1,
    settings: { vType: true, vDate: true, vReason: true },
  });
  data.fAlasan[data.fAlasan.length - 1].data.push({
    id: "Menikah",
    name: "Menikah",
    startDays: 0,
    endDays: 30,
    delay: 2,
    settings: { vType: true, vDate: true, vReason: true, vAttch: true },
  });
  data.fAlasan[data.fAlasan.length - 1].data.push({
    id: "Ibadah",
    name: "Ibadah",
    startDays: 0,
    endDays: 30,
    delay: 2,
    settings: { vType: true, vDate: true, vReason: true },
  });
  data.fAlasan[data.fAlasan.length - 1].data.push({
    id: "Pendidikan",
    name: "Pendidikan",
    startDays: 0,
    endDays: 30,
    delay: 179,
    settings: { vType: true, vDate: true, vReason: true, vTime: true },
  });
  data.fAlasan[data.fAlasan.length - 1].data.push({
    id: "Menikahkan/Khinatan Anak",
    name: "Menikahkan/Khinatan Anak",
    startDays: 0,
    endDays: 30,
    delay: 1,
    settings: { vType: true, vDate: true, vReason: true, vAttch: true },
  });
  data.fAlasan[data.fAlasan.length - 1].data.push({
    id: "Istri Melahirkan",
    name: "Istri Melahirkan",
    startDays: 0,
    endDays: 7,
    delay: 1,
    settings: { vType: true, vDate: true, vReason: true, vAttch: true },
  });
  data.fAlasan[data.fAlasan.length - 1].data.push({
    id: "Kehamilan Beresiko",
    name: "Kehamilan Beresiko",
    startDays: 0,
    endDays: 7,
    delay: 89,
    settings: { vType: true, vDate: true, vReason: true, vAttch: true },
  });
  data.fAlasan[data.fAlasan.length - 1].data.push({
    id: "Bencana Alam",
    name: "Bencana Alam",
    startDays: 0,
    endDays: 7,
    delay: 89,
    settings: { vType: true, vDate: true, vReason: true, vAttch: true },
  });
  data.fAlasan[data.fAlasan.length - 1].data.push({
    id: "Ijin Lainnya",
    name: "Ijin Lainnya",
    startDays: 0,
    endDays: 0,
    delay: 2,
    settings: {
      vType: true,
      vDate: true,
      vReason: true,
      notes: "Ijin khusus lainnya ini akan memotong hak cuti tahunan.",
    },
  });

  // data.fAlasan.push({'id': '5', 'name':"Ijin Dinas",
  //   'settings':{'vDate': true, 'vReason': true}
  // });

  data.fWaktu.push({ id: "Sejak siang hari", name: "Sejak siang hari" });
  data.fWaktu.push({ id: "Sejak pagi hari", name: "Sejak pagi hari" });
  data.fWaktu.push({ id: "Sejak kemarin malam", name: "Sejak kemarin malam" });
  data.fWaktu.push({ id: "Sejak kemarin siang", name: "Sejak kemarin siang" });
  data.fWaktu.push({
    id: "Sudah 2 Hari yang lalu",
    name: "Sudah 2 Hari yang lalu",
  });
  data.fWaktu.push({
    id: "Sudah 3 Hari yang lalu",
    name: "Sudah 3 Hari yang lalu",
  });
  data.fWaktu.push({
    id: "Sudah 1 Minggu dirasakan",
    name: "Sudah 1 Minggu dirasakan",
  });
  data.fWaktu.push({
    id: "Sudah 1 Bulan dirasakan",
    name: "Sudah 1 Bulan dirasakan",
  });

  return response(res, true, "form izin", data);
};

module.exports = { getApproval };
