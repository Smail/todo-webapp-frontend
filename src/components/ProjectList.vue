<template>
  <section v-if="projects.length > 0">
    <h5 v-if="sectionTitle != null && sectionTitle.length > 0" class="project-list-section-title" :data-theme="theme">
      {{ sectionTitle }}
    </h5>
    <ul :data-theme="theme">
      <Project v-for="project in projects"
               :is-active="activeProject === project"
               :project="project"
               :theme="theme"
               @click="$emit('update:activeProject', project)">
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
    activeProject: Object,
    // [{id: Number, name: String, icon: String?}]
    projects: Array,
    theme: String,
  },
  emits: ["update:activeProject"],
  methods: {},
}
</script>

<style>
.project-list-section-title {
  padding: 0 1em;
  margin: 0.5em 0;
}
</style>
