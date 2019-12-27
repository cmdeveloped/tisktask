$(document).ready(() => {
  const lists = $(".list--tasks");
  for (list of lists) {
    Sortable.create(list, {
      group: "tasks",
      chosenClass: "list--task__chosen",
      onEnd: evt => {
        let newStatus = $(evt.to).attr("id");
        let newIndex = evt.newIndex;
        console.log(newStatus, newIndex);
      }
    });
  }
});
