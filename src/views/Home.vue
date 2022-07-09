<template>
  <!-- eslint-disable -->
  <div v-if="hasLoaded" id="app-content" :data-theme="theme">
    <div id="left-section" :data-theme="theme" class="border-right">
      <hr :data-theme="theme" class="divider">
      <router-link :data-theme="theme" class="project" to="/calendar">
        <span :data-theme="theme" class="material-icons">date_range</span>
        <p>Calendar</p>
      </router-link>
      <hr v-if="defaultProjects.length > 0" :data-theme="theme" class="divider">
      <ProjectList v-model:active-project="activeProject" :projects="userProjects" :theme="theme"
        section-title="Projects"></ProjectList>
      <hr v-if="userProjects.length > 0" :data-theme="theme" class="divider">
      <ProjectList v-model:active-project="activeProject" :projects="otherProjects" :theme="theme"></ProjectList>
    </div>

    <div id="middle-section" :data-theme="theme" class="border-right">
      <TasksView v-model:active-task="activeTask" :data-theme="theme" :project="activeProject" :projects="projects"
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
  name: "App",
  components: {
    ContentPanel,
    TasksView,
    ProjectList,
    Project,
  },
  data() {
    return {
      activeProject: null,
      // [{id: Number, name: String, icon: String?}]
      projects: [],
      // {id: int, name: String, content: String, duration: int, dueDate: String}
      activeTask: null,
      theme: "dark",
      hasLoaded: false,
    }
  },
  computed: {
    inboxProject() {
      return this.projects
        .find(value => value.name.toLowerCase() === "inbox");
    },
    todayProject() {
      return this.projects
        .find(value => value.name.toLowerCase() === "today");
    },
    upcomingProject() {
      return this.projects
        .find(value => value.name.toLowerCase() === "upcoming");
    },
    deletedProject() {
      return this.projects
        .find(value => value.name.toLowerCase() === "deleted");
    },
    completedProject() {
      return this.projects
        .find(value => value.name.toLowerCase() === "completed");
    },
    defaultProjects() {
      return this.projects
        .filter(value => {
          const str = value.name.toLowerCase();
          return str === "inbox" || str === "today" || str === "upcoming";
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
          return str === "deleted" || str === "completed";
        });
    },
  },
  methods: {
    async login(username, password) {
      try {
        const response = await $.ajax({
          type: "POST",
          url: "http://192.168.2.165:8090/login",
          headers: {
            "Authorization": "Basic " + Buffer.from(username + ":" + password, "utf-8").toString("base64"),
          }
        });

        localStorage.setItem("token", "Bearer " + response.token);
        return true;
      } catch (e) {
        console.error("Could not log in.");
        console.error(e.stack);

        return false;
      }
    },
    async loadProjects() {
      try {
        const response = await $.ajax({
          type: "GET",
          url: "http://192.168.2.165:8090/projects",
          headers: {
            "Authorization": localStorage.getItem("token"),
          },
        });

        // Add received projects into the projects array
        for (const obj of response) {
          this.projects.push(obj);
        }
      } catch (e) {
        console.error("Could not load projects.");
        console.error(e.stack);
      }
    },
  },
  async created() {
    if (await this.login("Smail", "secure")) {
      await this.loadProjects();

      if (this.projects != null && this.projects.length > 0) {
        this.activeProject = this.inboxProject ?? this.projects[0];
        this.hasLoaded = true;
      } else {
        console.warn("User has no projects (not even defaults). Stop loading.");
      }
    }
  },
}
</script>

<style lang="scss">
@import "@/assets/variables.scss";

#app-content {
  min-width: 100vw;
  min-height: 100vh;
  max-width: 100vw;
  max-height: 100vh;
  margin: 0;
  overflow: hidden;
  display: flex;
}

#left-section {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 0.5em 0;
}

#middle-section {
  flex: 6;
  height: 100vh;
  overflow-y: auto;
}

#right-section {
  flex: 6;
  height: 100vh;
  overflow-y: auto;
}

.border-right {
  border-right: 1px solid;
}

.divider {
  width: 90%;
  height: 1px;
  border: 0;
  align-self: center;
  margin: 0.5em;
}
</style>
