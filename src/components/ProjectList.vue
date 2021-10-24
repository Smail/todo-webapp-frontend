<template>
  <section v-if="projects.length > 0">
    <h2 v-if="sectionTitle === null">{{ sectionTitle }}</h2>
    <ul class="projects">
      <Project v-for="project in projects" :icon="project.icon" :text="project.text"
               :is-active="activeProjectId === project.id"></Project>
    </ul>
  </section>
</template>

<script>
import Project from "@/components/Project";

export default {
  name: "ProjectList",
  components: {Project},
  props: {
    sectionTitle: String,
    activeProjectId: Number,
    // [{id: Number, icon: String, text: String}]
    projects: [],
  }
}
</script>

<style>
.projects {
  display: flex;
  flex-direction: column;
}
</style>