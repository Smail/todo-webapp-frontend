<template>
  <h1></h1>
</template>

<script>
export default {
  name: "TasksView",
  props: {
    projectId: Number,
  },
  mounted() {
    // Request tasks from server after props are available with AJAX.
    // Props are for the first time available in the mounted hook.
    let vm = this;

    const data = {
      "action": "get_tasks",
      "projectId": vm.projectId,
    }
    // TODO change URL to HTTPS when SSL is activated on the server
    // Note: I changed my /etc/hosts file to redirect smail.de to localhost
    $.post('http://api.todo.smail.de/', data, function (response) {
      console.log($.parseJSON(response));
    }).fail(function (response) {
      console.error(response.getHeaders());
    });
  }
}
</script>

<style scoped>

</style>