$(document).ready(() => {
  /*
   * New task
   */
  let resetNewTask = form => {
    form[0].reset();
  };

  let appendNewTask = (client_id, task) => {
    let newTask = `
      <div data-id="${task.id}" class="list--task raise raise--light">
        <div class="list--task__name">
          ${task.task}
        </div>
        <div class="list--task__options">
          <span class="timer"></span>
          <button
            data-id="${task.id}"
            started="0"
            class="raise raise--light"
            type="button"
            name="timer"
            title="Timer"
          >
            <i class="fal fa-stopwatch"></i>
            <i class="fal fa-pause"></i>
          </button>
          <button
            data-id="${task.id}"
            class="raise raise--light"
            type="button"
            name="add_time"
            title="Add Time"
          >
            <i class="fal fa-clock"></i>
          </button>
          <button
            data-id="${task.id}"
            class="raise raise--light"
            type="button"
            name="complete"
            title="Complete"
          >
            <i class="fal fa-check-square"></i>
          </button>
          <button
            data-id="${task.id}"
            class="raise raise--light"
            type="button"
            name="delete"
            title="Delete"
          >
            <i class="fal fa-trash"></i>
          </button>
        </div>
      </div>
    `;
    $(`#client-${client_id}`)
      .find(".list--todo .list--tasks")
      .append(newTask);
  };

  $("form.list--new-task").submit(function(e) {
    e.preventDefault();
    let that = $(this);
    let client_id = that.data("client");
    let task = that.find("input[name=task]").val();
    let list_id = $(`#client-${client_id}`)
      .find(".list--in-progress")
      .find(".list--task").length;

    if (task) {
      $.ajax({
        method: "post",
        url: "/api/tasks/new",
        data: {
          client_id,
          task,
          list_id
        }
      }).done(task => {
        appendNewTask(client_id, task);
        resetNewTask(that);
      });
    }
  });
  /*
   * end of new task
   */

  /*
   * Delete task
   */
  $(document).on("click", "button[name=delete]", function() {
    let task_id = $(this).data("id");
    let check = confirm("Are you sure you'd like to delete this task?");

    if (check) {
      $.ajax({
        method: "delete",
        url: "/api/tasks/delete",
        data: {
          task_id
        }
      }).done(res => {
        $(`.list--task[data-id=${task_id}]`).remove();
      });
    }
  });
  /*
   * end of delete task
   */

  /*
   * Complete task
   */
  $(document).on("click", "button[name=complete]", function() {
    let client_id = $(this).data("client");
    let task_id = $(this).data("id");
    let completeList = $(`#client-${client_id}`).find(
      ".list--complete .list--tasks"
    )[0];

    $.ajax({
      method: "put",
      url: `/api/tasks/complete/${task_id}`
    }).done(res => {
      $(`.list--task[data-id=${task_id}]`).prependTo(completeList);
    });
  });
  /*
   * end of complete task
   */

  /*
   * Start task timer
   */
  // unique variables to track multiple timers
  let setTimer;
  let time = {};
  let seconds = {};
  let task_ids = [];
  let timerStarted = false;

  const toTime = total => {
    // pad time leading zeros
    const pad = int => (`${int}`.length < 2 ? "0" + int : int);

    // total is in seconds
    let hrs = Math.floor(total / 3600);
    hrs = pad(hrs);

    const minToSecs = total - hrs * 3600;
    let mins = Math.floor(minToSecs / 60);
    mins = pad(mins);

    let secs = minToSecs % 60;
    secs = pad(secs);

    let time = `${hrs}:${mins}:${secs}`;
    return time;
  };

  const tick = task_ids => {
    task_ids.map(task => {
      let taskSecs = +seconds[task];
      _.set(seconds, task, taskSecs + 1);
      // construct readable time from seconds
      _.set(time, task, toTime(taskSecs));

      $(`.list--task[data-id=${task}]`)
        .find(".timer")
        .text(time[task]);
    });
  };

  $(document).on("click", "button[name=timer]", function() {
    const that = $(this);
    const task_id = that.data("id");
    let started = +that.attr("started");
    let timer = $(`.list--task[data-id=${task_id}]`)
      .find(".timer")
      .text();
    timer = $.trim(timer);

    // set seconds object to have task id seconds
    _.set(seconds, task_id, moment.duration(timer).asSeconds());

    const saveTaskTimer = time => {
      $.ajax({
        method: "post",
        url: `/api/timer/${task_id}`,
        data: {
          time
        }
      });
    };

    // check if this task was active
    if (started) {
      that.attr("started", "0");
      _.remove(task_ids, id => id === task_id);
      saveTaskTimer(time[task_id]);
    } else {
      that.attr("started", "1");
      task_ids.push(task_id);
    }

    // begin our interval if we haven't started already and we have tasks
    if (task_ids.length === 1 && !timerStarted) {
      setTimer = setInterval(function() {
        tick(task_ids);
      }, 1000);
      timerStarted = true;
    } else if (!task_ids.length) {
      console.log("should stop timer");
      clearInterval(setTimer);
      timerStarted = false;
    }
  });
  /*
   * end of task time
   */

  /*
   * Add time modal
   */
  // hide modal if overlay click
  $("#time-modal").on("click", function(e) {
    let id = e.target.id;
    id === "time-modal" ? $(this).addClass("hide") : false;
  });

  $(document).on("click", "button[name=add_time]", function() {
    const modal = $("#time-modal");
    let task_id = $(this).data("id");
    let time = $(`.list--task[data-id=${task_id}]`)
      .find(".timer")
      .text();
    time = $.trim(time);
    modal.find(".time span").text(time);

    modal.removeClass("hide");
  });
});
