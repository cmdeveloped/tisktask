const express = require("express");
const router = express.Router();
const { db } = require("./mysql");

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
  let task = req.body.task;
  let list_id = req.body.list_id;
  let query = `insert into tasks (task, list_id) values ('${task}', ${list_id})`;
  db.query(query, (err, result) => {
    if (err) throw err;
    resetTasks(res);
  });
});

// update tasks route
router.put("/tasks/update", (req, res) => {
  let tasks = req.body.tasks;
  let values = JSON.parse(tasks).join(",");
  let query = `insert into tasks (id, status, list_id) values ${values} on duplicate key update status=values(status), list_id=values(list_id)`;
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
router.put("/tasks/timer/:id", (req, res) => {
  let task = req.params.id;
  let time = req.body.time;
  time = time.split(":").join("");
  let query = `update tasks set timer = ${time} where id = ${task}`;
  db.query(query, (err, result) => {
    if (err) throw err;
    res.json({
      success: true,
      message: "Successfully updated timer."
    });
  });
});

// delete tasks route
router.delete("/tasks/delete/:id", (req, res) => {
  let task = req.params.id;
  let query = `update tasks set deleted_at = NOW() where id = ${task}`;
  db.query(query, (err, result) => {
    if (err) throw err;
    res.json({
      success: true,
      message: "Successfully deleted."
    });
  });
});

module.exports = router;
