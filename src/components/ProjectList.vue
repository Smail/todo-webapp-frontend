<template>
  <section v-if="projects.length > 0">
    <h5 v-if="sectionTitle != null && sectionTitle.length > 0" :data-theme="theme">
      {{ sectionTitle }}
    </h5>
    <ul :data-theme="theme">
      <Project v-for="project in projects" :id="project.id" :icon="project.icon"
               :data-theme="theme" :is-active="activeProjectId === project.id"
               :name="project.name" :theme.prop="theme"
               @click="$emit('update:activeProjectId', project.id)">
      </Project>
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
    projects: Array,
    theme: String,
  },
  emits: ['update:activeProjectId'],
  methods: {},
}
</script>

<style scoped>
h5 {
  padding: 0 1em;
}

ul {
  display: flex;
  flex-direction: column;
  padding: 0.5em 0.5em 0 0.5em;
}
</style>
