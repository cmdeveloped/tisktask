const express = require("express");
const router = express.Router();
const { db } = require("./mysql");
const moment = require("moment");

// requery all tasks and return as json
let resetTasks = res => {
  let query = "select * from tasks where deleted_at is null";
  db.query(query, (err, result) => {
    if (err) throw err;
    let last = result.length - 1;
    last = result[last];
    res.json(last);
  });
};

// add new task route
router.post("/tasks/new", (req, res, next) => {
  let user_id = req.session.user.id;
  let task = req.body.task;
  let list_id = req.body.list_id;
  let query = `insert into tasks (user_id, task, list_id) values (${user_id}, '${task}', ${list_id})`;
  db.query(query, (err, result) => {
    if (err) throw err;
    resetTasks(res);
  });
});

// update tasks route
router.put("/tasks/update", (req, res) => {
  let tasks = req.body.tasks;
  let values = JSON.parse(tasks).join(",");
  let query = `insert into tasks (id, status, list_id, completed_at) values ${values} on duplicate key update status=values(status), list_id=values(list_id), completed_at=values(completed_at)`;
  db.query(query, (err, result) => {
    if (err) throw err;
    res.json({
      success: true,
      message: "Successfully updated."
    });
  });
});

// complete tasks route
router.put("/tasks/complete/:id", (req, res) => {
  let task = req.params.id;
  let query = `update tasks set status = 'complete', list_id = 0, completed_at = NOW() where id = ${task}`;
  db.query(query, (err, result) => {
    if (err) throw err;
    res.json({
      success: true,
      message: "Successfully updated. Task complete."
    });
  });
});

// save task timer route
router.post("/timer/:task_id", (req, res) => {
  let task_id = req.params.task_id;
  let time = req.body.time;
  const today = moment().format("YYYY-MM-DD");
  time = time.split(":").join("");
  db.query(
    `select * from timers where task_id = ${task_id} and created_at = current_date()`,
    (err, result) => {
      if (err) throw err;
      if (result.length) {
        db.query(
          `update timers set time = '${time}' where task_id = ${task_id} and created_at = current_date()`,
          (err, result) => {
            if (err) throw err;
            res.json({
              success: true,
              message: "Successfully updated timer."
            });
          }
        );
      } else {
        db.query(
          `insert into timers (task_id, time, created_at) values (${task_id}, '${time}', '${today}')`,
          (err, result) => {
            if (err) throw err;
            res.json({
              success: true,
              message: `Successfully created daily timer for task ${task_id}`
            });
          }
        );
      }
    }
  );
});

// delete tasks route
router.delete("/tasks/delete", (req, res) => {
  let task = req.body.task_id;
  let tasks = req.body.tasks;
  let ids = task ? task : tasks;

  let query = `update tasks set deleted_at = NOW() where id in (${ids})`;
  db.query(query, (err, result) => {
    if (err) throw err;
    res.json({
      success: true,
      message: "Successfully deleted."
    });
  });
});

module.exports = router;
