$(document).ready(() => {
  const lists = $(".list--tasks");

  const updateTasks = (to, from) => {
    let tasks = [];

    const addTasks = list => {
      $(`#${list}`)
        .find(".list--task")
        .map((idx, task) => {
          let id = $(task).data("id");
          let list_id = idx;
          let status = list;
          let completed_at = $(task).data("complete")
            ? list === "complete"
              ? `'${moment($(task).data("complete")).format(
                  "YYYY-MM-DD HH:mm:ss"
                )}'`
              : null
            : null;
          // null value in 1st index is `user_id`
          tasks.push([id, status, list_id, completed_at]);
        });
    };

    // add list of tasks — 'to' list
    if (to !== from) {
      addTasks(to);
    }
    // add list of tasks — 'from' list
    addTasks(from);

    // batch update
    $.ajax({
      method: "put",
      url: "/api/tasks/update",
      data: {
        tasks: JSON.stringify(tasks)
      }
    }).done(res => {
      $("#todo, #in_progress")
        .find(".list--task")
        .each(function() {
          $(this).attr("data-complete", "");
        });
    });
  };

  for (list of lists) {
    let id = $(list).attr("id");
    let put = id === "complete" ? false : true;

    Sortable.create(list, {
      group: { name: "tasks", put },
      chosenClass: "list--task__chosen",
      onEnd: evt => {
        let to = $(evt.to).attr("id");
        let from = $(evt.from).attr("id");
        updateTasks(to, from);
      }
    });
  }
});
