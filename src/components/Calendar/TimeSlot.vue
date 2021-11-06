<template>
  <div :id="'timeSlot-' + day.toLowerCase().substr(0,3) + '-' + hour"
       class="cell"
       @mousedown="mark"
       @mousemove="test"
       @mouseup="$emit('unmarkCell', this);">
    <!-- Injection point -->

    <!--    <div v-if="existsTask(day, hour)"-->
    <!--         class="task">-->
    <!--      htkkkasdhdfaklsdjhf-->
    <!--    </div>-->
  </div>
</template>

<script>
export default {
  name: "TimeSlot",
  props: {
    day: String,
    hour: Number,
    tasks: Array,
    task: null,
    startTimeSlot: null,
    endTimeSlot: null,
    // isMarked
  },
  methods: {},
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

  position: relative;
}
</style>