<template>
  <section>
    <h1>{{ project.name }}</h1>
    <ul>
      <li v-for="task in tasks">{{ task.name }}</li>
    </ul>
  </section>
</template>

<script>
export default {
  name: "TasksView",
  props: {
    project: {id: Number, icon: String, name: String},
  },
  data() {
    return {
      // [{id: String, name: String, content: String, duration: int, dueDate: String}]
      tasks: [],
    }
  },
  mounted() {
    // Request tasks from server after props are available with AJAX.
    // Props are for the first time available in the mounted hook.
    let vm = this;
    // TODO change URL to HTTPS when SSL is activated on the server
    // Note: I changed my /etc/hosts file to redirect smail.de to localhost

    console.log(this.project);

    $.post('http://api.todo.smail.de/ajax.php', {
      "action": "get_tasks",
      "projectId": this.project.id,
    }, (response) => {
      // TODO make this work
      this.tasks = $.parseJSON(response);
      console.log("jkhfdjhkdsdkl")
    }).fail(function (response) {
      console.log("err");
      console.error(response);
    });
  }
}
</script>

<style scoped>
h1 {
  text-transform: capitalize;
}
</style>