<template>
  <div :id="'timeSlot-' + day.toLowerCase().substr(0,3) + '-' + hour"
       :data-day="day" :data-hour="hour" class="cell">
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
  height: calc(100% / 24);
  border: 1px #494949 solid;
  border-bottom: none;
  border-right: none;
  background-color: #1e1e1e;
}
</style>