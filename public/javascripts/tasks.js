$(document).ready(() => {
  /*
   * New task
   */
  let resetNewTask = () => {
    $("#new-task")[0].reset();
  };

  let appendNewTask = task => {
    let newTask = `
      <div data-id="${task.id}" class="list--task raise raise--light">
        <div class="list--task__name">
          ${task.task}
        </div>
        <div class="list--task__options">
          <span class="timer"></span>
          <button
            data-id="${task.id}"
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
    $(".list--todo .list--tasks").append(newTask);
  };

  $("#new-task").submit(function(e) {
    e.preventDefault();
    let task = $("input[name=task]").val();
    let list_id = $(".list--in-progress").find(".list--task").length;

    if (task) {
      $.ajax({
        method: "post",
        url: "/api/tasks/new",
        data: {
          task,
          list_id
        }
      }).done(task => {
        appendNewTask(task);
        resetNewTask();
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
    let task_id = $(this).data("id");

    $.ajax({
      method: "put",
      url: `/api/tasks/complete/${task_id}`
    }).done(res => {
      $(`.list--task[data-id=${task_id}]`).prependTo("#complete");
    });
  });
  /*
   * end of complete task
   */

  /*
   * Start task timer
   */
  let setTimer;
  let time;
  $(document).on("click", "button[name=timer]", function() {
    const that = $(this);
    const task_id = that.data("id");
    const timer = $(`.list--task[data-id=${task_id}]`)
      .find(".timer")
      .text();
    let started = +that.attr("started");

    let seconds = moment.duration($.trim(timer)).asSeconds();
    let date = new Date();

    const tick = () => {
      seconds++;
      // construct readable time from seconds
      time = moment(date)
        .startOf("day")
        .seconds(seconds)
        .format("HH:mm:ss");

      $(`.list--task[data-id=${task_id}]`)
        .find(".timer")
        .text(time);
    };

    const saveTaskTimer = time => {
      $.ajax({
        method: "put",
        url: `/api/tasks/timer/${task_id}`,
        data: {
          time
        }
      });
    };

    if (started) {
      that.attr("started", "0");
      clearInterval(setTimer);
      saveTaskTimer(time);
    } else {
      that.attr("started", "1");
      setTimer = setInterval(function() {
        tick();
      }, 1000);
    }
  });
  /*
   * end of task time
   */

  $(document).on("click", "button[name=add_time]", function() {
    $("#time-modal").show();
  });
});
