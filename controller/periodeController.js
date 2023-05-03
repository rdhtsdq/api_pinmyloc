const { response } = require("../utils/response");

function padTo2Digits(num) {
  return num.toString().padStart(2, "0");
}

function formatDate(date) {
  return [date.getFullYear(), padTo2Digits(date.getMonth() + 1)].join("-");
}

const periode = (req, res) => {
  var data = [];
  var date = new Date();

  date = new Date(date.setMonth(date.getMonth() + 1));
  data.push({
    id: formatDate(date),
    title: date.toLocaleString("ID", { month: "short", year: "numeric" }),
  });

  for (var i = 0; i < 7; i++) {
    date = new Date(date.setMonth(date.getMonth() - 1));

    if (data[data.length - 1].id != formatDate(date)) {
      data.push({
        id: formatDate(date),
        title: date.toLocaleString("ID", { month: "short", year: "numeric" }),
      });
    }
  }

  return response(res, true, "data periode", data);
};

module.exports = { periode };
