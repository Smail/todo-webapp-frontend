<template>
  <div :style="'top:' + top + ';height:' +  height"
       class="cal-task" draggable="true">
    <div class="cal-task-container">
      <h5 class="cal-task-header">{{ task.name }}</h5>
      <p class="cal-task-desc">
        {{ task.content }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: "CalendarTask",
  props: {
    task: Object,
  },
  computed: {
    top() {
      return "calc(100% / 24 * " + this.task.startHour + ");";
    },
    height() {
      return "calc(100% / 24 * " + Math.abs(this.task.endHour - this.task.startHour) + " - 1px);";
    }
  }
}
</script>

<style scoped>
.cal-task {
  position: absolute;
  left: 1px;
  right: 0;

  background-color: inherit;

  text-overflow: ellipsis;

  white-space: break-spaces;

  border: 1px solid;
  border-color: inherit;
  border-radius: 5px;
  margin: 0;
  padding: 0;

  cursor: pointer;

  transition: height ease-out 100ms,
  background-color ease-out 500ms,
  border-top-color ease-out 500ms,
  border-right-color ease-out 500ms,
  border-left-color ease-out 500ms,
  border-bottom-color ease-out 500ms;
}

.cal-task-container {
  margin: 0;
  padding: 0.25em;
  font-size: inherit;
}

.cal-task-header {
  margin: 0;
  padding: 0;
  white-space: nowrap;
}

.cal-task-desc {
  margin: 0;
  padding: 0;
}
</style>