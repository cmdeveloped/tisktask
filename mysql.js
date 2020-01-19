const dotenv = require("dotenv").config();
const mysql = require("mysql");
const cron = require("node-cron");
const moment = require("moment");
const bcrypt = require("bcrypt");
const util = require("util");
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
let db = mysql.createConnection(creds);
db.query = util.promisify(db.query);

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

const hashPasswords = async () => {
  try {
    await db.query(
      `select * from users where password not like "$2b$%"`,
      (err, results) => {
        if (err) throw err;
        // if we have unencrypted passwords, do something about that
        if (results.length) {
          results.map(user => {
            let { id, password } = user;
            bcrypt.hash(password, 10, async (err, hash) => {
              if (err) throw err;
              await db.query(
                `update users set password = '${hash}' where id = ${id}`,
                (err, result) => {
                  if (err) throw err;
                  console.log(`Password for ${id} has been hashed.`);
                }
              );
            });
          });
        }
      }
    );
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  hashPasswords,
  cron,
  db
};
