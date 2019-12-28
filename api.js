const express = require("express");
const router = express.Router();
const { db } = require("./mysql");

// requery all tasks and return as json
let resetTasks = res => {
  db.query("select * from tasks", (err, result) => {
    if (err) throw err;
    let last = result.length - 1;
    last = result[last];
    res.json(last);
  });
};

// add new task route
router.post("/tasks/new", (req, res, next) => {
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

// update tasks route
router.put("/tasks/update", (req, res) => {
  let tasks = req.body.tasks;
  let values = JSON.parse(tasks).join(",");
  db.query(
    `insert into tasks (id, status, list_id) values ${values} on duplicate key update status=values(status), list_id=values(list_id)`,
    (err, result) => {
      if (err) throw err;
      res.json({
        success: true,
        message: "Successfully updated."
      });
    }
  );
});

router.delete("/tasks/delete/:id", (req, res) => {
  let task = req.params.id;
  db.query(`delete from tasks where id=${task}`, (err, result) => {
    if (err) throw err;
    res.json({
      success: true,
      message: "Successfully deleted."
    });
  });
});

module.exports = router;
