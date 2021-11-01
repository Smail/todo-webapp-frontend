<template>
  <!-- div needs tabindex or otherwise it cannot get focus -->
  <div id="context-menu" tabindex="-1">
    <slot>
      <ul tabindex="-1">
        <li>Test 1</li>
        <li>Test 2</li>
        <li>Test 3</li>
        <li>Test 4</li>
      </ul>
    </slot>
  </div>
</template>

<script>
export default {
  name: "ContextMenu",
  props: {
    posX: Number,
    posY: Number,
    task: Object,
  },
  watch: {
    posX: {
      immediate: true,
      handler(newValue) {
        $("#context-menu").css("left", newValue);
      }
    },
    posY: {
      immediate: true,
      handler(newValue) {
        $("#context-menu").css("top", newValue);
      }
    }
  },
}
</script>

<style>
#context-menu {
  display: block;
  position: absolute;
  border: thin solid #4a4a4a;
  border-radius: 5px;
  background-color: #2a2a2a;
  filter: drop-shadow(0 0 0.25em black);
}
</style>