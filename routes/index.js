const express = require("express");
const router = express.Router();
const { db } = require("../mysql");
const moment = require("moment");
const _ = require("lodash");

/* GET home page. */
router.get("/", async (req, res, next) => {
  try {
    // verify that we have a user logged in
    const user = req.session.user;
    if (!user) {
      res.redirect("/login");
      return;
    }

    // if user logged in, grab their tasks
    const user_id = user.id;

    // get all tasks and clients
    let userClients = await db.query(
      `select * from clients where user_id = ${user_id}`
    );
    userClients = _.chain(userClients)
      .groupBy("name")
      .map((value, key) => ({
        client_name: key,
        client_id: value[0].id,
        client_tasks: {}
      }))
      .value();

    let userTasks = await db.query(
      `select
        c.name as client_name,
        ta.id as task_id,
        ta.task,
        ta.status,
        ta.list_id,
        ta.completed_at,
        sec_to_time(sum(time_to_sec(ti.time))) as timer
      from
        tasks ta
      left join timers ti on ta.id = ti.task_id
      left join clients c on ta.client_id = c.id
      where
        c.user_id = ${user_id}
        and ta.deleted_at is null
      group by
        ta.id`
    );
    userTasks = _.groupBy(userTasks, "client_name");

    // used to sort tasks once sorted
    const sortTasks = tasks => {
      tasks = tasks ? tasks : [];
      return tasks.sort((a, b) => a.list_id - b.list_id);
    };

    const properTitle = status => {
      return status
        .split("_")
        .map(each => each.charAt(0).toUpperCase() + each.slice(1))
        .join(" ");
    };

    Object.keys(userClients).map((client, idx) => {
      let statuses = ["todo", "in_progress", "complete"];
      let tasksByStatus = _.groupBy(userTasks[client], "status");
      statuses.map(status => {
        let sortedTasks = tasksByStatus[status]
          ? sortTasks(tasksByStatus[status])
          : [];
        tasksByStatus[status] = {
          title: properTitle(status),
          tasks: sortedTasks
        };
        tasksByStatus[status].form = status === "todo" ? true : false;
      });

      userClients[idx].client_tasks = {
        todo: tasksByStatus["todo"],
        in_progress: tasksByStatus["in_progress"],
        complete: tasksByStatus["complete"]
      };
    });

    let data = userClients;
    let week = `${moment()
      .startOf("week")
      .format("MMM DD")} - ${moment()
      .endOf("week")
      .format("MMM DD YYYY")}`;
    let date = moment().format("dddd, MMMM DD");

    res.render("index", {
      user_id,
      week,
      date,
      data
    });
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
