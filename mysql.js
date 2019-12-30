const dotenv = require("dotenv").config();
const mysql = require("mysql");
const cron = require("node-cron");
const moment = require("moment");
const creds =
  process.env.NODE_ENV === "production"
    ? process.env.JAWSDB_URL
    : {
        host: process.env.DEV_HOST,
        user: process.env.DEV_USER,
        password: process.env.DEV_PASS,
        database: process.env.DEV_DB
      };

// mysql connection created
const db = mysql.createConnection(creds);

db.connect(err => {
  if (err) throw err;
});

// lets clear some completed tasks
cron.schedule("0 0 * * *", () => {
  db.query(
    "select * from tasks where status = 'complete' and deleted_at is null",
    (err, results) => {
      if (err) throw err;

      let deleteTasks = [];
      for (let task of results) {
        const { id, completed_at } = task;
        let passed = moment().diff(completed_at, "days");
        if (+passed >= 3) {
          deleteTasks.push(id);
        }
      }

      let ids = deleteTasks.join(",");
      db.query(
        `update tasks set deleted_at = NOW() where id in (${ids})`,
        (e, r) => {
          if (e) throw e;
          console.log("Successfully deleted tasks.");
        }
      );
    }
  );
});

module.exports = {
  cron,
  db
};
