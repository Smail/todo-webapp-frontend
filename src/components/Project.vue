<template>
  <li :class="{ active: isActive }" class="project" draggable="true">
    <!-- Draw the normal list icon if there was no specific icon passed -->
    <span v-if="icon != null" class="material-icons">{{ icon }}</span>
    <span v-else class="material-icons">list</span>
    <p>{{ name }}</p>
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
  },
  methods: {}
}
</script>

<style scoped>
.project {
  display: flex;
  align-items: center;
  gap: 0.5em;
  padding: 0.75em;
  border-radius: 5px;
  background-color: transparent;
  cursor: pointer;
}

.material-icons {
  font-size: 13pt;
}

p {
  font-size: 11pt;
}

.project:hover {
  background-color: yellow;
}

.project:not([data-theme="dark"]) {
  color: black;
}

.project[data-theme="dark"] {
  color: white;
}

.project:not([data-theme="dark"]).active {
  color: white;
  background-color: blue;
}

.project[data-theme="dark"].active {
  color: white;
  background-color: blue;
}
</style>
