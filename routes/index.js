const express = require("express");
const router = express.Router();
const { db } = require("../mysql");

// filter tasks by status and list index
let filterTasks = (rows, status) => {
  return rows
    .filter(t => t.status === status)
    .sort((a, b) => a.list_id - b.list_id);
};

/* GET home page. */
router.get("/", function(req, res, next) {
  db.query("select * from tasks", (err, rows) => {
    let overdue = filterTasks(rows, "overdue");
    let in_progress = filterTasks(rows, "in_progress");
    let complete = filterTasks(rows, "complete");
    res.render("index", {
      title: "tisk task",
      overdue,
      in_progress,
      complete
    });
  });
});

module.exports = router;
