<template>
  <section v-if="activeTask != null">
    <h1 :data-theme="theme">{{ activeTask.name }}</h1>
    <textarea :value="activeTask.content"
              @focusout="updateServer"
              @input="setContent($event.target.value)">
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
  data: function () {
    return {
      // Will be read by updateServer() function to determine if it should update the server
      didContentChange: false,
    }
  },
  methods: {
    setContent(newContentStr) {
      this.activeTask.content = newContentStr;
      this.$emit('update:activeTask', this.activeTask);
      this.didContentChange = true;
    },
    updateServer() {
      if (this.didContentChange) {
        $.ajax({
          type: 'POST',
          url: 'http://192.168.2.165:8082/ajax.php',
          data: {
            'action': 'update_task',
            'taskId': this.activeTask.id,
            'taskContent': this.activeTask.content,
          },
          headers: {
            'Authorization': localStorage.getItem('token'),
          },
          success: () => {
            this.didContentChange = false;
          },
          error: (response) => {
            alert("Error while saving :/ We could not save your task's content")
            console.error(response);
          }
        });
      }
    }
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
  font-size: 11pt;
}
</style>