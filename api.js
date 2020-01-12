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
  tasks = JSON.parse(tasks);

  for (task of tasks) {
    let query = `update tasks
      set
        status = '${task[1]}',
        list_id = ${task[2]},
        completed_at = ${task[3]}
      where
        id = ${task[0]}`;
    db.query(query, (err, result) => {
      if (err) throw err;
    });
  }

  res.json({
    success: true,
    message: "Successfully updated."
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
// additional functions to easily calculate time and store in mysql
const toTime = total => {
  // pad time leading zeros
  const pad = int => (`${int}`.length < 2 ? "0" + int : `${int}`);

  // total is in seconds
  let hrs = Math.floor(total / 3600);
  hrs = pad(hrs);

  const minToSecs = total - hrs * 3600;
  let mins = Math.floor(minToSecs / 60);
  mins = pad(mins);

  let secs = minToSecs % 60;
  secs = pad(secs);

  let time = hrs + mins + secs;
  return time;
};

const toSeconds = time => moment.duration(time).asSeconds();

router.post("/timer/:task_id", async (req, res) => {
  try {
    const today = moment().format("YYYY-MM-DD");
    let task_id = req.params.task_id;
    let time = req.body.time;
    time = toSeconds(time);

    /*
     * past time scenarios to account for
     * new task - no time
     * update task - no previous time
     * update task - previous time
     */
    let pastTime = await db.query(
      `select
        task_id,
        sec_to_time( sum( time_to_sec(time) ) ) as time,
        max(created_at) as past
      from timers
      where task_id = ${task_id}
      and created_at < '${today}'
      having time`
    );
    pastTime = pastTime.length ? pastTime[0].time : false;
    // subtract past time if applicable
    if (pastTime) {
      time = time - toSeconds(pastTime);
    }
    // format time
    time = toTime(time);

    //  determine if we have a timer entry for the task today
    let timerToday = await db.query(
      `select * from timers where task_id = ${task_id} and created_at = current_date()`
    );
    timerToday = timerToday.length ? true : false;

    // if we have a timer today, update the row
    if (timerToday) {
      db.query(
        `update timers set time = '${time}' where task_id = ${task_id} and created_at = current_date()`,
        (err, results) => {
          if (err) throw err;
          res.json({
            success: true,
            message: "Successfully updated timer."
          });
        }
      );
    } else {
      // if this is the first timer of the day, insert
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
  } catch (e) {
    console.log(e);
  }
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
