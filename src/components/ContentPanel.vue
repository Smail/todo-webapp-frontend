<template>
  <section v-if="activeTask != null">
    <h1 :data-theme="theme">{{ activeTask.name }}</h1>
    <textarea :value="activeTask.content"
              @input="activeTask.content = $event.target.value; $emit('update:activeTask', activeTask);">
      {{ activeTask.content }}
    </textarea>
  </section>
</template>

<script>
export default {
  name: "ContentPanel",
  props: {
    theme: String,
    activeTask: Object,
  },
  methods: {
    /**
     * Gets the task content from the server.
     */
    getTaskContent(taskId) {
      $.ajax({
        type: 'POST',
        url: 'http://api.todo.smail.de/ajax.php',
        data: {
          // TODO add bearer token, username or simply some form of user authentication
          'action': 'get_task',
          'taskId': taskId,
        },
        success: (response) => {
          const task = JSON.parse(response);
          console.log(task);
        },
        error: (response) => {
          console.log(response);
        }
      });
    },
  },
}
</script>

<style scoped>
section {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

h1 {
  padding: 1rem;
}

textarea {
  flex: 1;
  resize: none;
  outline: none;
  padding: 1rem;
  color: inherit;
  background-color: transparent;
  border: none;
}
</style>