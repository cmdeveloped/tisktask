$(document).ready(() => {
  /*
   * New task
   */
  let resetNewTask = () => {
    $("#new-task")[0].reset();
  };

  let appendNewTask = task => {
    let newTask = `
      <div class="list--task raise raise--light">
        ${task.task}
      </div>
    `;
    $(".list--in-progress .list--tasks").append(newTask);
  };

  $("#new-task").submit(e => {
    e.preventDefault();
    let task = $("input[name=task]").val();
    let list_id = $(".list--in-progress").find(".list--task").length;

    $.ajax({
      method: "post",
      url: "/api/tasks",
      data: {
        task,
        list_id
      }
    }).done(task => {
      appendNewTask(task);
      resetNewTask();
    });
  });
  /*
   * end of new task
   */
});
