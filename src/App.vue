<template id="app">
  <!-- eslint-disable -->
  <div id="sidebar">
    <ProjectList v-model:active-project-id="activeProjectId" :projects="defaultProjects"></ProjectList>
    <hr v-if="userProjects.length > 0">
    <ProjectList v-model:active-project-id="activeProjectId" :projects="userProjects"
                 section-title="Projects"></ProjectList>
  </div>

  <div id="middle-section">
    <TasksView :project="activeProjectName"></TasksView>
  </div>

  <div id="right-section">

  </div>
</template>

<script>
import Project from "@/components/Project";
import ProjectList from "@/components/ProjectList";
import TasksView from "@/components/TasksView";

export default {
  name: 'App',
  components: {
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
          'action': 'get_all_projects',
        },
        success: (response) => {
          const json = $.parseJSON(response);
          for (const obj of json) {
            this.userProjects.push(obj);
          }
        },
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

hr {
  width: 80%;
  background-color: black;
  height: 1px;
  border: 0;
  align-self: center;
}

#app {
  min-width: 100vw;
  min-height: 100vh;
  display: flex;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#sidebar {
  display: flex;
  flex-direction: column;
  background: aqua;
  flex: 1;
}

#middle-section {
  background: red;
  flex: 6;
  height: 100vh;
  overflow-y: auto;
}

#right-section {
  background: green;
  flex: 6;
}
</style>
