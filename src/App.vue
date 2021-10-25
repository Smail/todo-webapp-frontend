<template>
  <!-- eslint-disable -->
  <div id="app">
    <div id="sidebar">
      <ProjectList v-model:active-project-id="activeProjectId" :projects="defaultProjects"></ProjectList>
      <hr v-if="userProjects.length > 0">
      <ProjectList v-model:active-project-id="activeProjectId" :projects="userProjects"
                   section-title="Projects"></ProjectList>
    </div>

    <div id="middle-section">
      <TasksView :project="getActiveProjectName()"></TasksView>
    </div>

    <div id="right-section">

    </div>
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
    Project
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
  methods: {
    loadUserProjects() {
      $.post('http://api.todo.smail.de/ajax.php', {
        action: 'get_all_projects',
        // TODO add bearer token, username or simply some form of authentication
      }, (response) => {
        const json = $.parseJSON(response);
        for (const obj of json) {
          this.userProjects.push(obj);
        }
      });
    },
    getActiveProjectName() {
      return this.defaultProjects.concat(this.userProjects).find(value => value.id === this.activeProjectId);
    },
  },
  beforeCreate() {
    $.ajaxSetup({
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      }
    });

    $.post('http://api.todo.smail.de/login.php', {username: 'Smail', password: 'secure'}, function (response) {
      console.log(response);
    }).fail(function (response) {
      console.error(response);
      alert("Could not log in. See console errors for more");
    });
  },
  created() {
    this.loadUserProjects();
    console.log("sfsdfsd" + this.userProjects);
  },
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  font-family: Roboto, sans-serif;
}

a, a:visited {
  color: inherit;
  text-decoration: none;
}

#app {
  width: 100vw;
  height: 100vh;
  display: flex;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#sidebar {
  background: aqua;
  flex: 2;
}

#middle-section {
  background: red;
  flex: 7;
}

#right-section {
  background: green;
  flex: 7;
}
</style>
