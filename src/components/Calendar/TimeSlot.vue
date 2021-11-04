<template>
  <div :id="'timeSlot-' + day.toLowerCase().substr(0,3) + '-' + hour"
       class="cell">
    <!-- Injection point -->
  </div>
</template>

<script>
export default {
  name: "TimeSlot",
  props: {
    day: String,
    hour: Number,
  },
}
</script>

<style>
.cell {
  padding: 0.5em;
  margin: 0;
  min-height: 2em;
  border: 1px #494949 solid;
  border-bottom: none;
  border-right: none;
  /*border-radius: 5px;*/
  background-color: #1e1e1e;
}
</style>