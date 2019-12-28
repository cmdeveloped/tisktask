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
          <button
            data-id="${task.id}"
            class="raise raise--light"
            type="button"
            name="timer"
            title="Timer"
          >
            <i class="fal fa-stopwatch"></i>
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
    $(".list--in-progress .list--tasks").append(newTask);
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
        url: `/api/tasks/delete/${task_id}`
      }).done(res => {
        $(`.list--task[data-id=${task_id}]`).remove();
        console.log(res);
      });
    }
  });
});
