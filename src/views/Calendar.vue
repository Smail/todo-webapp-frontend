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

      <!-- Monday -->
      <div class="day" style="grid-area: d01;">
        <div v-for="hour in Array(24).fill(0).map((x, y) => x + y)"
             style="grid-area: d01;">
          <div style="display:flex;flex-direction: row;align-items: flex-start;">
            <p class="time">
              {{ hour > 9 ? hour : ("0" + hour) }}:00
            </p>
            <TimeSlot :hour="hour" :tasks="tasks"
                      class="cell" day="mon" style="flex: 1;"
                      @mousedown="initTaskCreation">
              <!-- Injection point -->
            </TimeSlot>
          </div>
        </div>
      </div>

      <!-- Rest of the week -->
      <div v-for="day in ['tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']" class="day">
        <TimeSlot v-for="hour in Array(24).fill(0).map((x, y) => x + y)"
                  :day="day" :hour="hour" :tasks="tasks"
                  @mousedown="initTaskCreation($event.target)">
          <!-- Injection point -->
        </TimeSlot>

        <div v-for="task in tasks.filter(t => t.startDay === day)"
             :style="'top:' + (task.startHour * cellHeight) + 'px;height:' + Math.floor(100/24 * (task.endHour - task.startHour)) + '%;'"
             class="cal-task">
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
      timeSlotStart: null,
      tasks: [{
        id: "timeSlot-tue-3",
        name: "test",
        startDay: "tuesday",
        startHour: 3,
        endHour: 5,
      }],
      cellHeight: 0,
    }
  },
  mounted() {
    // const element = document.getElementById('image_1');
    // const style = window.getComputedStyle(element);
    // const top = style.getPropertyValue('top');

    const getHeight = function () {
      const element = document.getElementsByClassName("cell").item(0);

      if (element == null) {
        console.error("no element with class cell")
        return 0;
      }

      const style = window.getComputedStyle(element);
      const heightStr = style.getPropertyValue("height");
      const borderTopWidthStr = style.getPropertyValue("border-top-width");
      const borderBottomWidthStr = style.getPropertyValue("border-bottom-width");
      const marginTopWidthStr = style.getPropertyValue("margin-top-width");
      const marginBottomWidthStr = style.getPropertyValue("margin-bottom-width");

      if (heightStr != null && borderTopWidthStr != null && borderBottomWidthStr != null
          && marginTopWidthStr != null && marginBottomWidthStr != null) {
        function convert(str) {
          return Number(str.replace("px", ""));
        }

        return convert(heightStr) + convert(borderTopWidthStr) + convert(borderBottomWidthStr)
            + convert(marginTopWidthStr) + convert(marginBottomWidthStr);
      }
      return 0;
    }
    this.cellHeight = getHeight();

    // $(".cell").ready(function () {
    //   console.log($(".cell").css("height"));
    //
    //   const heightStr = $(".cell").css("height");
    //   if (heightStr != null) {
    //     return Number(heightStr.replace("px", ""));
    //   }
    //   return -1;
    // })
  },
  methods: {
    existsTask(day, hour) {
      const v = this.tasks.find(task => task.id === this.getTimeSlotId(day, hour));
      console.log(v)
      return v !== undefined;
    },
    test(cell) {
      console.log("lök")
      console.log(cell)
    },
    initTaskCreation(timeSlotStart) {
      this.timeSlotStart = timeSlotStart;
      console.log(this.tasks.find(task => task.id === this.getTimeSlotId('tuesday', 3)));
    },
    finishTaskCreation(timeSlotEnd) {
      console.log($(timeSlotEnd))
      this.timeSlotStart = null;
    },
    createTask(timeSlotStart, timeSlotEnd) {

    },
    getTimeSlotId(day, hour) {
      return 'timeSlot-' + day.toLowerCase().substr(0, 3) + '-' + hour;
    }
  },
  // created() {
  //   const heightStr = $(".cell").css("height");
  //   if (heightStr != null) {
  //     this.cellHeight = Number(heightStr.replace("px", ""));
  //   }
  // },
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
