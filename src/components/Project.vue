<template>
  <li :class="{ active: isActive }" class='project' data-theme='dark' draggable='true'>
    <span class='material-icons'>{{ icon }}</span><a href='#'>{{ name }}</a>
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

<style>
.project {
  display: flex;
  align-items: center;
  gap: 3%;
  padding: 4%;
  margin: 1%;
  border-radius: 5px;
  background-color: blueviolet;
  cursor: pointer;
}

.project:hover, .project:active {
  background-color: green;
}

.project[data-theme="dark"] {
  color: white;
}

.project.active {
  background-color: blue;
}
</style>
