const db = require("../config/db.config")

class Event {

    async getEvent() {
        let result = {data:null,error:false}

        try {
            var event = await db.query(`SELECT tgl as date,keterangan as name FROM list_libur where id_koordinator = '${req.query.koor}' AND YEAR(tgl) = YEAR(CURRENT_DATE) ORDER BY tgl ASC`)
            var json = event[0]
        
            var groupedData = {};
            for (var i = 0; i < json.length; i++) {
              var date = new Date(json[i].date);
              var month = date.getMonth() + 1; // Mengembalikan bulan dari 0-11, jadi ditambah 1
              var year = date.getFullYear();
        
              var key = year + '-' + (month < 10 ? '0' + month : month) + '-01' ; // Format 'YYYY-MM'
        
              if (!groupedData[key]) {
                groupedData[key] = [];
              }
              groupedData[key].push(json[i]);
            }

            result.data = groupedData
            return result
        
          } catch (error) {
            console.log(error);
            result.error = true
            result.data = error
            return result
          }
    }
}