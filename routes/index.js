const express = require("express");
const router = express.Router();
const { db } = require("../mysql");
const moment = require("moment");

// filter tasks by status and list index
let filterTasks = (rows, status) => {
  let filtered = rows.filter(t => t.status === status);

  let sorted = filtered.sort((a, b) => {
    return status === "complete"
      ? a.completed_at - b.completed_at
      : a.list_id - b.list_id;
  });

  return sorted;
};

/* GET home page. */
router.get("/", function(req, res, next) {
  // verify that we have a user logged in
  const user = req.session.user;
  if (!user) {
    res.redirect("/login");
    return;
  }

  // if user logged in, grab their tasks
  const user_id = user.id;
  db.query(
    `select
    	ta.*,
    	sec_to_time( sum( ( time_to_sec(ti.time ) ) ) ) as timer
    from
    	tasks ta
    	LEFT JOIN timers ti ON ta.id = ti.task_id
    where deleted_at is null
    and user_id = ${user_id}
    group by ta.id`,
    (err, rows) => {
      let todo = filterTasks(rows, "todo");
      let in_progress = filterTasks(rows, "in_progress");
      let complete = filterTasks(rows, "complete");
      let week = `${moment()
        .startOf("week")
        .format("MMM DD")} - ${moment()
        .endOf("week")
        .format("MMM DD YYYY")}`;

      res.render("index", {
        title: "tisk task",
        week,
        date: moment().format("dddd, MMMM DD"),
        user_id,
        lists: {
          todo: {
            title: "Todo",
            tasks: todo,
            // form attribute because I don't want to install helpers
            form: true
          },
          in_progress: {
            title: "In Progress",
            tasks: in_progress
          },
          complete: {
            title: "Complete",
            tasks: complete
          }
        }
      });
    }
  );
});

module.exports = router;
