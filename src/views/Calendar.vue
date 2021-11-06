<template>
  <div id="calendar">
    <header id="calendar-header">
      <h1 id="calendar-h1">Calendar</h1>
      <nav>
        <router-link id="home" to="/"><span id="home" class="material-icons">home</span></router-link>
      </nav>
    </header>
    <div id="week-view" @mouseup="finishTaskCreation($event.target)">
      <h2></h2>
      <h2 v-for="dayName in ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']"
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
      <div v-for="(day, index) in ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']"
           :style="'grid-area:d0' + (index + 1) + ';'" class="day">
        <TimeSlot v-for="hour in Array(24).fill(0).map((x, y) => x + y)"
                  :day="day" :hour="hour" :tasks="tasks"
                  @mousedown="initTaskCreation(day, hour)">
        </TimeSlot>

        <!-- Tasks -->
        <CalendarTasks :day="day" :tasks="tasks"></CalendarTasks>
      </div>
    </div>
  </div>
</template>

<script>
import TimeSlot from "@/components/Calendar/TimeSlot";
import CalendarTasks from "@/components/Calendar/CalendarTasks";

const CalendarViewMode = {
  DAY: "day",
  WEEK: "week",
  MONTH: "month",
  YEAR: "year",
};

export default {
  name: "Calendar",
  components: {CalendarTasks, TimeSlot},
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
    initTaskCreation(day, hour) {
      this.taskToCreate = {
        startDay: day,
        startHour: hour,
      };
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
      const t = this.taskToCreate;
      this.createTask("New Task", t.startDay, t.startHour, endTime.day, endTime.hour);
      this.taskToCreate = null;
    },
    createTask(name, startDay, startHour, endDay, endHour) {
      this.tasks.push({
        name: name,
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
</style>
