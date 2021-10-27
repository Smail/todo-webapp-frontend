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
  watch: {
    // TODO We maybe need immediate: true (https://stackoverflow.com/a/51176290/9258134), because of the Inbox maybe not loading the tasks when the website is first loaded. Other option: add this.loadData to created hook
    project: function () {
      this.loadData();
    }
  },
  methods: {
    /**
     * Request tasks for the currently selected project. After the successful server request, the tasks array will only
     * contain the new values, i.e. it will be cleared first.
     */
    loadData() {
      // TODO change URL to HTTPS when SSL is activated on the server
      // Note: I changed my /etc/hosts file to redirect smail.de to localhost
      $.ajax({
        type: 'POST',
        url: 'http://api.todo.smail.de/ajax.php',
        data: {
          'action': 'get_tasks',
          'projectId': this.project.id,
          // TODO add bearer token, username or simply some form of authentication
        },
        success: (response) => {
          const json = $.parseJSON(response);
          this.tasks = [];

          for (const x of json) {
            this.tasks.push(x);
          }
        },
      });
    }
  }
}
</script>

<style scoped>
h1 {
  text-transform: capitalize;
}
</style>