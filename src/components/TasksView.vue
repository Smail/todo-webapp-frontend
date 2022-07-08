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
        type: "PATCH",
        url: `http://192.168.2.165:8090/moveTask/${task.id}/${newProject.id}`,
        headers: {
          "Authorization": localStorage.getItem("token"),
        },
        success: () => {
          const index = this.tasks.indexOf(task);

          if (index !== -1) {
            this.tasks.splice(index, 1);
            console.log(`Successfully moved task ${task.name} (ID: ${task.id}) into ${newProject.name} (ID: ${newProject.id})`);
          } else {
            console.warn("Could not find element in array, but it was successfully moved on the server. Weird");
          }
        },
        error: (response) => {
          const errorMsg = `Could not move "${task.name}": ${response.responseText}`;
          alert(errorMsg);
          console.error(errorMsg);
          console.log(response)
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
        url: `http://192.168.2.165:8090/project/${this.project.id}/tasks`,
        headers: {
          "Authorization": localStorage.getItem("token"),
        },
        success: (arr) => {
          // Don't use this.tasks = []; because it dereferences the current array
          this.tasks.length = 0;

          for (const task of arr) {
            this.tasks.push(task);
          }
        },
        error: (response) => {
          const errorMsg = "Could not load projects: " + response.responseText;
          alert(errorMsg);
          console.error(errorMsg);

        }
      });
    },
    /**
     * Set a new task name for a task on client and server.
     * This function will also update the client if the server update was NOT successful.
     *
     * @param task The task, which should be updated.
     * @param newTaskName The new task name for the parameter task.
     */
    setTaskName(task, newTaskName) {
      // The task name will be automatically updated on the client by v-model
      if (task === undefined || task == null) {
        console.error("Invalid argument: task is undefined or null");
        console.error(task);
        return;
      }

      if (typeof (task.id) !== "number") {
        console.error("Invalid argument: typeof (task.id) is " + typeof (task.id));
        console.error(task);
        return;
      }

      $.ajax({
        type: "PATCH",
        url: `http://192.168.2.165:8090/task/${task.id}`,
        data: JSON.stringify({name: newTaskName}),
        contentType: "application/json; charset=utf-8",
        headers: {
          "Authorization": localStorage.getItem("token"),
        },
        error: (response) => {
          const errorMsg = `Could not update task name "${task.name}": ${response}`;
          alert(errorMsg);
          console.error(errorMsg);
        }
      });
    },
    /**
     * Create a new task on client and server
     *
     * @param name string, required
     * @param content
     * @param duration int
     * @param dueDate
     */
    createTask(name, content = "", duration = null, dueDate = null) {
      if (name === undefined || name == null) {
        return;
      }

      let task = {
        name,
        content,
        duration,
        dueDate,
      };

      $.ajax({
        type: "POST",
        url: `http://192.168.2.165:8090/project/${this.project.id}/task`,
        data: JSON.stringify(task),
        contentType: "application/json; charset=utf-8",
        headers: {
          "Authorization": localStorage.getItem("token"),
        },
        success: (response) => {
          // Create task here on the client as well
          const taskId = response.id;

          if (taskId > 0) {
            task.id = taskId;
            this.tasks.push(task);
          }
        },
        error: (response) => {
          const errorMsg = `Could not create task "${task.name}": ${response}`;
          alert(errorMsg);
          console.error(errorMsg);
        }
      });
    },
    deleteTask(task) {
      if (task === undefined || task == null) {
        return;
      }

      // Move the task into the "Deleted" project if it isn't already there, yet.
      // Otherwise, delete it permanently.
      if (this.project === this.$parent.deletedProject) {
        $.ajax({
          type: "DELETE",
          url: `http://192.168.2.165:8090/task/${task.id}`,
          headers: {
            "Authorization": localStorage.getItem("token"),
          },
          success: () => {
            const index = this.tasks.indexOf(task);

            if (index !== -1) {
              this.tasks.splice(index, 1);
              console.log(`Successfully permanently deleted task: ${task.name} (ID: ${task.id})`);
            } else {
              console.warn("Could not find element in array," +
                  "but it was successfully deleted on the server. Weird");
            }
          },
          error: (response) => {
            const errorMsg = `Could not delete "${task.name}": ${response}`;
            alert(errorMsg);
            console.error(errorMsg);
          },
        });
      } else {
        this.moveTaskToProject(task, this.$parent.deletedProject);
      }

      // Make current task inactive. Without this the content panel would still show a permanently deleted task.
      this.$emit("update:activeTask", null);
    },
    setActiveTask(newActiveTask) {
      this.$emit("update:activeTask", newActiveTask);
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

<style lang="scss" scoped>
@import "@/assets/variables.scss";

.cm-submenu {
  display: none;
  position: absolute;
  top: 0;
  left: calc(100%);
  background-color: hsla(hue($theme), saturation($theme), lightness($theme) + 6%, 1);
  border-radius: 0 5px 5px;
  border: thin solid hsla(hue($theme), saturation($theme), lightness($theme) + 19%, 1);
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
  background-color: hsla(hue($theme), saturation($theme), lightness($theme) + 15%, 1);
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
  color: hsla(hue($theme), saturation($theme), lightness($theme) + 2%, 1);
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
  background-color: hsla(hue($theme), saturation($theme), lightness($theme) + 6%, 1);
}

div.task[data-theme="light"]:focus-within {
  background-color: red; /* TODO */
}

div.task[data-theme="dark"]:focus-within {
  background-color: hsla(hue($theme), saturation($theme), lightness($theme) + 15%, 1);
}

input[type="checkbox"] {
  margin: 0 0.5em;
  padding: 0.5em;
  font-size: 10pt;
  background-color: transparent;
  border: 1px hsla(hue($theme), saturation($theme), lightness($theme) + 19%, 1) solid;
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
  background-color: hsla(hue($theme), saturation($theme), lightness($theme) + 38%, 1);
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
  background-color: hsla(hue($theme), saturation($theme), lightness($theme) + 17%, 1);
}

#new-task {
  padding: 0.5em;
  width: calc(100% - 2 * 0.5em);
  border-radius: 5px;
}

#new-task:not([data-theme="dark"]) {
  color: white;
  background-color: hsla(hue($theme), saturation($theme), lightness($theme), 1);
}

#new-task[data-theme="dark"] {
  color: white;
  background-color: hsla(hue($theme), saturation($theme), lightness($theme) + 6%, 1);
}

#new-task::placeholder {
  color: lightgray;
}

#new-task[data-theme="dark"]::placeholder {
  color: hsla(hue($theme), saturation($theme), lightness($theme) + 39%, 1);
}

#new-task:not([data-theme="dark"]):focus {
  outline: thin solid hsla(hue($theme), saturation($theme), lightness($theme), 1);;
}

#new-task[data-theme="dark"]:focus {
  outline: thin solid hsla(hue($theme), saturation($theme), lightness($theme) + 10%, 1);
}
</style>