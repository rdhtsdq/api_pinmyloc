require("dotenv").config();
const mysql = require("mysql2/promise");
const connection = mysql.createPool({
  host: process.env.DB2_HOST,
  user: process.env.DB2_USER,
  password: process.env.DB2_PWD,
  database: process.env.DB2_NAME,
});

module.exports = connection;
