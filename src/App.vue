<template>
  <!-- eslint-disable -->
  <div id="app">
    <div id="sidebar">
      <ProjectList :projects="defaultProjects" :active-project-id="activeProjectId"></ProjectList>
      <hr v-if="userProjects.length > 0">
      <ProjectList section-title="Projects" :projects="userProjects" :active-project-id="activeProjectId"></ProjectList>
    </div>

    <div id="middle-section">
      <TasksView :project-id="activeProjectId"></TasksView>
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
      activeProjectId: 1,
      defaultProjects: [
        {id: 1, icon: 'inbox', text: 'Inbox'},
        {id: 2, icon: 'calendar_today', text: 'Today'},
        {id: 3, icon: 'upcoming', text: 'Upcoming'},
      ],
      userProjects: [],
    }
  }
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
  background: green   ;
  flex: 7;
}
</style>
