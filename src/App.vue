<template>
  <router-view/>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  font-family: Roboto, sans-serif;
}

ul {
  list-style-position: inside;
}

/* width */
::-webkit-scrollbar {
  width: 5px;
}

/* Track */
::-webkit-scrollbar-track {
  background: transparent;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 5px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.divisor {
  width: 90%;
  height: 1px;
  border: 0;
  align-self: center;
  margin: 0.5em;
}

.divisor[data-theme="light"] {
  background-color: black;
}

.divisor[data-theme="dark"] {
  background-color: #323232;
}

body[data-theme="light"] {
  color: black;
  background: white;
}

body[data-theme="dark"] {
  color: white;
  background: #1a1a1a;
}
</style>
