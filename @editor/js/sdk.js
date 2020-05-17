function lolitor() {
  this.initApp();
  this.initEditor();
}

lolitor.prototype = {
  initApp() {
    this.fetch("/", {
      responce(data) {
        console.log(data);
      },
      error(e) {
        console.log(e);
      }
    });
  },

  initEditor() {
    const editor = ace.edit("lol-editor");
    this.editor = editor;
    editor.setOptions({
      fontFamily: "Inconsolata",
      fontSize: "16px"
    });
    editor.session.setUseWorker(false);

    this.setTheme();
  },

  setTheme() {
    this.editor.setTheme("ace/theme/vs_code");
  },

  setCodeTheme() {
    this.editor.session.setMode("ace/mode/html");
  },

  fetch(url, options = {}) {
    fetch(url, {
      method: options.method || "post"
    })
      .then(function(resp) {
        return resp.json().then(function(json) {
          options.responce && options.responce(json);
        });
      })
      .catch(function(error) {
        console.log("Error in fetchData");
        options.error && options.error(error);
      });
  }
};

module.exports = function() {
  window.lolitor = lolitor;
};
