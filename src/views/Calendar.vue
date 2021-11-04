<template>
  <div id="calendar">
    <h1 id="calendar-h1">Calendar</h1>
    <ol class="week-view">
      <li class="day-name">Mon</li>
      <li class="day-name">Tue</li>
      <li class="day-name">Wed</li>
      <li class="day-name">Thu</li>
      <li class="day-name">Fri</li>
      <li class="day-name">Sat</li>
      <li class="day-name">Sun</li>
    </ol>
  </div>
</template>

<script>
const CalendarViewMode = {
  DAY: "day",
  WEEK: "week",
  MONTH: "month",
  YEAR: "year",
};

export default {
  name: "Calendar",
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
  height: 100vh;
}

#calendar-h1 {
  margin: 1em;
}

.week-view {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 1em;
}

.week-view * {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
