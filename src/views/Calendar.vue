<template>
  <div id="calendar">
    <header id="calendar-header">
      <h1 id="calendar-h1">Calendar</h1>
      <nav id="calendar-nav">
        <router-link id="home" to="/"><span id="home" class="material-icons">home</span></router-link>
      </nav>
      <button v-for="c in colors
      .map(hex => '0x' + hex.replace('#', '').replace('0x', ''))
      .sort((a, b) => Number(a.substr(0, 2)) - Number(b.substr(0, 2)))"
              :style="'background-color:' + c.replace('0x', '#') +';'" class="color-button"
              @click="setCalendarColor(c.replace('0x', '#'))">
      </button>
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

        <div class="color-wrapper">
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

function randColorArray(size) {
  const arr = [];
  for (let i = 0; i < size; i++) {
    arr.push(Math.floor(Math.random() * 256 * 256 * 256 + 1).toString(16).padStart(6, "0"));
  }
  return arr;
}

export default {
  components: {CalendarTask, TimeSlot},
  props: {
    theme: String,
  },
  data() {
    return {
      view: CalendarViewMode.WEEK,
      weekDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      colors: ["390099", "9e0059", "ff0054", "ff5400", "ffbd00", "70d6ff", "ff70a6", "ff9770", "ffd670", "e9ff70"],
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
    setCalendarColor(c) {
      // https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
      // Version 4.0
      const pSBC = (p, c0, c1, l) => {
        let r, g, b, P, f, t, h, i = parseInt, m = Math.round, a = typeof (c1) == "string";
        if (typeof (p) != "number" || p < -1 || p > 1 || typeof (c0) != "string" || (c0[0] != 'r' && c0[0] != '#') || (c1 && !a)) return null;
        if (!this.pSBCr) this.pSBCr = (d) => {
          let n = d.length, x = {};
          if (n > 9) {
            [r, g, b, a] = d = d.split(","), n = d.length;
            if (n < 3 || n > 4) return null;
            x.r = i(r[3] == "a" ? r.slice(5) : r.slice(4)), x.g = i(g), x.b = i(b), x.a = a ? parseFloat(a) : -1
          } else {
            if (n == 8 || n == 6 || n < 4) return null;
            if (n < 6) d = "#" + d[1] + d[1] + d[2] + d[2] + d[3] + d[3] + (n > 4 ? d[4] + d[4] : "");
            d = i(d.slice(1), 16);
            if (n == 9 || n == 5) x.r = d >> 24 & 255, x.g = d >> 16 & 255, x.b = d >> 8 & 255, x.a = m((d & 255) / 0.255) / 1000;
            else x.r = d >> 16, x.g = d >> 8 & 255, x.b = d & 255, x.a = -1
          }
          return x
        };
        h = c0.length > 9, h = a ? c1.length > 9 ? true : c1 == "c" ? !h : false : h, f = this.pSBCr(c0), P = p < 0, t = c1 && c1 != "c" ? this.pSBCr(c1) : P ? {
          r: 0,
          g: 0,
          b: 0,
          a: -1
        } : {r: 255, g: 255, b: 255, a: -1}, p = P ? p * -1 : p, P = 1 - p;
        if (!f || !t) return null;
        if (l) r = m(P * f.r + p * t.r), g = m(P * f.g + p * t.g), b = m(P * f.b + p * t.b);
        else r = m((P * f.r ** 2 + p * t.r ** 2) ** 0.5), g = m((P * f.g ** 2 + p * t.g ** 2) ** 0.5), b = m((P * f.b ** 2 + p * t.b ** 2) ** 0.5);
        a = f.a, t = t.a, f = a >= 0 || t >= 0, a = f ? a < 0 ? t : t < 0 ? a : a * P + t * p : 0;
        if (h) return "rgb" + (f ? "a(" : "(") + r + "," + g + "," + b + (f ? "," + m(a * 1000) / 1000 : "") + ")";
        else return "#" + (4294967296 + r * 16777216 + g * 65536 + b * 256 + (f ? m(a * 255) : 0)).toString(16).slice(1, f ? undefined : -2)
      }

      const color = c.substring(0, 7) + "80";
      const borderColor = pSBC(0.05, c);
      $(".color-wrapper").css("background-color", color);
      $(".color-wrapper").css("border-color", borderColor);

    },
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

<style lang="scss">
@import "@/assets/variables.scss";

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
  background-color: hsla(hue($theme), saturation($theme), lightness($theme) + 19%, 1);
}

#home:hover {
  background-color: hsla(hue($theme), saturation($theme), lightness($theme) + 10%, 1);
}

#home.material-icons {
  color: white;
  font-size: 18pt;
  width: 2em;
  height: 2em;
}

#home.material-icons:hover {
  color: hsla(hue($theme), saturation($theme), lightness($theme) + 78%, 1);
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
  border-bottom: 1px hsla(hue($theme), saturation($theme), lightness($theme) + 19%, 1) solid;
}

.day:last-child {
  border-right: 1px hsla(hue($theme), saturation($theme), lightness($theme) + 19%, 1) solid;
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
  animation: first-touch 500ms;
}

@keyframes first-touch {
  0% {
    filter: grayscale(1);
  }
  100% {
    filter: grayscale(0);
  }
}

.color-button {
  padding: 1em;
  border-radius: 50%;
  border: none;
}

.color-wrapper {
  background-color: rgba(0, 139, 139, 0.5);
  border-color: #008B8BFF;
}
</style>
