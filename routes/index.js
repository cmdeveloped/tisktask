const express = require("express");
const router = express.Router();
let tasks = {
  overdue: ["test", "again"],
  in_progress: ["one"],
  completed: ["two"]
};

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", {
    title: "tisk task",
    overdue: tasks.overdue,
    in_progress: tasks.in_progress,
    completed: tasks.completed
  });
});

module.exports = router;
