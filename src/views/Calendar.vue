<template>
  <div id="calendar">
    <header id="calendar-header">
      <h1 id="calendar-h1">Calendar</h1>
      <nav>
        <router-link id="home" to="/"><span id="home" class="material-icons">home</span></router-link>
      </nav>
    </header>
    <div id="week-view"
         @mouseup="finishTaskCreation($event.target.getAttribute('data-day'),
            Number($event.target.getAttribute('data-hour')) + 1)">
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
           :style="'grid-area:d0' + (index + 1) + ';'" class="day">
        <TimeSlot v-for="hour in Array(24).fill(0).map((x, y) => x + y)"
                  :day="day" :hour="hour" :tasks="tasks"
                  @mousedown="initTaskCreation(day, hour)">
        </TimeSlot>

        <!-- Tasks -->
        <calendar-task v-for="task in tasks.filter(t => t.startDay === day)"
                       :task="task"></calendar-task>

        <!-- Shadow task: The view to show while a user is creating a new task -->
        <calendar-task v-if="shadowTask != null && shadowTask.startDay === day" :task="shadowTask"
                       class="shadow-task" draggable="false">
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
        this.shadowTask.endDay = endDay;
        this.shadowTask.endHour = Number(endHour);
        this.tasks.push(this.shadowTask);
        this.shadowTask = null;
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

  /*border-right: 1px #494949 solid;*/
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
  margin: 0;
  padding: 0;
  position: relative;
}

.time-container {
  top: -0.5em;
  position: relative;
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
