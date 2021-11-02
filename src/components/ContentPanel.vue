<template>
  <section v-if="activeTask != null" id="content-section">
    <div id="header">
      <h1 :data-theme="theme">{{ activeTask.name }}</h1>
      <button id="markdown-btn" :data-theme="theme"
              @click="setMarkdown(!this.displayAsMarkdown)"
      >Markdown
      </button>
    </div>
    <div v-if="displayAsMarkdown" id="markdown-container"
         v-html="markdown">
    </div>
    <!--    <div v-else contenteditable="true" class="content-area"-->
    <!--         @focusout="updateServer"-->
    <!--         @input="setContent($event.target.value)">-->
    <!--      {{activeTask.content}}-->
    <!--    </div>-->
    <textarea v-else id="content-textarea"
              :value="activeTask.content"
              class="content-area"
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
      displayAsMarkdown: true,
    }
  },
  computed: {
    markdown: function () {
      return window.markdownit(
          {
            "breaks": true,
          })
          .use(window.markdownitEmoji)
          .render(this.activeTask.content);
    }
  },
  methods: {
    setMarkdown(displayAsMarkdown) {
      this.displayAsMarkdown = displayAsMarkdown;
    },
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

<style>
#content-section {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

#content-textarea {
  flex: 1;
  resize: none;
  outline: none;
  padding: 1rem;
  color: inherit;
  background-color: transparent;
  border: none;
  font-size: 11pt;
}

#markdown-container * {
  margin: 1em;
}

#header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}

#markdown-btn {
  color: inherit;
  font-size: 10pt;
  width: fit-content;
  height: fit-content;
  padding: .75em;
  background-color: #323232;
  border: none;
  border-radius: 2.5px;
}

#markdown-btn:active {
  background-color: #5a5a5a;
}
</style>