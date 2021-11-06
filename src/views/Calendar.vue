<template>
  <div id="calendar">
    <header id="calendar-header">
      <h1 id="calendar-h1">Calendar</h1>
      <nav>
        <router-link id="home" to="/"><span id="home" class="material-icons">home</span></router-link>
      </nav>
    </header>
    <div id="week-view" @mousemove="test" @mouseup="finishTaskCreation($event.target)">
      <h2></h2>
      <h2 v-for="dayName in ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']"
          :style="'grid-area:' + dayName.toLowerCase().substr(0, 3) + ';'" class="day-name">
        {{ dayName.charAt(0).toUpperCase() + dayName.slice(1, 3) }}
      </h2>

      <!-- Monday -->
      <div class="day" style="grid-area: d01;">
        <div v-for="hour in Array(24).fill(0).map((x, y) => x + y)"
             style="grid-area: d01;">
          <div style="display:flex;flex-direction: row;align-items: flex-start;">
            <p class="time">
              {{ hour > 9 ? hour : ("0" + hour) }}:00
            </p>
            <TimeSlot :hour="hour" :tasks="tasks" class="cell"
                      day="mon" style="flex: 1;"
                      @mousedown="initTaskCreation('mon', hour)">
            </TimeSlot>
          </div>
        </div>
      </div>

      <!-- Rest of the week -->
      <div v-for="day in ['tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']" class="day">
        <TimeSlot v-for="hour in Array(24).fill(0).map((x, y) => x + y)"
                  :day="day" :hour="hour" :tasks="tasks"
                  @mousedown="initTaskCreation(day, hour)">
        </TimeSlot>

        <!-- Task -->
        <div v-for="task in tasks.filter(t => t.startDay === day)"
             :style="'top:' + (100/24 * task.startHour) + '%;height:' + (100/24 * Math.abs(task.endHour - task.startHour)) + '%;'"
             class="cal-task" draggable="true">
          <div class="cal-task-container">
            <h5 class="cal-task-header">{{ task.name }}</h5>
            <p class="cal-task-desc">{{ task.name }}: {{ task.startDay }} : {{ task.endHour - task.startHour }}

              One cell has the height 1/24 * 100 = 4.16%. Multiply that with the number of cells to span over

              TODO fix midnight time wrap
              TODO disallow going back in time</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TimeSlot from "@/components/Calendar/TimeSlot";

const CalendarViewMode = {
  DAY: "day",
  WEEK: "week",
  MONTH: "month",
  YEAR: "year",
};

export default {
  name: "Calendar",
  components: {TimeSlot},
  props: {
    theme: String,
  },
  data() {
    return {
      view: CalendarViewMode.WEEK,
      taskToCreate: null,
      tasks: [
        {
          name: "test",
          startDay: "tuesday",
          startHour: 3,
          endHour: 5,
        },
        {
          name: "test",
          startDay: "tuesday",
          startHour: 10,
          endHour: 7,
        },
      ],
    }
  },
  methods: {
    dragTask(event, task) {
      event.preventDefault();
    },
    test() {
      // console.log("lök")
    },
    initTaskCreation(day, hour) {
      this.taskToCreate = {
        startDay: day,
        startHour: hour,
      };

      console.log("init")
    },
    finishTaskCreation(element) {
      if (this.taskToCreate == null) {
        return;
      }

      function getEndDate(element) {
        const day = $(element).attr("data-day");
        const hour = Number($(element).attr("data-hour")) + 1;
        return {day: day, hour: hour};
      }

      const endTime = getEndDate(element)
      console.log("finish: " + endTime.day + " " + endTime.hour);
      const t = this.taskToCreate;
      this.createTask(t.startDay, t.startHour, endTime.day, endTime.hour);
      this.taskToCreate = null;
    },
    createTask(startDay, startHour, endDay, endHour) {
      console.log("create")
      this.tasks.push({
        name: "added",
        startDay: startDay,
        startHour: startHour,
        endDay: endDay,
        endHour: endHour,
      })
    },
  },
}
</script>

<style>
#calendar {
  width: 100vw;
  max-width: 100vw;
  display: flex;
  flex-direction: column;
}

#calendar-header {
  display: flex;
  flex-direction: row;
  margin: 1em;
  gap: 1em;
  align-items: center;
}

#calendar-h1 {
  margin: 0;
}

#home {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background-color: #4a4a4a;
}

#home:hover {
  background-color: #323232;
}

#home.material-icons {
  color: white;
  font-size: 18pt;
  width: 2em;
  height: 2em;
}

#home.material-icons:hover {
  color: #e0e0e0;
}

#week-view {
  flex: 1;
  display: grid;
  /*column-gap: 0.5rem;*/
  grid-template-columns: min-content repeat(7, 5fr);
  grid-template-rows: min-content auto;
  margin: 0.5em;
  padding: 0;
  overflow-y: auto;

  grid-template-areas:
    ".   mon tue wed thu fri sat sun"
    "d01 d01 d02 d03 d04 d05 d06 d07";

  border-right: 1px #494949 solid;
  border-bottom: 1px #494949 solid;
}

.day-name {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 1em;
}

.day {
  display: flex;
  flex-direction: column;
  /*gap: 0.5rem;*/
  margin: 0;
  padding: 0;
  position: relative;
}

.cal-task {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  /*height: 10px;*/

  /* Minus 1px because of border */
  margin: 0 0.5em 0 0;

  background-color: rgba(0, 139, 139, 0.5);

  text-overflow: ellipsis;

  /* Required for text-overflow to do anything */
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

.time {
  font-size: 8pt;
  margin: 0 1em 0 0;
  position: relative;
  top: -0.5em;
}
</style>
