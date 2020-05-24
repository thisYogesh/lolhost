module.exports = function(rootTitle){
return `
    <!DOCTYPE html>
    <html>
       <head>
          <title>&#10084; Lolhost editor</title>
          <script src="@app/lolitor/build/src/ace.js"></script>
          <link href="@app/css/font.lolitor.css" rel="stylesheet">
          <link href="@app/lolitor/main.css" rel="stylesheet">
       </head>
       <body>
          <main id="lolitore" class="main-wrapper">
             <header class="app-header">
                index.html <a class="emb-spiral">~</a><a class="emb-heart">&#10084;</a
                   ><a class="emb-spiral --twist">~</a> Lolhost
             </header>
             <section class="app-middle">
                <aside class="app-file-explorer app-piller">
                   <div class="app-file-ex-title app-piller-top file-ex-side-pad">
                      File Explorer
                   </div>
                   <ul class="app-list-wrapper --root-wrapper">
                      <li class="app-list-item">
                         <a class="app-list-name file-ex-side-pad --root">
                         ${rootTitle}
                         </a>
                      </li>
                   </ul>
                </aside>
                <section class="app-file-viewer app-piller">
                   <div class="app-tab-wrapper app-piller-top"></div>
                   <div id="lol-editor"></div>
                </section>
             </section>
             <footer class="app-footer"></footer>
          </main>
          <script src="@app/lolitor/main.bundle.js"></script>
       </body>
    </html>
    `
}