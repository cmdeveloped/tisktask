const dotenv = require("dotenv").config();
const mysql = require("mysql");

// mysql connection created
const db = mysql.createConnection({
  host: "localhost",
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: "tisktask"
});

db.connect(err => {
  if (err) throw err;
});

module.exports = {
  db
};
