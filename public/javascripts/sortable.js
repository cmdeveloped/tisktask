$(document).ready(() => {
  const lists = $(".list--tasks");

  const updateTasks = (to, from) => {
    let tasks = [];
    // add list of tasks — 'to' list
    if (to !== from) {
      $(`#${to}`)
        .find(".list--task")
        .map((idx, task) => {
          let id = $(task).data("id");
          let list_id = idx;
          let status = to;
          tasks.push(`( ${id}, '${status}', ${list_id} )`);
        });
    }
    // add list of tasks — 'from' list
    $(`#${from}`)
      .find(".list--task")
      .map((idx, task) => {
        let id = $(task).data("id");
        let list_id = idx;
        let status = from;
        tasks.push(`( ${id}, '${status}', ${list_id} )`);
      });

    // batch update
    $.ajax({
      method: "put",
      url: "/api/tasks/update",
      data: {
        tasks: JSON.stringify(tasks)
      }
    }).done(res => {
      // some sort of modal
    });
  };

  for (list of lists) {
    Sortable.create(list, {
      group: "tasks",
      chosenClass: "list--task__chosen",
      onEnd: evt => {
        let to = $(evt.to).attr("id");
        let from = $(evt.from).attr("id");
        updateTasks(to, from);
      }
    });
  }
});
