$(document).ready(() => {
  const clients = $(".list--container");

  const updateTasks = (client_id, to, from) => {
    let tasks = [];

    const addTasks = list => {
      $(`.list--tasks[data-list=${list}]`)
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
      $(`#${client_id}`)
        .find(
          ".list--tasks[data-list=todo], .list--tasks[data-list=in_progress]"
        )
        .each(function() {
          $(this).attr("data-complete", "");
        });
    });
  };

  let listIndex = 0;
  clients.map((idx, c) => {
    let client_id = $(c).attr("id");
    let lists = $(c).find(".list--tasks");

    lists.map((idx, l) => {
      let id = $(l).data("list");
      let put = id === "complete" ? false : true;

      Sortable.create(l, {
        group: { name: `tasks-${listIndex}`, put },
        chosenClass: "list--task__chosen",
        onEnd: evt => {
          let to = $(evt.to).data("list");
          let from = $(evt.from).data("list");
          updateTasks(client_id, to, from);
        }
      });
    });
    listIndex++;
  });
});
