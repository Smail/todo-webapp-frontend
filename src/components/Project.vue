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
          return "calendar_today";
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

<style scoped>
.project {
  display: flex;
  align-items: center;
  gap: 0.5em;
  padding: 0.75em 0.5em;
  border-radius: 5px;
  cursor: pointer;
  background-color: transparent;
}

.project[data-theme="light"] {
  color: black;
}

.project[data-theme="dark"] {
  color: white;
}

.project[data-theme="light"]:hover {
  color: white;
  background-color: #afafaf;
}

.project[data-theme="dark"]:hover {
  color: white;
  background-color: #2a2a2a;
}

.project[data-theme="light"].active {
  color: white;
  background-color: #1a1a1a;
}

.project[data-theme="dark"].active {
  color: white;
  background-color: #484848;
}

.material-icons {
  font-size: 12pt;
}

.material-icons[data-theme="dark"] {
  color: #7a7a7a;
}

p {
  font-size: 11pt;
}
</style>
