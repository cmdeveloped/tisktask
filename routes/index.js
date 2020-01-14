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
    let data = await db.query(
      `select
        c.user_id,
        c.name AS client_name,
        ta.*,
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

    data = _.groupBy(data, "client_name");

    Object.keys(data).map(client => {
      // group client tasks by status
      let client_id = _.get(data[client], "[0].client_id");
      data[client] = _.groupBy(data[client], "status");

      // set proper titles
      const properTitle = status => {
        let title = status
          .split("_")
          .map(s => {
            return s.charAt(0).toUpperCase() + s.slice(1);
          })
          .join(" ");

        return title;
      };
      // make sure we have all of statuses we need for templating
      // set array to tasks
      data[client] = {
        client_id,
        lists: {
          todo: {
            title: properTitle("todo"),
            tasks: data[client]["todo"] || [],
            form: true
          },
          in_progress: {
            title: properTitle("in_progress"),
            tasks: data[client]["in_progress"] || []
          },
          complete: {
            title: properTitle("complete"),
            tasks: data[client]["complete"] || []
          }
        }
      };
    });

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
