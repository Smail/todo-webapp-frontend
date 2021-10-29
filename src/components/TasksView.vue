<template>
  <section>
    <h1 :data-theme="theme">{{ project.name }}</h1>
    <ul>
      <li v-for="(task, index) in tasks" :data-theme="theme">
        <!-- Choosing @input instead of @focusout increases the server load, so this might be open to change -->
        <!-- <input v-model="task.name" @focusout="updateTask"/> -->
        <div :data-theme="theme" class="task">
          <input :data-theme="theme" type="checkbox"/>
          <input v-model="task.name" :data-theme="theme" type="text"
                 @input="updateTaskName(task, $event.target.value)"/>
        </div>
        <hr v-if="index < tasks.length - 1" :data-theme="theme">
      </li>
      <li>
        <input id="new-task" :data-theme="theme" placeholder="New task" type="text"
               @keypress.enter="createTask($event.target.value)"/>
      </li>
    </ul>
  </section>
</template>

<script>
export default {
  name: "TasksView",
  props: {
    project: {id: Number, icon: String, name: String},
    theme: String,
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
  margin-bottom: 0.5em;
}

ul {
  display: flex;
  flex-direction: column;
}

li {
  list-style: none;
  font-size: 12pt;
}

div.task {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

input[type="checkbox"] {
  margin: 0 0.5em;
  border: 0 none;
  height: 1.5em;
  width: 1.5em;
  background-color: red;
}

input[type="text"] {
  background-color: transparent;
  border-width: 0;
  font-size: inherit;
  margin: 0.5em 0;
  outline: none; /* TODO */
  width: 100%;
}

input[type="text"][data-theme="dark"] {
  color: white;
}

hr {
  height: 1px;
  border: none;
  margin: 0.25em 0;
  background-color: black;
}

hr[data-theme="dark"] {
  background-color: #494949;
}

#new-task {
  padding: 0.5em;
  width: calc(100% - 2 * 0.5em);
  border-radius: 5px;
}

#new-task:not([data-theme="dark"]) {
  color: white;
  background-color: #1a1a1a;
}

#new-task[data-theme="dark"] {
  color: white;
  background-color: #2a2a2a;
}

#new-task::placeholder {
  color: lightgray;
}

#new-task[data-theme="dark"]::placeholder {
  color: #7e7e7e;
}

#new-task:not([data-theme="dark"]):focus {
  outline: thin solid #1a1a1a;
}

#new-task[data-theme="dark"]:focus {
  outline: thin solid #323232;
}
</style>