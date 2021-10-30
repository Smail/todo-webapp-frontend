<template>
  <section v-if="activeTask != null">
    <h1 :data-theme="theme">{{ activeTask.name }}</h1>
    <textarea :value="activeTask.content"
              @input="updateContent($event.target.value)">
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
    updateContent(newContentStr) {
      $.ajax({
        type: 'POST',
        url: 'http://192.168.2.165:8082/ajax.php',
        data: {
          'action': 'update_task',
          'taskId': this.activeTask.id,
          'taskContent': newContentStr,
        },
        headers: {
          'Authorization': localStorage.getItem('token'),
        },
        success: () => {
          this.activeTask.content = newContentStr;
          this.$emit('update:activeTask', this.activeTask);
        },
        error: (response) => {
          alert("Error while saving :/ We could not save your task's content")
          console.log(response);
        }
      });
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
}
</style>