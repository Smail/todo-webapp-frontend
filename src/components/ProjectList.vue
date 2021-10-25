<template>
  <section v-if="projects.length > 0">
    <h2 v-if="sectionTitle === null">{{ sectionTitle }}</h2>
    <ul class="projects">
      <Project v-for="project in projects" :id="project.id" :icon="project.icon"
               :is-active="activeProjectId === project.id"
               :name="project.name" @click="setActive"></Project>
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
    // [{id: Number, icon: String, name: String}]
    projects: [],
  },
  emits: ['update:active-project-id'],
  methods: {
    setActive(id) {
      if (this.activeProjectId !== id) {
        this.$emit('update:active-project-id', id);
      }
    }
  }
}
</script>

<style>
.projects {
  display: flex;
  flex-direction: column;
}
</style>