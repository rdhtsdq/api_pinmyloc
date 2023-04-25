const { response } = require("../utils/response");
const TaskModel = require("../model/taskModel");

const task = new TaskModel();

const getDashboardTask = async (req, res) => {
  const params = ["id"];
  const kosong = params.find((p) => !req.query[p]);

  if (kosong) {
    return response(res, false, `${kosong} kosong`);
  } else {
    var data = await task.getTask(req.query.id, 5);
    if (data.error != true) {
      var newData =
        data.data != null
          ? data.data.map((e) => {
              e.checked = e.checked == 1 ? true : false;
              return e;
            })
          : [];

      return response(res, true, "data target kerja dashboard", newData);
    } else {
      return response(res, false, "Kendala server");
    }
  }
};

const getTask = async (req, res) => {
  const params = ["id", "page"];
  const kosong = params.find((p) => !req.query[p]);

  if (kosong) {
    return response(res, false, `${kosong} kosong`);
  } else {
    var data = await task.getTask(req.query.id, `${req.query.page},10`);
    if (data.error != true) {
      var task =
        data.data != null
          ? data.data.map((e) => {
              e.checked = e.checked == 1 ? true : false;
              return e;
            })
          : [];

      console.log(task);

      return response(res, true, "data target kerja dashboard", task);
    } else {
      return response(res, false, "Kendala server");
    }
  }
};

module.exports = { getDashboardTask, getTask };
