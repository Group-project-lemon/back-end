const mysql = require('mysql2');
const db = mysql.createPool({
  host : process.env.host, 
  port : process.env.port, 
  user : process.env.user, 
  password : process.env.db_pass, 
  database : process.env.db_name
});

module.exports = db;