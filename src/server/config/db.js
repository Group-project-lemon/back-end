var mysql = require("mysql");
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "1111",
  database: "stick_lemon",
  port: 3306,
});

module.exports = db;
