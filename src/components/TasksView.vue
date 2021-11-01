<template>
  <section @focusout="updateContextMenu($event, false, null)">
    <h1 :data-theme="theme">{{ project.name }}</h1>
    <ul>
      <li v-for="(task, index) in tasks" :data-theme="theme">
        <!-- Choosing @input instead of @focusout increases the server load, so this might be open to change -->
        <!-- <input v-model="task.name" @focusout="updateTask"/> -->
        <div :data-theme="theme" class="task" @click="setActiveTask(task)">
          <input :data-theme="theme" type="checkbox"/>
          <input v-model="task.name" :data-theme="theme" type="text"
                 @contextmenu="updateContextMenu($event, true, task)"
                 @input="setTaskName(task, $event.target.value)"/>
          <button :data-theme="theme"
                  @click.left="updateContextMenu($event, true, task)"
                  @click.right="updateContextMenu($event, true, task)">
            <span class="material-icons">more_horiz</span>
          </button>
        </div>
        <hr v-if="index < tasks.length - 1" :data-theme="theme">
      </li>
      <li>
        <input id="new-task" :data-theme="theme" placeholder="New task" type="text"
               @keypress.enter="createTask($event.target.value)"/>
      </li>
    </ul>
    <ContextMenu v-show="showContextMenu" id="context-menu" :pos-x="contextMenuPosX"
                 :pos-y="contextMenuPosY" :task="contextMenuTask">
      <div class="flex-column">
        <h5 :data-theme="theme" class="color-primary padding-05em">Priority</h5>
        <ul class="flex-row">
          <li :data-theme="theme" class="cm-item color-primary">
            <span class="material-icons">
              !!!
            </span>
          </li>
          <li :data-theme="theme" class="cm-item color-primary material-icons">!!</li>
          <li :data-theme="theme" class="cm-item color-primary material-icons">!</li>
          <li :data-theme="theme" class="cm-item color-primary">0</li>
        </ul>
        <hr :data-theme="theme">
        <ul class="flex-column align-flex-start">
          <li :data-theme="theme" class="cm-item color-primary">
            <span class="material-icons-outlined">exit_to_app</span>
            <p>Move to</p>
          </li>
          <li :data-theme="theme" class="cm-item color-primary">
            <span class="material-icons-outlined">label</span>
            <p>Tags</p>
          </li>
        </ul>
        <hr :data-theme="theme">
        <ul class="flex-column align-flex-start">
          <li :data-theme="theme" class="cm-item color-primary">
            <span class="material-icons-outlined">file_copy</span>
            <p>Duplicate</p>
          </li>
          <li :data-theme="theme" class="cm-item color-primary">
            <span class="material-icons-outlined" style="color:#ff0000;">delete</span>
            <p>Delete</p>
          </li>
        </ul>
      </div>
    </ContextMenu>
  </section>
</template>

<script>
import ContextMenu from "@/components/ContextMenu";

export default {
  name: "TasksView",
  components: {ContextMenu},
  props: {
    project: {id: Number, icon: String, name: String},
    theme: String,
    activeTask: Object,
  },
  emits: ["update:activeTask"],
  data() {
    return {
      // [{id: int, name: String, content: String, duration: int, dueDate: String}]
      tasks: [],
      showContextMenu: false,
      contextMenuPosX: 0,
      contextMenuPosY: 0,
      contextMenuTask: null,
    }
  },
  watch: {
    // TODO We maybe need immediate: true (https://stackoverflow.com/a/51176290/9258134), because of the Inbox maybe not loading the tasks when the website is first loaded. Other option: add this.loadData to created hook
    project: {
      immediate: true,
      handler() {
        this.loadTasks();
      }
    }
  },
  methods: {
    /**
     * Request tasks for the currently selected project. After the successful server request, the tasks array will only
     * contain the new values, i.e. it will be cleared first.
     */
    loadTasks() {
      // TODO change URL to HTTPS when SSL is activated on the server
      // Note: I changed my /etc/hosts file to redirect smail.de to localhost
      $.ajax({
        type: 'POST',
        url: 'http://192.168.2.165:8082/ajax.php',
        data: {
          'action': 'get_tasks',
          'projectId': this.project.id,
          // TODO add bearer token, username or simply some form of authentication
        },
        headers: {
          'Authorization': localStorage.getItem('token'),
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
     * Set a new task name for a task on client and server.
     * This function will only update the client if the server update was successful.
     *
     * @param task The task, which should be updated.
     * @param newTaskName The new task name for the parameter task.
     */
    setTaskName(task, newTaskName) {
      // TODO putting the task object has unnecessary overhead if we only update the name or content, etc. because we
      // are sending also unchanged data to the server. We should either create individual functions or check for change
      // and then use PATCH instead of PUT.
      // Note: Server doesn't accept PATCH or PUT, so this is currently unnecessary.
      $.ajax({
        type: 'POST',
        url: 'http://192.168.2.165:8082/ajax.php',
        data: {
          'action': 'update_task_name',
          'taskId': task.id,
          'taskName': newTaskName,
        },
        headers: {
          'Authorization': localStorage.getItem('token'),
        },
        success: () => {
          // task.name will be automatically updated by v-model
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
        url: 'http://192.168.2.165:8082/ajax.php',
        data: {
          'action': 'create_task',
          'projectId': this.project.id,
          'taskName': taskName,
          'taskContent': taskContent,
          'taskDuration': taskDuration,
          'taskDueDate': taskDueDate,
        },
        headers: {
          'Authorization': localStorage.getItem('token'),
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
    setActiveTask(newActiveTask) {
      this.$emit('update:activeTask', newActiveTask);
    },
    updateContextMenu(event, showContextMenu, task) {
      event.preventDefault();
      // Check if we lost focus to the context menu. If so don't hide or do anything
      if (event instanceof FocusEvent &&
          document.getElementById("context-menu").contains(event.relatedTarget)) {
        return;
      }
      if (this.showContextMenu === showContextMenu && !showContextMenu) {
        return;
      }
      this.contextMenuPosX = event.clientX;
      this.contextMenuPosY = event.clientY;
      this.contextMenuTask = task;
      this.showContextMenu = showContextMenu;
    },
  }
}
</script>

<style scoped>
.cm-item {
  padding: .5em;
  font-size: 11pt;
  display: flex;
  justify-content: center;
  align-items: center;
}

.cm-item > .material-icons,
.cm-item > .material-icons-outlined {
  padding: 0 0.25em 0 0;
}

.material-icons,
.material-icons-outlined {
  color: inherit;
  font-size: inherit;
}

.padding-05em {
  padding: .5em;
}

.flex-column {
  display: flex;
  flex-direction: column;
}

.align-flex-start {
  align-items: flex-start;
}

.flex-row {
  display: flex;
  flex-direction: row;
}

.color-primary[data-theme="light"] {
  color: black;
}

.color-primary[data-theme="dark"] {
  color: white;
}

button {
  display: flex;
  justify-content: center;
  border: 0 none;
  background-color: transparent;
  padding: 0 0.5em;
}

button[data-theme="light"] {
  color: #1e1e1e;
}

button[data-theme="dark"] {
  color: white;
}

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