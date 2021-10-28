<template>
  <section>
    <h1>{{ project.name }}</h1>
    <ul>
      <li v-for="task in tasks">
        <!-- Choosing @input instead of @focusout increases the server load, so this might be open to change -->
        <!-- <input v-model="task.name" @focusout="updateTask"/> -->
        <input v-model="task.name" @input="updateTaskName(task, $event.target.value)"/>
        <hr>
      </li>
      <li>
        <input id="new-task" placeholder="New task" @keypress.enter="createTask($event.target.value)"/>
      </li>
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
      // [{id: String, name: String, content: String, duration: int, dueDate: String}] TODO change id to int
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
          // Don't use this.tasks = []; because it dereferences the current array
          this.tasks.length = 0;

          for (const x of json) {
            this.tasks.push(x);
          }
        },
      });
    },
    /**
     * Update a task name on both the client and server.
     * This function will only update the client if the server update was successful.
     *
     * @param task The task, which should be updated.
     * @param newTaskName The new task name for the parameter task.
     */
    updateTaskName(task, newTaskName) {
      // TODO putting the task object has unnecessary overhead if we only update the name or content, etc. because we
      // are sending also unchanged data to the server. We should either create individual functions or check for change
      // and then use PATCH instead of PUT.
      // Note: Server doesn't accept PATCH or PUT, so this is currently unnecessary.
      $.ajax({
        type: 'POST',
        url: 'http://api.todo.smail.de/ajax.php',
        data: {
          'action': 'update_task_name',
          'taskId': task.id,
          'taskName': newTaskName,
        },
        success: () => {
          // task.name will be automatically updated by v-model
          console.log(task.name);
        },
        error: (response) => {
          alert('Could not update task name');
          console.error(response);
        }
      });
    },
    /**
     * Create a new task on client and server
     *
     * @param taskName
     * @param taskContent
     * @param taskDuration
     * @param taskDueDate
     */
    createTask(taskName, taskContent = '', taskDuration = null, taskDueDate = null) {
      $.ajax({
        type: 'POST',
        url: 'http://api.todo.smail.de/ajax.php',
        data: {
          'action': 'create_task',
          'projectId': this.project.id,
          'taskName': taskName,
          'taskContent': taskContent,
          'taskDuration': taskDuration,
          'taskDueDate': taskDueDate,
        },
        success: (response) => {
          console.log(response);
          // Create task here on the client as well
          const json = JSON.parse(response);
          const taskId = json['taskId'];

          if (taskId > 1) {
            console.log('push')
            this.tasks.push({
              'id': taskId,
              'name': taskName,
              'content': taskContent,
              'duration': taskDuration,
              'dueDate': taskDueDate,
            });
          }
        },
        error: (response) => {
          alert('Could not create task :/');
          console.error(response);
        }
      });
    },
  }
}
</script>

<style scoped>
section {
  padding: 1em;
}

h1 {
  text-transform: capitalize;
  margin-bottom: 1em;
}

ul {
  display: flex;
  flex-direction: column;
}

li {
  list-style: none;
  font-size: 12pt;
  /*margin-bottom: 0.5em;*/
}

input {
  background-color: transparent;
  border-width: 0;
  font-size: inherit;
  margin: 0.5em 0;
  outline: none; /* TODO */
  width: 100%;
}

input::placeholder {
  color: lightgray;
}

li > hr {
  background-color: black;
  height: 1px;
  border: none;
}

#new-task {
  background-color: #5e5e5e;
  padding: 0.5em;
  width: calc(100% - 2 * 0.5em);
  border-radius: 5px;
}

#new-task:focus {
  outline: thin solid white;
}

/*#new-task[data-theme="light"]::placeholder {*/
/*  color: ;*/
/*}*/

/*#new-task[data-theme="dark"]::placeholder {*/
/*  color: ;*/
/*}*/
</style>