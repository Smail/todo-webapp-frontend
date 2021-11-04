<template>
  <div id="calendar">
    <header id="calendar-header">
      <h1 id="calendar-h1">Calendar</h1>
      <nav>
        <router-link id="home" to="/"><span id="home" class="material-icons">home</span></router-link>
      </nav>
    </header>
    <div id="week-view">
      <h2 v-for="dayName in ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']"
          class="day-name">
        {{ dayName.charAt(0).toUpperCase() + dayName.slice(1, 3) }}
      </h2>

      <div v-for="_ in Array(7).fill(1).map((x, y) => x + y)" class="day">
        <div v-for="index in Array(24).fill(0).map((x, y) => x + y)" class="hour">
          <p>{{ index > 9 ? index : ("0" + index) }}:00</p>
          Hello
        </div>
      </div>
    </div>
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
  overflow-y: auto;
}

#calendar-header {
  display: flex;
  flex-direction: row;
  margin: 1em;
  /*justify-content: space-between;*/
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
  column-gap: 0.5rem;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: min-content auto;
  margin: 0.5em;
  padding: 0;
}

/*#week-view-content {*/
/*  overflow-y: auto;*/
/*}*/

.day-name {
  /*position: sticky;*/
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 1em;
  /*background-color: red;*/
}

.day {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
}

.hour {
  padding: 0.5em;
  margin: 0;
  min-height: 1em;
  border: 1px rgb(100, 210, 255) solid;
  border-radius: 5px;
  background-color: rgba(100, 210, 255, 0.1);
}

.hours-divider {
  /*background-color: #4a4a4a;*/
  /*border: none;*/
  /*width: 100%;*/
  /*margin: 0;*/
}
</style>
