const express = require("express");
const router = express.Router();
const { db } = require("./mysql");

router.post("/tasks", (req, res, next) => {
  let task = req.body.task;
  db.query(`insert into tasks (task) values ('${task}')`, (err, result) => {
    if (err) throw err;
    console.log("New task created.");
  });
});

module.exports = router;
