<template id="app" :data-theme="theme">
  <!-- eslint-disable -->
  <div id="left-section" :data-theme="theme" class="border-right">
    <ProjectList v-model:active-project-id="activeProjectId" :data-theme="theme"
                 :projects="defaultProjects" :theme="theme"></ProjectList>
    <hr v-if="userProjects.length > 0" :data-theme="theme" class="divisor">
    <ProjectList v-model:active-project-id="activeProjectId" :data-theme="theme"
                 :projects="userProjects" :theme="theme" section-title="Projects"></ProjectList>
  </div>

  <div id="middle-section" :data-theme="theme" class="border-right">
    <TasksView v-model:active-task="activeTask" :data-theme="theme" :project="activeProjectName"
               :theme="theme"></TasksView>
  </div>

  <div id="right-section" :data-theme="theme">
    <ContentPanel v-model:active-task="activeTask" :theme="theme"></ContentPanel>
  </div>
</template>

<script>
import Project from "@/components/Project";
import ProjectList from "@/components/ProjectList";
import TasksView from "@/components/TasksView";
import ContentPanel from "@/components/ContentPanel";

export default {
  name: 'App',
  components: {
    ContentPanel,
    TasksView,
    ProjectList,
    Project,
  },
  data() {
    return {
      // TODO We still need to create the default projects and insert them into the database. For now we'll use high IDs to not get a conflict
      activeProjectId: 200,
      defaultProjects: [
        {id: 200, icon: 'inbox', name: 'Inbox'},
        {id: 210, icon: 'calendar_today', name: 'Today'},
        {id: 220, icon: 'upcoming', name: 'Upcoming'},
      ],
      userProjects: [],
      activeTask: null,
      theme: 'dark',
    }
  },
  computed: {
    activeProjectName() {
      return this.defaultProjects.concat(this.userProjects).find(value => value.id === this.activeProjectId);
    },
  },
  methods: {
    loadUserProjects() {
      $.ajax({
        type: 'POST',
        url: 'http://api.todo.smail.de/ajax.php',
        data: {
          // TODO add bearer token, username or simply some form of user authentication
          'action': 'get_user_projects',
        },
        success: (response) => {
          const json = $.parseJSON(response);
          for (const obj of json) {
            this.userProjects.push(obj);
          }
        },
        error: (response) => {
          console.log(response);
        }
      });
    },
  },
  beforeCreate() {
    $.ajaxSetup({
      crossDomain: true,
      xhrFields: {
        withCredentials: true,
      }
    });

    // Login
    $.post('http://api.todo.smail.de/login.php', {username: 'Smail', password: 'secure'}, function (response) {
      // console.log(response);
    }).fail(function (response) {
      console.error(response);
      alert("Could not log in. See console errors for more");
    });
  },
  created() {
    this.loadUserProjects();
  },
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  font-family: Roboto, sans-serif;
}

/* width */
::-webkit-scrollbar {
  width: 5px;
}

/* Track */
::-webkit-scrollbar-track {
  background: transparent;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 5px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.divisor {
  width: 90%;
  height: 1px;
  border: 0;
  align-self: center;
  margin: 0.5em;
}

.divisor[data-theme="light"] {
  background-color: black;
}

.divisor[data-theme="dark"] {
  background-color: #323232;
}

#app {
  min-width: 100vw;
  min-height: 100vh;
  max-width: 100vw;
  max-height: 100vh;
  overflow: hidden;
  display: flex;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#left-section {
  display: flex;
  flex-direction: column;
  flex: 1;
}

#left-section[data-theme="light"] {
  color: black;
  background: white;
}

#left-section[data-theme="dark"] {
  color: white;
  background: #1a1a1a;
}

#middle-section {
  flex: 6;
  height: 100vh;
  overflow-y: auto;
}

#middle-section:not([data-theme="dark"]) {
  color: black;
  background: white;
}

#middle-section[data-theme="dark"] {
  color: white;
  background: #1e1e1e;
}

#right-section {
  flex: 6;
  background: #1a1a1a;
  height: 100vh;
  overflow-y: auto;
}

#right-section:not([data-theme="dark"]) {
  color: black;
  background: white;
}

#right-section[data-theme="dark"] {
  color: white;
  background: #1a1a1a;
}

.border-right[data-theme="light"] {
  border-right: 1px black solid;
}

.border-right[data-theme="dark"] {
  border-right: 1px #323232 solid;
}

</style>
