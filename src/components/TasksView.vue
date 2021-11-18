<template>
  <section @focusout="updateContextMenu($event, false, null)">
    <h1 :data-theme="theme">{{ project.name }}</h1>
    <ul>
      <li v-for="(task, index) in tasks" :data-theme="theme">
        <!-- Choosing @input instead of @focusout increases the server load, so this might be open to change -->
        <!-- <input v-model="task.name" @focusout="updateTask"/> -->
        <div :data-theme="theme" class="task"
             @click="setActiveTask(task)"
             @contextmenu="updateContextMenu($event, true, task)">
          <input :data-theme="theme" class="material-icons-outlined" type="checkbox"/>
          <input v-model="task.name" :data-theme="theme" type="text"
                 @input="setTaskName(task, $event.target.value)"/>
          <button :data-theme="theme"
                  @click="updateContextMenu($event, true, task)">
            <span class="material-icons">more_horiz</span>
          </button>
        </div>
        <hr v-if="index < tasks.length - 1" :data-theme="theme">
      </li>
      <li>
        <input id="new-task" :data-theme="theme" placeholder="New task" type="text"
               @keypress.enter="createTask($event.target.value); clearNewTaskInputField();"/>
      </li>
    </ul>
    <ContextMenu v-show="showContextMenu" id="context-menu" :pos-x="contextMenuPosX"
                 :pos-y="contextMenuPosY" :task="contextMenuTask">
      <ul id="cm-container" :data-theme="theme">
        <li>
          <h5 :data-theme="theme" class="color-primary">Priority</h5>
          <ul id="priority-list" :data-theme="theme">
            <li :data-theme="theme" class="cm-item color-primary">
            <span class="material-icons">
              !!!
            </span>
            </li>
            <li :data-theme="theme" class="cm-item color-primary material-icons">!!</li>
            <li :data-theme="theme" class="cm-item color-primary material-icons">!</li>
            <li :data-theme="theme" class="cm-item color-primary">0</li>
          </ul>
        </li>
        <li>
          <hr :data-theme="theme" class="cm-hr">
        </li>
        <li :data-theme="theme" class="cm-item color-primary"
            @mouseenter="displaySubmenu($event.target, true)"
            @mouseleave="displaySubmenu($event.target, false)">
          <span class="material-icons-outlined">exit_to_app</span>
          <p>Move to different project</p>

          <ul class="cm-submenu">
            <Project v-for="p in projects.filter(proj => proj !== project)"
                     :is-active="false"
                     :project="p"
                     :theme="theme"
                     @click="moveTaskToProject(contextMenuTask, p); hideContextMenu();">
            </Project>
          </ul>
        </li>
        <li :data-theme="theme" class="cm-item color-primary">
          <span class="material-icons-outlined">label</span>
          <p>Tags</p>
        </li>
        <li>
          <hr :data-theme="theme" class="cm-hr">
        </li>
        <li :data-theme="theme" class="cm-item color-primary">
          <span class="material-icons-outlined">file_copy</span>
          <p>Duplicate</p>
        </li>
        <li :data-theme="theme" class="cm-item color-primary"
            @click="deleteTask(contextMenuTask); hideContextMenu();">
          <span class="material-icons-outlined" style="color:#ff0000;">delete</span>
          <p>Delete</p>
        </li>
      </ul>
    </ContextMenu>
  </section>
</template>

<script>
import ContextMenu from "@/components/ContextMenu";
import Project from "@/components/Project";

export default {
  name: "TasksView",
  components: {ContextMenu, Project},
  props: {
    // {id: int, name: String, icon: String?}
    project: Object,
    projects: Array,
    // {id: int, name: String, content: String, duration: int, dueDate: String}
    activeTask: Object,
    theme: String,
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
    project: {
      immediate: true,
      handler() {
        this.loadTasks();
      }
    }
  },
  methods: {
    moveTaskToProject(task, newProject) {
      $.ajax({
        type: 'POST',
        url: 'http://192.168.2.165:8082/ajax.php',
        data: {
          'action': 'move_task',
          'taskId': task.id,
          // TODO remove hard coding
          // Delete the task permanently if it was already moved into the 'Deleted' project
          'newProjectId': newProject.id,
        },
        headers: {
          'Authorization': localStorage.getItem('token'),
        },
        success: (response) => {
          // task.name will be automatically updated by v-model
          const json = $.parseJSON(response);

          if (json.wasSuccessful) {
            const index = this.tasks.indexOf(task);

            if (index !== -1) {
              this.tasks.splice(index, 1);
              console.log("Successfully moved task: " + task.name + " ID: " + task.id);
              console.log(this.tasks);
            } else {
              console.warn("Could not find element in array," +
                  "but it was successfully moved on the server. Weird");
            }
          } else {
            alert("Could not move task: " + task.name);
          }
        },
        error: (response) => {
          alert("Unknown error occurred while deleting task: " + task.name);
          console.error(response);
        }
      });
    },
    displaySubmenu(menu, shouldDisplay) {
      $(menu).find(".cm-submenu").css("display", shouldDisplay ? "block" : "none");
    },
    hideContextMenu() {
      this.updateContextMenu(null, false, null);
    },
    clearNewTaskInputField() {
      $("#new-task").val("");
    },
    /**
     * Request tasks for the currently selected project. After the successful server request, the tasks array will only
     * contain the new values, i.e. it will be cleared first.
     */
    loadTasks() {
      if (this.project == null) {
        throw new Error("Project is null in TasksView");
      }

      $.ajax({
        type: "GET",
        url: `http://192.168.2.165:8090/projects/${this.project.id}/tasks/`,
        headers: {
          'Authorization': localStorage.getItem('token'),
        },
        success: (arr) => {
          // Don't use this.tasks = []; because it dereferences the current array
          this.tasks.length = 0;

          for (const task of arr) {
            this.tasks.push(task);
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
        url: `http://192.168.2.165:8090/projects/${this.project.id}/task/`,
        data: {
          taskName,
          taskContent,
          taskDuration,
          taskDueDate,
        },
        headers: {
          'Authorization': localStorage.getItem('token'),
        },
        success: (response) => {
          console.log(response);
          // Create task here on the client as well
          const taskId = response.id;

          if (taskId > 0) {
            this.tasks.push({
              id: taskId,
              name: taskName,
              content: taskContent,
              duration: taskDuration,
              dueDate: taskDueDate,
            });
          }
        },
        error: (response) => {
          alert('Could not create task :/');
          console.error(response);
        }
      });
    },
    deleteTask(task) {
      if (task == null) {
        return;
      }
      console.log("delete task:");
      console.log(task);
      $.ajax({
        type: 'POST',
        url: 'http://192.168.2.165:8082/ajax.php',
        data: {
          'action': 'delete_task',
          'taskId': task.id,
          // TODO remove hard coding
          // Delete the task permanently if it was already moved into the 'Deleted' project
          'deletePermanently': this.project.name.toLowerCase() === 'deleted',
        },
        headers: {
          'Authorization': localStorage.getItem('token'),
        },
        success: (response) => {
          // task.name will be automatically updated by v-model
          const json = $.parseJSON(response);

          if (json.wasSuccessful) {
            const index = this.tasks.indexOf(task);

            if (index !== -1) {
              this.tasks.splice(index, 1);
              console.log("Successfully removed task: " + task.name + " ID: " + task.id);
              console.log(this.tasks);
            } else {
              console.warn("Could not find element in array," +
                  "but it was successfully deleted on the server. Weird");
            }
          } else {
            alert('Could not delete task: ' + task.name);
          }
        },
        error: (response) => {
          alert("Unknown error occurred while deleting task: " + task.name);
          console.error(response);
        }
      });
    },
    setActiveTask(newActiveTask) {
      this.$emit('update:activeTask', newActiveTask);
    },
    updateContextMenu(event, showContextMenu, task) {
      if (event != null) {
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
      }
      this.contextMenuTask = task;
      this.showContextMenu = showContextMenu;
    },
  }
}
</script>

<style scoped>
.cm-submenu {
  display: none;
  position: absolute;
  top: 0;
  left: calc(100%);
  background-color: #2a2a2a;
  border-radius: 0 5px 5px;
  border: thin solid #4a4a4a;
  white-space: nowrap;
}

#cm-container {
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 0;
}

#cm-container * {
  padding: .25em;
  margin: 0;
}

#cm-container hr {
  padding: 0;
}

.cm-item {
  flex: 1 1 100%;
  position: relative;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  cursor: pointer;
  font-size: 11pt;
  padding: 0;
  margin: 0;
}

.cm-item[data-theme="dark"]:hover {
  background-color: #404040;
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

#priority-list {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
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
  margin: 0 0 0.5em 0;
}

ul {
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 0;
}

li {
  list-style: none;
  font-size: 11pt;
  padding: 0;
  margin: 0;
}

div.task {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25em 0.5em;
  margin: 0;
}

div.task[data-theme="light"]:hover {
  background-color: red; /* TODO */
}

div.task[data-theme="dark"]:hover {
  background-color: #2a2a2a;
}

div.task[data-theme="light"]:focus-within {
  background-color: red; /* TODO */
}

div.task[data-theme="dark"]:focus-within {
  background-color: #404040;
}

input[type="checkbox"] {
  margin: 0 0.5em;
  padding: 0.5em;
  font-size: 10pt;
  background-color: transparent;
  border: 1px #4a4a4a solid;
  appearance: none;
  position: relative;
}

input[type="checkbox"]:checked::before {
  content: 'check';
  font-size: inherit;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

input[type="checkbox"][data-theme="light"]:checked::before {
  color: white;
  background-color: black;
}

input[type="checkbox"][data-theme="dark"]:checked::before {
  color: black;
  background-color: #7a7a7a;
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
  margin: 0;
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