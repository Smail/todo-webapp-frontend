<template>
  <div id="fitness">
    <header id="fitness-header">
      <h1 id="fitness-h1">Fitness Tracker</h1>
    </header>
    <div id="progress-graph">
      <canvas id="myChart"></canvas>
    </div>
  </div>
</template>

<script>
export default {
  name: "Fitness",
  mounted() {
    // https://observablehq.com/@mourner/one-rep-max-formulas-showdown
    // Most accurate in 2 - 5 rep range
    function brzycki(weight, reps) {
      return weight * (36 / (37 - reps));
    }

    // Most accurate in 6 - 10 rep range
    function oConnor(weight, reps) {
      return weight * (1 + reps / 40);
    }

    // Most accurate with 11+ reps
    function lombardi(weight, reps) {
      return weight * Math.pow(reps, 0.1);
    }

    function oneRepMax(weight, reps) {
      let f;

      return brzycki(weight, reps);

      if (reps === 1) {
        return weight;
      } else if (reps >= 2 && reps <= 5) {
        f = brzycki;
      } else if (reps >= 6 && reps <= 10) {
        f = oConnor;
      } else if (reps >= 11) {
        f = lombardi;
      } else {
        throw Error("Invalid value. Reps argument is probably <= 0");
      }

      return f(weight, reps);
    }

    let data = [
      // 27.08.21
      (47 * 12 + 47 * 8 + 47 * 5 + 40 * 9) / 4,
      // 05.09.21
      (47 * 12 + 47 * 8 + 40 * 8) / 3,
      // 11.09.21
      (47 * 12 + 47 * 10 + 40 * 10) / 3,
      // 25.10.21
      (67 * 4 + 40 * 12 + 40 * 9) / 3,
      // 01.11.21
      (67 * 6 + 47 * 12 + 47 * 8 + 40 * 2) / 4,
      // 05.11.21
      (67 * 4 + 47 * 12 + 47 * 7 + 40 * 10) / 4,
      // 15.11.21
      (67 * 4 + 47 * 12 + 47 * 8) / 3,
      // 20.11.21
      (67 * 5 + 57 * 9 + 47 * 11) / 3,
    ];

    /* For a given date, get the ISO week number
     *
     * Based on information at:
     *
     *    http://www.merlyn.demon.co.uk/weekcalc.htm#WNR
     *
     * Algorithm is to find nearest thursday, it's year
     * is the year of the week number. Then get weeks
     * between that date and the first day of that year.
     *
     * Note that dates in one year can be weeks of previous
     * or next year, overlap is up to 3 days.
     *
     * e.g. 2014/12/29 is Monday in week  1 of 2015
     *      2012/1/1   is Sunday in week 52 of 2011
     */
    function getWeekNumber(d) {
      // Copy date so don't modify original
      d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      // Set to nearest Thursday: current date + 4 - current day number
      // Make Sunday's day number 7
      d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
      // Get first day of year
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      // Calculate full weeks to nearest Thursday
      return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }

    let dataset1 = {};
    let dataset2 = {};

    for (let i = 1; i <= 52; i++) {
      dataset1[i]= null;
      dataset2[i] = null;
    }

    dataset1[getWeekNumber(new Date(2021, 5, 18))] = oneRepMax(42.5, 6);
    dataset1[getWeekNumber(new Date(2021, 5, 27))] = oneRepMax(42.5, 7);
    dataset1[getWeekNumber(new Date(2021, 7, 27))] = oneRepMax(47, 5);
    dataset1[getWeekNumber(new Date(2021, 8, 5))] = oneRepMax(40, 8);
    dataset1[getWeekNumber(new Date(2021, 8, 11))] = oneRepMax(40, 10);
    dataset1[getWeekNumber(new Date(2021, 9, 25))] = oneRepMax(40, 9);
    dataset1[getWeekNumber(new Date(2021, 10, 1))] = oneRepMax(47, 8);
    dataset1[getWeekNumber(new Date(2021, 10, 5))] = oneRepMax(47, 7);
    dataset1[getWeekNumber(new Date(2021, 10, 15))] = oneRepMax(47, 8);
    dataset1[getWeekNumber(new Date(2021, 10, 20))] = oneRepMax(47, 11);

    dataset2[getWeekNumber(new Date(2021, 6, 14))] = oneRepMax(20, 12);
    dataset2[getWeekNumber(new Date(2021, 8, 8))] = oneRepMax(18, 12);
    dataset2[getWeekNumber(new Date(2021, 10, 9))] = oneRepMax(22, 10);

    const ctx = document.getElementById("myChart").getContext("2d");
    const myChart = new Chart(ctx, {
      type: "line",
      data: {
        // labels: Array.from({length: 52}, (_, i) => i + 1),
        datasets: [
          {
            label: "Lat Pulldown: (Estimate) of 1RM (One-repetition maximum)",
            data: dataset1,
            fill: true,
            backgroundColor: "rgba(0,255,255,0)",
            borderColor: "rgba(0,255,255, 1)",
            pointRadius: 4,
            pointHitRadius: 10,
            pointBackgroundColor: "rgb(0,255,255)",
            pointBorderWidth: 1,
            borderWidth: 1,
            spanGaps: true
          },
          {
            label: "Incline Bench Press: (Estimate) of 1RM (One-repetition maximum)",
            data: dataset2,
            fill: true,
            backgroundColor: "rgba(255,0,0,0)",
            borderColor: "rgb(255,0,0)",
            pointRadius: 4,
            pointHitRadius: 10,
            pointBackgroundColor: "rgb(255,0,0)",
            pointBorderWidth: 1,
            borderWidth: 1,
            spanGaps: true
          }
        ]
      },
      options: {
        scales: {
          x: {
            // ticks: {
            //   // Include a dollar sign in the ticks
            //   callback: function (value, index, values) {
            //     values = values.sort((a, b) => Number(b.label) - Number(a.label));
            //     console.log(values)
            //     return this.getLabelForValue(values[index].value);
            //   }
            // },
            title: {
              display: true,
              text: 'Week Number'
            },
            stacked: true,
          },
          y: {
            stacked: true,
          }
        },
        responsive: true,
        maintainAspectRatio: false,
      }
    });
  }
}
</script>

<style>
#fitness {
  width: 100vw;
  max-width: 100vw;
  display: flex;
  flex-direction: column;
}

#fitness-header {
  display: flex;
  flex-direction: row;
  margin: 1em;
  gap: 1em;
  align-items: center;
}

#fitness-h1 {
  margin: 0;
}

#progress-graph {
  /*background-color: transparent;*/
  border-radius: 5px;
  height: 50%;
  margin: 2em;
}
</style>