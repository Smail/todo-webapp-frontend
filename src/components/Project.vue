<template>
  <li :class="{ active: isActive }" :data-theme="theme" class="project" draggable="true">
    <!-- Draw the normal list icon if there was no specific icon passed -->
    <span v-if="icon != null" :data-theme="theme" class="material-icons">{{ icon }}</span>
    <span v-else :data-theme="theme" class="material-icons">list</span>
    <p :data-theme="theme">{{ name }}</p>
  </li>
</template>

<script>
export default {
  name: "Project",
  props: {
    id: Number,
    icon: String,
    name: String,
    isActive: Boolean,
    theme: String,
  },
  methods: {}
}
</script>

<style scoped>
.material-icons {
  font-size: 13pt;
}

p {
  font-size: 11pt;
}

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
</style>
