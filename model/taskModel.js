const db = require("../config/db.config");
const db2 = require("../config/db2.config");

class TaskModel {
  /**
   * Method get task
   * @param {String} id id pegawai
   * @param {String} limt id koordinator
   */
  async getTask(id, limit) {
    let result = { error: false, data: null };

    try {
      let task = await db.query(
        `
        select
        dt.title,
        ifnull(dt.notes,"") as notes,
        date_format(dt.end,'%d %M %Y') as end,
        ac.status as empStatus,
        if(ac.status = "Waiting",false,true) as checked,
        dt.status
        from
          d_task dt
          left join acc_task ac on dt.id = ac.id_task
        where ac.id_pegawai = ${id}
        order by dt.end desc
        limit ${limit}
        `
      );

      result.data = task[0];
      return result;
    } catch (error) {
      console.log(error);
      result.error = true;
      result.data = error;
      return result;
    }
  }
}

module.exports = TaskModel;
