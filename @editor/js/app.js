const editor = ace.edit('lol-editor')
editor.setOptions({
    fontFamily: "Inconsolata",
    fontSize: "16px"
});

editor.setTheme('ace/theme/vs_code')
editor.session.setMode("ace/mode/html")

// to disable syntax check
editor.session.setUseWorker(false)
// editor.setValue(html, -1)