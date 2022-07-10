<template>
  <section id="task-view-section" @focusout="updateContextMenu($event, false, null)">
    <h1 id="task-view-section-title" :data-theme="theme">{{ project.name }}</h1>
    <ul>
      <li v-for="(task, index) in tasks" :data-theme="theme">
        <!-- Choosing @input instead of @focusout increases the server load, so this might be open to change -->
        <!-- <input v-model="task.name" @focusout="updateTask"/> -->
        <div :data-theme="theme" class="task"
             @click="setActiveTask(task)"
             @contextmenu="updateContextMenu($event, true, task)">
          <input class="material-icons-outlined task-checkbox" type="checkbox" :data-theme="theme"/>
          <input v-model="task.name" class="task-name-input" type="text" :data-theme="theme" 
                 @input="setTaskName(task, $event.target.value)"/>
          <button class="more-options-btn" :data-theme="theme"
                  @click="updateContextMenu($event, true, task)">
            <span class="material-icons">more_horiz</span>
          </button>
        </div>
        <hr v-if="index < tasks.length - 1" class="task-divider" :data-theme="theme">
      </li>
      <li>
        <input id="new-task" :data-theme="theme" placeholder="New task" type="text"
               @keypress.enter="createTask($event.target.value); clearNewTaskInputField();"/>
      </li>
    </ul>
    <ContextMenu v-show="showContextMenu" id="context-menu" :pos-x="contextMenuPosX"
                 :pos-y="contextMenuPosY" :task="contextMenuTask" :data-theme="theme">
      <ul id="cm-container" :data-theme="theme">
        <li style="margin: 0.5rem;">
          <h5 :data-theme="theme">Priority</h5>
        </li>
        <li style="margin: 0 0.25rem;">
          <ul id="cm-priority-list" :data-theme="theme">
            <!-- The class "justify-center" must come  -->
            <li v-for="i in [3, 2, 1, 0]" :data-theme="theme" class="cm-item-priority material-icons-round">
              <template v-if="i == 0">
                not_interested
              </template>
              <template v-else>
                {{ "priority_high".repeat(i) }}
              </template>
            </li>
          </ul>
        </li>
        <li style="margin: 0.25rem 0">
          <hr :data-theme="theme" class="task-divider">
        </li>
        <li :data-theme="theme" class="cm-item"
            @mouseenter="displaySubmenu($event.target, true)"
            @mouseleave="displaySubmenu($event.target, false)">
          <span class="material-icons-outlined">exit_to_app</span>
          <p>Move to different project</p>

          <ul class="cm-submenu" :data-theme="theme">
            <Project v-for="p in projects.filter(proj => proj !== project)"
                     :is-active="false"
                     :project="p"
                     :theme="theme"
                     @click="moveTaskToProject(contextMenuTask, p); hideContextMenu();">
            </Project>
          </ul>
        </li>
        <li :data-theme="theme" class="cm-item">
          <span class="material-icons-outlined">label</span>
          <p>Tags</p>
        </li>
        <li style="margin: 0.25rem 0">
          <hr :data-theme="theme" class="task-divider">
        </li>
        <li :data-theme="theme" class="cm-item">
          <span class="material-icons-outlined">file_copy</span>
          <p>Duplicate</p>
        </li>
        <li :data-theme="theme" class="cm-item"
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

<style lang="scss">
@import "@/assets/variables.scss";

.cm-submenu {
  display: none;
  position: absolute;
  top: 0;
  left: calc(100%);
  border-radius: 0 5px 5px;
  white-space: nowrap;
  border: thin solid;
}

.cm-submenu .project {
  margin: 0 0.25rem;
}

.cm-submenu .project:first-child {
  margin-top: 0.25rem;
}

.cm-submenu .project:last-child {
  margin-bottom: 0.25rem;
}

#cm-container {
  display: flex;
  flex-direction: column;
  margin-bottom: 0.25rem;
}

@mixin cm-item {
  flex: 1 1 100%;
  position: relative;
  display: flex;
  align-items: center;
  border-radius: 5px;
  cursor: pointer;
}

.cm-item {
  @include cm-item;
  justify-content: flex-start;
  padding: 0.5em;
  margin: 0 0.25rem;
}

.cm-item-priority {
  @include cm-item;
  align-items: center;
  justify-content: center;
  border-radius: 1rem;
  letter-spacing: -0.75em;
  text-indent: -0.75em;
  text-align: center;
  padding: 0.5em;
}

.cm-item-priority:nth-child(1) {
  color: red;
}

.cm-item-priority:nth-child(2) {
  color: orange;
}

.cm-item-priority:nth-child(3) {
  color: yellow;
}

.cm-item > .material-icons,
.cm-item > .material-icons-outlined,
.cm-item > .material-icons-round {
  padding: 0 0.25em 0 0;
}

#cm-priority-list {
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
}

.more-options-btn {
  display: flex;
  justify-content: center;
  border: 0 none;
  background-color: transparent;
}

#task-view-section {
  padding: 1em;
}

#task-view-section-title {
  text-transform: capitalize;
  margin: 0 0 0.5em 0;
}

.task {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25em 0.5em;
}

.task-checkbox {
  margin: 0 0.5em;
  padding: 0.5em;
  font-size: 10pt;
  background-color: transparent;
  border: 1px solid;
  appearance: none;
  position: relative;
}

.task-checkbox:checked::before {
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

.task-name-input {
  background-color: transparent;
  border-width: 0;
  font-size: inherit;
  margin: 0.5em 0;
  outline: none; /* TODO */
  width: 100%;
}

.task-divider {
  height: 1px;
  border: none;
}

#new-task {
  padding: 0.5em;
  width: calc(100% - 2 * 0.5em);
  border-radius: 5px;
  border: solid 1px;
}

#new-task:focus {
  outline: thin solid;
}
</style>