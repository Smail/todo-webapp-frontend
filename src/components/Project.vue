<template>
  <li :class="{ active: isActive }" :data-theme="theme" class="project" draggable="true">
    <!-- Draw the normal list icon if there was no specific icon passed -->
    <span :data-theme="theme" class="material-icons">{{ icon }}</span>
    <p :data-theme="theme">{{ project.name }}</p>
  </li>
</template>

<script>
export default {
  name: "Project",
  props: {
    // {id: int, name: String, icon: String?}
    project: Object,
    isActive: Boolean,
    theme: String,
  },
  computed: {
    icon() {
      // TODO Instead of hard coding the icons here, add an icon column to the database
      switch (this.project.name.toLowerCase()) {
        case "inbox":
          return "inbox";
        case "today":
          return "today";
        case "calendar":
          return "date_range";
        case "upcoming":
          return "upcoming";
        case "completed":
          return "check_box";
        case "deleted":
        case "trash":
          return "delete";
        default:
          return "list";
      }
    }
  },
  methods: {},
}
</script>

<style lang="scss">
@import "@/assets/variables.scss";

.project {
  display: flex;
  align-items: center;
  gap: 0.5em;
  padding: 0.75em 0.5em;
  margin: 0 0.5em;
  border-radius: 5px;
  cursor: pointer;
  background-color: transparent;
}
</style>
