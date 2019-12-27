const express = require("express");
const router = express.Router();
const { db } = require("./mysql");

let resetTasks = res => {
  db.query("select * from tasks", (err, result) => {
    if (err) throw err;
    let last = result.length - 1;
    last = result[last];
    res.json(last);
  });
};

router.post("/tasks", (req, res, next) => {
  let task = req.body.task;
  let list_id = req.body.list_id;
  db.query(
    `insert into tasks (task, list_id) values ('${task}', ${list_id})`,
    (err, result) => {
      if (err) throw err;
      resetTasks(res);
    }
  );
});

module.exports = router;
