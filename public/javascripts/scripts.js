$(document).ready(() => {
  $("#new-task").on("submit", e => {
    e.preventDefault();
    let task = $("input[name=task]").val();
    $.ajax({
      method: "post",
      url: "/api/tasks",
      data: {
        task
      }
    });
  });
});
