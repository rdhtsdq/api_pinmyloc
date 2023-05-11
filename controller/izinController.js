const { response } = require("../utils/response");

const getApproval = (req, res) => {
  var data = {};

  // data.alasan = [
  //   {
  //     name: "Izin Sakit",
  //     startDate: 0,
  //     endDate: 3,
  //     delay: 180,
  //     subSelect: [],
  //     setting: {
  //       date: true,
  //       indication: true,
  //       feel: true,
  //       duration: true,
  //       attach: true,
  //       reason: true,
  //     },
  //   },
  //   {
  //     name: "Izin Cuti",
  //     startDate: 0,
  //     endDate: 3,
  //     delay: 180,
  //     subSelect: [
  //       {
  //         name: "Cuti Tahunan",
  //         startDate: 3,
  //         endDate: 30,
  //         delay: 12,
  //       },
  //       {
  //         name: "Cuti Melahirkan",
  //         startDate: 0,
  //         endDate: 30,
  //         delay: 90,
  //       },
  //     ],
  //     setting: {
  //       date: true,
  //       reason: true,
  //     },
  //   },
  //   {
  //     name: "Datang Terlambat",
  //     startDate: 0,
  //     endDate: 3,
  //     delay: 0,
  //     subSelect: [],
  //     setting: {
  //       date: true,
  //       reason: true,
  //       time: true,
  //       attach: true,
  //     },
  //   },
  //   {
  //     name: "Pulang Lebih Awal",
  //     startDate: 0,
  //     endDate: 3,
  //     delay: 0,
  //     subSelect: [],
  //     setting: {
  //       date: true,
  //       reason: true,
  //       time: true,
  //       attach: true,
  //     },
  //   },
  //   {
  //     name: "Ijin Khusus",
  //     subSelect: [
  //       {
  //         name: "Kedukaan",
  //         startDate: 0,
  //         endDate: 7,
  //         delay: 1,
  //         setting: {
  //           type: true,
  //           date: true,
  //           reason: true,
  //         },
  //       },
  //       {
  //         name: "Menikah",
  //         startDate: 0,
  //         endDate: 30,
  //         delay: 2,
  //         setting: {
  //           type: true,
  //           date: true,
  //           reason: true,
  //           attach: true,
  //         },
  //       },
  //       {
  //         name: "Ibadah",
  //         startDate: 0,
  //         endDate: 30,
  //         delay: 2,
  //         setting: {
  //           type: true,
  //           date: true,
  //           reason: true,
  //         },
  //       },
  //       {
  //         name: "Pendidikan",
  //         startDate: 0,
  //         endDate: 30,
  //         delay: 179,
  //         setting: {
  //           type: true,
  //           date: true,
  //           reason: true,
  //           time: true,
  //         },
  //       },
  //       {
  //         name: "Menikahkan/Khitanan Anak",
  //         startDate: 0,
  //         endDate: 30,
  //         delay: 1,
  //         setting: {
  //           type: true,
  //           date: true,
  //           reason: true,
  //           attach: true,
  //         },
  //       },
  //       {
  //         name: "Istri Melahirkan",
  //         startDate: 0,
  //         endDate: 7,
  //         delay: 1,
  //         setting: {
  //           type: true,
  //           date: true,
  //           reason: true,
  //           attach: true,
  //         },
  //       },
  //       {
  //         name: "Kehamilan Beresiko",
  //         startDate: 0,
  //         endDate: 7,
  //         delay: 89,
  //         setting: {
  //           type: true,
  //           date: true,
  //           reason: true,
  //           attach: true,
  //         },
  //       },
  //       {
  //         name: "Bencana Alam",
  //         startDate: 0,
  //         endDate: 7,
  //         delay: 89,
  //         setting: {
  //           type: true,
  //           date: true,
  //           reason: true,
  //           attach: true,
  //         },
  //       },
  //       {
  //         name: "Ijin Lainnya",
  //         startDate: 0,
  //         endDate: 0,
  //         delay: 2,
  //         setting: {
  //           type: true,
  //           date: true,
  //           reason: true,
  //           notes: "Ijin khusus lainnya ini akan memotong hak cuti tahunan.",
  //         },
  //       },
  //     ],
  //     setting: {
  //       type: true,
  //       date: true,
  //       reason: true,
  //     },
  //   },
  // ];

  // data.duration = [
  //   "Sejak siang hari",
  //   "Sejak pagi hari",
  //   "Sejak kemarin malam",
  //   "Sejak kemarin siang",
  //   "Sudah 2 Hari yang lalu",
  //   "Sudah 3 Hari yang lalu",
  //   "Sudah 1 Minggu dirasakan",
  //   "Sudah 1 Bulan dirasakan",
  // ];

  data.alasan = [
    {
      name: "Izin Sakit",
      dateSetting: {
        start: 0,
        end: 3,
        delay: 180,
      },
      formSetting: {
        subSelect: null,
        date: true,
        indication: true,
        feel: true,
        duration: true,
        attach: true,
        reason: true,
        time: null,
        type: null,
        notes: null,
      },
    },
    {
      name: "Izin Cuti",
      dateSetting: null,
      subSelect: [
        {
          name: "Cuti Tahunan",
          dateSetting: {
            start: 3,
            end: 30,
            delay: 12,
          },
          formSetting: null,
        },
        {
          name: "Cuti Melahirkan",
          dateSetting: {
            start: 0,
            end: 30,
            delay: 30,
          },
          formSetting: null,
        },
      ],
      formSetting: {
        date: true,
        indication: null,
        feel: null,
        duration: null,
        attach: null,
        reason: true,
        time: null,
        type: null,
        notes: null,
      },
    },
    {
      name: "Datang Terlambat",
      dateSetting: {
        start: 0,
        end: 3,
        delay: 0,
      },
      formSetting: {
        subSelect: null,
        date: true,
        indication: null,
        feel: null,
        duration: null,
        attach: true,
        reason: true,
        time: true,
        type: null,
        notes: null,
      },
    },
    {
      name: "Pulang Lebih Awal",
      dateSetting: {
        start: 0,
        end: 3,
        delay: 0,
      },
      formSetting: {
        subSelect: null,
        date: true,
        indication: null,
        feel: null,
        duration: null,
        attach: true,
        reason: true,
        time: true,
        type: null,
        notes: null,
      },
    },
    {
      name: "Izin Khusus",
      dateSetting: null,
      subSelect: [
        {
          name: "Kedukaan",
          dateSetting: {
            start: 0,
            end: 7,
            delay: 1,
          },
          formSetting: {
            subSelect: null,
            date: true,
            indication: null,
            feel: null,
            duration: null,
            attach: null,
            reason: true,
            time: null,
            type: true,
            notes: null,
          },
        },
        {
          name: "Menikah",
          dateSetting: {
            start: 0,
            end: 30,
            delay: 2,
          },
          formSetting: {
            subSelect: null,
            date: true,
            indication: null,
            feel: null,
            duration: null,
            attach: true,
            reason: true,
            time: null,
            type: true,
            notes: null,
          },
        },
        {
          name: "Ibadah",
          dateSetting: {
            start: 0,
            end: 30,
            delay: 2,
          },
          formSetting: {
            subSelect: null,
            date: true,
            indication: null,
            feel: null,
            duration: null,
            attach: null,
            reason: true,
            time: null,
            type: true,
            notes: null,
          },
        },
        {
          name: "Pendidikan",
          dateSetting: {
            start: 0,
            end: 30,
            delay: 179,
          },
          formSetting: {
            subSelect: null,
            date: true,
            indication: null,
            feel: null,
            duration: null,
            attach: null,
            reason: true,
            time: true,
            type: true,
            notes: null,
          },
        },
        {
          name: "Menikahkan/Khitan Anak",
          dateSetting: {
            start: 0,
            end: 30,
            delay: 1,
          },
          formSetting: {
            subSelect: null,
            date: true,
            indication: null,
            feel: null,
            duration: null,
            attach: true,
            reason: true,
            time: null,
            type: true,
            notes: null,
          },
        },
        {
          name: "Istri Melahirkan",
          dateSetting: {
            start: 0,
            end: 7,
            delay: 1,
          },
          formSetting: {
            subSelect: null,
            date: true,
            indication: null,
            feel: null,
            duration: null,
            attach: true,
            reason: true,
            time: null,
            type: true,
            notes: null,
          },
        },
        {
          name: "Kehamilan Beresiko",
          dateSetting: {
            start: 0,
            end: 7,
            delay: 89,
          },
          formSetting: {
            subSelect: null,
            date: true,
            indication: null,
            feel: null,
            duration: null,
            attach: true,
            reason: true,
            time: null,
            type: true,
            notes: null,
          },
        },
        {
          name: "Bencana Alam",
          dateSetting: {
            start: 0,
            end: 7,
            delay: 89,
          },
          formSetting: {
            subSelect: null,
            date: true,
            indication: null,
            feel: null,
            duration: null,
            attach: true,
            reason: true,
            time: null,
            type: true,
            notes: null,
          },
        },
        {
          name: "Ijin Lainnya",
          dateSetting: {
            start: 0,
            end: 0,
            delay: 2,
          },
          formSetting: {
            subSelect: null,
            date: true,
            indication: null,
            feel: null,
            duration: null,
            attach: null,
            reason: true,
            time: null,
            type: true,
            notes: "Ijin khusus lainnya ini akan memotong hak cuti tahunan.",
          },
        },
      ],
      date: null,
      indication: null,
      feel: null,
      duration: null,
      attach: null,
      reason: null,
      time: null,
      type: null,
      notes: null,
    },
  ];

  data.duration = [
    "Sejak siang hari",
    "Sejak pagi hari",
    "Sejak kemarin malam",
    "Sejak kemarin siang",
    "Sudah 2 Hari yang lalu",
    "Sudah 3 Hari yang lalu",
    "Sudah 1 Minggu dirasakan",
    "Sudah 1 Bulan dirasakan",
  ];

  // var data = { fAlasan: [], fWaktu: [] };
  // // data.push();
  // data.fAlasan.push({
  //   id: "Ijin Sakit",
  //   name: "Ijin Sakit",
  //   startDays: 0,
  //   endDays: 3,
  //   delay: 180,
  //   settings: {
  //     vIndication: true,
  //     vFeel: true,
  //     vDuraton: true,
  //     vAttch: true,
  //     vReason: true,
  //   },
  // });

  // data.fAlasan.push({
  //   id: "Ijin Cuti",
  //   name: "Ijin Cuti",
  //   data: [],
  //   settings: { vDate: true, vReason: true },
  // });
  // data.fAlasan[data.fAlasan.length - 1].data.push({
  //   id: "Cuti Tahunan",
  //   name: "Cuti Tahunan",
  //   startDays: 3,
  //   endDays: 30,
  //   delay: 12,
  // });
  // data.fAlasan[data.fAlasan.length - 1].data.push({
  //   id: "Cuti Melahirkan",
  //   name: "Cuti Melahirkan",
  //   startDays: 0,
  //   endDays: 30,
  //   delay: 90,
  // });

  // // data.fAlasan.push({'id': 'Ijin Tidak Tepat Waktu', 'name':"Ijin Tidak Tepat Waktu", "data":[],
  // //   'settings':{'vDate': true, 'vReason': true, 'vTime':true}
  // // });
  // data.fAlasan.push({
  //   id: "Datang Terlambat",
  //   name: "Datang Terlambat",
  //   startDays: 0,
  //   endDays: 3,
  //   delay: 0,
  //   settings: { vDate: true, vReason: true, vTime: true, vAttch: true },
  // });
  // data.fAlasan.push({
  //   id: "Pulang Lebih Awal",
  //   name: "Pulang Lebih Awal",
  //   startDays: 0,
  //   endDays: 3,
  //   delay: 0,
  //   settings: { vDate: true, vReason: true, vTime: true },
  // });

  // data.fAlasan.push({
  //   id: "Ijin Khusus",
  //   name: "Ijin Khusus",
  //   data: [],
  //   settings: { vType: true, vDate: true, vReason: true },
  // });
  // data.fAlasan[data.fAlasan.length - 1].data.push({
  //   id: "Kedukaan",
  //   name: "Kedukaan",
  //   startDays: 0,
  //   endDays: 7,
  //   delay: 1,
  //   settings: { vType: true, vDate: true, vReason: true },
  // });
  // data.fAlasan[data.fAlasan.length - 1].data.push({
  //   id: "Menikah",
  //   name: "Menikah",
  //   startDays: 0,
  //   endDays: 30,
  //   delay: 2,
  //   settings: { vType: true, vDate: true, vReason: true, vAttch: true },
  // });
  // data.fAlasan[data.fAlasan.length - 1].data.push({
  //   id: "Ibadah",
  //   name: "Ibadah",
  //   startDays: 0,
  //   endDays: 30,
  //   delay: 2,
  //   settings: { vType: true, vDate: true, vReason: true },
  // });
  // data.fAlasan[data.fAlasan.length - 1].data.push({
  //   id: "Pendidikan",
  //   name: "Pendidikan",
  //   startDays: 0,
  //   endDays: 30,
  //   delay: 179,
  //   settings: { vType: true, vDate: true, vReason: true, vTime: true },
  // });
  // data.fAlasan[data.fAlasan.length - 1].data.push({
  //   id: "Menikahkan/Khinatan Anak",
  //   name: "Menikahkan/Khinatan Anak",
  //   startDays: 0,
  //   endDays: 30,
  //   delay: 1,
  //   settings: { vType: true, vDate: true, vReason: true, vAttch: true },
  // });
  // data.fAlasan[data.fAlasan.length - 1].data.push({
  //   id: "Istri Melahirkan",
  //   name: "Istri Melahirkan",
  //   startDays: 0,
  //   endDays: 7,
  //   delay: 1,
  //   settings: { vType: true, vDate: true, vReason: true, vAttch: true },
  // });
  // data.fAlasan[data.fAlasan.length - 1].data.push({
  //   id: "Kehamilan Beresiko",
  //   name: "Kehamilan Beresiko",
  //   startDays: 0,
  //   endDays: 7,
  //   delay: 89,
  //   settings: { vType: true, vDate: true, vReason: true, vAttch: true },
  // });
  // data.fAlasan[data.fAlasan.length - 1].data.push({
  //   id: "Bencana Alam",
  //   name: "Bencana Alam",
  //   startDays: 0,
  //   endDays: 7,
  //   delay: 89,
  //   settings: { vType: true, vDate: true, vReason: true, vAttch: true },
  // });
  // data.fAlasan[data.fAlasan.length - 1].data.push({
  //   id: "Ijin Lainnya",
  //   name: "Ijin Lainnya",
  //   startDays: 0,
  //   endDays: 0,
  //   delay: 2,
  //   settings: {
  //     vType: true,
  //     vDate: true,
  //     vReason: true,
  //     notes: "Ijin khusus lainnya ini akan memotong hak cuti tahunan.",
  //   },
  // });

  // // data.fAlasan.push({'id': '5', 'name':"Ijin Dinas",
  // //   'settings':{'vDate': true, 'vReason': true}
  // // });

  // data.fWaktu.push({ id: "Sejak siang hari", name: "Sejak siang hari" });
  // data.fWaktu.push({ id: "Sejak pagi hari", name: "Sejak pagi hari" });
  // data.fWaktu.push({ id: "Sejak kemarin malam", name: "Sejak kemarin malam" });
  // data.fWaktu.push({ id: "Sejak kemarin siang", name: "Sejak kemarin siang" });
  // data.fWaktu.push({
  //   id: "Sudah 2 Hari yang lalu",
  //   name: "Sudah 2 Hari yang lalu",
  // });
  // data.fWaktu.push({
  //   id: "Sudah 3 Hari yang lalu",
  //   name: "Sudah 3 Hari yang lalu",
  // });
  // data.fWaktu.push({
  //   id: "Sudah 1 Minggu dirasakan",
  //   name: "Sudah 1 Minggu dirasakan",
  // });
  // data.fWaktu.push({
  //   id: "Sudah 1 Bulan dirasakan",
  //   name: "Sudah 1 Bulan dirasakan",
  // });

  return response(res, true, "form izin", data);
};

module.exports = { getApproval };
