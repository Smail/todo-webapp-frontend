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
      <h2 v-for="dayName in ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']"
          :style="'grid-area:' + dayName.toLowerCase().substr(0, 3) + ';'" class="day-name">
        {{ dayName.charAt(0).toUpperCase() + dayName.slice(1, 3) }}
      </h2>

      <!-- Time table -->

      <div id="time-container" style="grid-area: d01;">
        <div v-for="hour in Array(24).fill(0).map((x, y) => x + y)"
             style="grid-area: d01;">
          <div style="display:flex;flex-direction: row;align-items: flex-start;">
            <p class="time">
              {{ hour > 9 ? hour : ("0" + hour) }}:00
            </p>
            <TimeSlot :hour="hour" class="cell" day="mon" style="flex: 1;">
              <!-- Injection point -->
            </TimeSlot>
          </div>
        </div>
      </div>

      <div v-for="day in ['tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']" class="day">
        <TimeSlot v-for="hour in Array(24).fill(0).map((x, y) => x + y)"
                  :day="day" :hour="hour">
          <!-- Injection point -->
        </TimeSlot>
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
    }
  }
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
}

#time-container {
  display: flex;
  flex-direction: column;
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
