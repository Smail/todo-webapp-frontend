<template>
  <section v-if="activeTask != null" id="content-section">
    <div id="header">
      <h1 :data-theme="theme">{{ activeTask.name }}</h1>
      <button id="markdown-btn" :data-theme="theme"
              @mousedown.prevent="setDisplayAsMarkdown(!this.displayAsMarkdown);"
      >Markdown
      </button>
    </div>
    <div v-show="displayAsMarkdown"
         id="markdown-container"
         :data-theme="theme"
         tabindex="-1"
         @focusin="setDisplayAsMarkdown(false);"
         v-html="markdown">
    </div>
    <textarea v-show="!displayAsMarkdown"
              id="content-textarea"
              :value="activeTask.content"
              class="content-area"
              tabindex="4"
              @focusout="updateServer(); setDisplayAsMarkdown(true)"
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
    setDisplayAsMarkdown(displayAsMarkdown) {
      this.displayAsMarkdown = displayAsMarkdown;

      if (!this.displayAsMarkdown) {
        setTimeout(() => $(document).ready(function () {
          // Doesn't work with jQuery for whatever reason
          document.getElementById("content-textarea").focus();
        }), 0);
      }
    },
    setContent(newContentStr) {
      this.activeTask.content = newContentStr;
      this.didContentChange = true;
    },
    updateServer() {
      if (this.didContentChange) {
        $.ajax({
          type: "PATCH",
          url: `http://192.168.2.165:8090/task/${this.activeTask.id}`,
          data: JSON.stringify({content: this.activeTask.content}),
          contentType: "application/json; charset=utf-8",
          headers: {
            "Authorization": localStorage.getItem("token"),
          },
          success: () => {
            this.didContentChange = false;
          },
          error: (response) => {
            const errorMsg = "Could not save task content: " + response.responseText;
            alert(errorMsg);
            console.error(errorMsg);
          }
        });
      }
    }
  },
}
</script>

<style lang="scss">
@import "@/assets/variables.scss";

#content-section {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
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
  margin: 0;
}

#markdown-container {
  margin: 0 1em;
  height: 100%;
  overflow-wrap: anywhere;
}

#markdown-container[data-theme="dark"] a {
  color: hotpink;
}

#markdown-container[data-theme="dark"] a:hover {
  color: deeppink;
}

#header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  margin: 0;
}

#header * {
  margin: 0;
  padding: 0;
}

#markdown-btn {
  color: inherit;
  font-size: 10pt;
  width: fit-content;
  height: fit-content;
  padding: .75em;
  background-color: hsla(hue($theme), saturation($theme), lightness($theme) + 10%, 1);
  border: none;
  border-radius: 3px;
}

#markdown-btn:active {
  background-color: hsla(hue($theme), saturation($theme), lightness($theme) + 25%, 1);
}
</style>