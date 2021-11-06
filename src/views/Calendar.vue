<template>
  <div id="calendar">
    <header id="calendar-header">
      <h1 id="calendar-h1">Calendar</h1>
      <nav>
        <router-link id="home" to="/"><span id="home" class="material-icons">home</span></router-link>
      </nav>
    </header>
    <div id="week-view">
      <h2></h2>
      <h2 v-for="dayName in weekDays"
          :style="'grid-area:' + dayName.toLowerCase().substr(0, 3) + ';'" class="day-name">
        {{ dayName.charAt(0).toUpperCase() + dayName.slice(1, 3) }}
      </h2>

      <!-- Time annotation -->
      <div class="time-container">
        <div v-for="hour in Array(24).fill(0).map((x, y) => x + y)"
             class="time" style="grid-area: time;">
          {{ hour > 9 ? hour : ("0" + hour) }}:00
        </div>
      </div>

      <!-- Content -->
      <div v-for="(day, index) in weekDays"
           id="week-container" :style="'grid-area:d0' + (index + 1) + ';'"
           class="day"
           @mousemove="resizeTask($event, this.shadowTask)">
        <TimeSlot v-for="hour in Array(24).fill(0).map((x, y) => x + y)"
                  :day="day" :hour="hour" :tasks="tasks"
                  @mousedown="initTaskCreation(day, hour)"
                  @mouseup="finishTaskCreation($event.target.getAttribute('data-day'),
                                        Number($event.target.getAttribute('data-hour')) + 1)">
        </TimeSlot>

        <!-- Tasks -->
        <calendar-task v-for="task in tasks.filter(t => t.startDay === day)"
                       :task="task"></calendar-task>

        <!-- Shadow task: The view to show while a user is creating a new task -->
        <calendar-task v-if="shadowTask != null && shadowTask.startDay === day" :task="shadowTask"
                       class="shadow-task" draggable="false"
                       @mouseup="finishTaskCreation">
        </calendar-task>
      </div>
    </div>
  </div>
</template>

<script>
import TimeSlot from "@/components/Calendar/TimeSlot";
import CalendarTask from "@/components/Calendar/CalendarTask";

const CalendarViewMode = {
  DAY: "day",
  WEEK: "week",
  MONTH: "month",
  YEAR: "year",
};

export default {
  name: "Calendar",
  components: {CalendarTask, TimeSlot},
  props: {
    theme: String,
  },
  data() {
    return {
      view: CalendarViewMode.WEEK,
      weekDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      shadowTask: null,
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
    initTaskCreation(day, hour) {
      // Display shadow task initially as an one hour long task
      this.shadowTask = this.createTask("New Task", day, hour, day, Math.min(hour + 1, 24));
    },
    finishTaskCreation(endDay, endHour) {
      if (this.shadowTask != null) {
        if (endDay != null) {
          this.shadowTask.endDay = endDay;
        }
        if (endHour != null) {
          this.shadowTask.endHour = Number(endHour);
        }
        this.tasks.push(this.shadowTask);
        this.shadowTask = null;
      }
    },
    resizeTask(event, task) {
      if (task != null) {
        // The number of regions in which the calendar is divided into,
        // e.g. a grid that is divided into 24 1-hour sections
        const numRegions = 24;
        const rect = document.getElementsByClassName("day")[0].getBoundingClientRect();
        const posY = event.clientY;
        const containerTopY = rect.y;
        const containerHeight = rect.height;
        const regionHeight = Math.round(containerHeight / numRegions);

        // Set the endHour of task to the region in which the mouse pointer is currently located
        // a is the lower bound of the region rectangle and b the upper one.
        // Example: let rect be of height 1056 and let numRegions be 24.
        //     (0) 00:00 - 01:00: [a=0px, b=44px],
        //     (1) 01:00 - 02:00: [a=44px, b=88px],
        //     ...,
        //     (24) 23:00 - 00:00: [a=1012px, b=1056]
        let a = 0;
        for (let i = 1; i < numRegions + 1; i++) {
          const b = i * regionHeight + containerTopY;
          if (posY > a && posY < b) {
            if (task.endHour !== i) {
              task.endHour = i;
            }
            break;
          }
          a = b;
        }
      }
    },
    createTask(name, startDay, startHour, endDay, endHour) {
      return {
        name: name,
        startDay: startDay,
        startHour: Math.max(startHour, 0),
        endDay: endDay,
        endHour: Math.min(endHour, 24),
      };
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
    ".    mon tue wed thu fri sat sun"
    "time d01 d02 d03 d04 d05 d06 d07";

  max-height: 50%;
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
  margin: 0;
  padding: 0;
  position: relative;
  border-bottom: 1px #494949 solid;
}

.day:last-child {
  border-right: 1px #494949 solid;
}

.time-container {
  top: -0.5em;
  position: relative;
  margin: 0 0.25em 0 0;
  font-size: 8pt;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.time {
  top: 0;
  position: relative;
  height: calc(100% / 24); /* 100 * (1 / 24) = 4.1666% */
  font-size: inherit;
}

.shadow-task {
  opacity: 50%;
}
</style>
