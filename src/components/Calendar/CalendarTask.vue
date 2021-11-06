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
  left: 0;
  right: 0;
  margin: 0 0.5em 0 0;

  background-color: rgba(0, 139, 139, 0.5);

  text-overflow: ellipsis;

  white-space: break-spaces;
  overflow: auto;

  border: 1px #008B8BFF solid;
  border-radius: 5px;
  padding: 0;

  cursor: pointer;
}

.cal-task-container {
  padding: 0.5em;
}

.cal-task-header {
  margin: 0 0 0.5em;
  padding: 0;
}

.cal-task-desc {
  margin: 0;
  padding: 0;
}
</style>