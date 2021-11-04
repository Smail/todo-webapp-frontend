<template>
  <!-- eslint-disable -->
  <div v-if="hasLoaded" id="app" :data-theme="theme">
    <div id="left-section" :data-theme="theme" class="border-right">
      <ProjectList v-model:active-project-id="activeProjectId"
                   :projects="defaultProjects" :theme="theme"></ProjectList>
      <hr :data-theme="theme" class="divisor">
      <router-link :data-theme="theme" class="project" to="/calendar">
        <span :data-theme="theme" class="material-icons">date_range</span>
        <p>Calendar</p>
      </router-link>
      <hr v-if="defaultProjects.length > 0" :data-theme="theme" class="divisor">
      <ProjectList v-model:active-project-id="activeProjectId"
                   :projects="userProjects" :theme="theme" section-title="Projects"></ProjectList>
      <hr v-if="userProjects.length > 0" :data-theme="theme" class="divisor">
      <ProjectList v-model:active-project-id="activeProjectId"
                   :projects="otherProjects" :theme="theme"></ProjectList>
    </div>

    <div id="middle-section" :data-theme="theme" class="border-right">
      <TasksView v-model:active-task="activeTask" :data-theme="theme"
                 :project="activeProject" :projects="projects"
                 :theme="theme"></TasksView>
    </div>

    <div id="right-section" :data-theme="theme">
      <ContentPanel v-model:active-task="activeTask" :theme="theme"></ContentPanel>
    </div>
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
      activeProjectId: Number,
      // [{id: Number, name: String, icon: String?}]
      projects: [],
      // {id: int, name: String, content: String, duration: int, dueDate: String}
      activeTask: null,
      theme: 'dark',
      hasLoaded: false,
    }
  },
  computed: {
    activeProject() {
      return this.projects
          .find(p => p.id === this.activeProjectId);
    },
    inboxProject() {
      return this.projects
          .find(value => value.name.toLowerCase() === 'inbox');
    },
    defaultProjects() {
      return this.projects
          .filter(value => {
            const str = value.name.toLowerCase();
            return str === 'inbox' || str === 'today' || str === 'upcoming';
          });
    },
    userProjects() {
      return this.projects
          .filter(x => !this.defaultProjects.includes(x) && !this.otherProjects.includes(x));
    },
    otherProjects() {
      return this.projects
          .filter(value => {
            const str = value.name.toLowerCase();
            return str === 'deleted' || str === 'completed';
          });
    },
  },
  methods: {
    /**
     * Creates a new token and returns it in a promise.
     * @returns {Promise<{getAllResponseHeaders: function(): *|null, abort: function(*=): this, setRequestHeader: function(*=, *): this, readyState: number, getResponseHeader: function(*): null|*, overrideMimeType: function(*): this, statusCode: function(*=): this}|*|jQuery>}
     */
    async createToken(username, password) {
      return $.ajax({
        type: 'POST',
        url: 'http://192.168.2.165:8082/ajax.php',
        data: {
          'action': 'create_token',
          'username': username,
          'password': password,
        },
      });
    },
    /**
     * Log the user in
     * @returns {Promise<void>}
     */
    async login(username, password) {
      const token = await this.createToken(username, password);
      localStorage.setItem('token', 'Bearer ' + token);
    },
    async loadUserProjects() {
      const response = await $.ajax({
        type: 'POST',
        url: 'http://192.168.2.165:8082/ajax.php',
        data: {
          'action': 'get_user_projects',
        },
        headers: {
          'Authorization': localStorage.getItem('token'),
        },
      });

      // Add received projects into the projects array
      const json = $.parseJSON(response);
      for (const obj of json) {
        this.projects.push(obj);
      }
    },
  },
  async created() {
    try {
      await this.login("smail", "smail1234");
      await this.loadUserProjects();

      if (this.inboxProject != null) {
        this.activeProjectId = this.inboxProject.id;
        this.hasLoaded = true;
      } else {
        console.warn("User has no projects. Not even defaults. Won't continue loading");
      }
    } catch (e) {
      console.log("Could not log in." + e);
    }
  },
}
</script>

<style>
* {
  font-family: Roboto, sans-serif;
  list-style-position: inside;
}

body {
  padding: 0;
  margin: 0;
}

a {
  text-decoration: none;
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

body[data-theme="light"] {
  color: black;
  background: white;
}

body[data-theme="dark"] {
  color: white;
  background: #1a1a1a;
}

#app {
  min-width: 100vw;
  min-height: 100vh;
  max-width: 100vw;
  max-height: 100vh;
  margin: 0;
  overflow: hidden;
  display: flex;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#left-section {
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-top: 0.5em;
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
