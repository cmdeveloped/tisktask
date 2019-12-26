$(document).ready(() => {
  const lists = $(".list--tasks");
  for (list of lists) {
    Sortable.create(list, {
      group: "tasks",
      chosenClass: "list--task__chosen"
    });
  }
});
