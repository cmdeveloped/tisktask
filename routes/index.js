const express = require("express");
const router = express.Router();
const { db } = require("../mysql");

/* GET home page. */
router.get("/", function(req, res, next) {
  db.query("select * from tasks", (err, rows) => {
    let overdue = rows.filter(t => t.status === "overdue");
    let in_progress = rows.filter(t => t.status === "in_progress");
    let complete = rows.filter(t => t.status === "complete");
    res.render("index", {
      title: "tisk task",
      overdue,
      in_progress,
      complete
    });
  });
});

module.exports = router;
