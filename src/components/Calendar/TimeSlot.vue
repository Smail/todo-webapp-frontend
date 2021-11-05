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
  methods: {
    existsTask(day, hour) {
      console.log(this.tasks);
      const v = this.tasks.find(task => task.id === this.getTimeSlotId(day, hour));
      console.log(v)
      return v !== undefined;
    },
    mark(e) {
      console.log(e)
      this.$emit("markCell", this);
    },
    test() {
      // console.log("move")
    },
    createTask() {

    },
    getTimeSlotId(day, hour) {
      return 'timeSlot-' + day.toLowerCase().substr(0, 3) + '-' + hour;
    }
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

  position: relative;
}
</style>