module.exports = function(rootTitle){
return `
    <!DOCTYPE html>
    <html>
       <head>
          <!--&#10084;-->
          <title>lolitor</title>
          <link href="/@app/images/lol.png" rel="icon">
          <script src="/@app/lolitor/build/src/ace.js"></script>
          <link href="/@app/css/font.lolitor.css" rel="stylesheet">
          <link href="/@app/lolitor/main.css" rel="stylesheet">
       </head>
       <body>
          <main id="lolitore" class="main-wrapper">
             <header class="app-header">
                <div class="app-error-msg">
                  <span class="error-copy"></span>
                </div>
                <div class="app-header-bar">
                  <span class="app-header-filename"></span> 
                  <span class="app-header-emb">
                    <a class="emb-spiral">~</a><a class="emb-heart">&#10084;</a><a class="emb-spiral --twist">~</a>
                  </span>
                  <span class="app-header-appname">lolitor</span>
                </div>
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
          <section class="app-popup --hide">
            <div class="app-popup-box">
              <div class="app-popup-box-head">
                <a tabindex="0" class="app-popup-box-close">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.428 8L12 10.573 10.572 12 8 9.428 5.428 12 4 10.573 6.572 8 4 5.428 5.427 4 8 6.572 10.573 4 12 5.428 9.428 8z"></path>
                  </svg>
                </a>
              </div>
              <div class="app-popup-box-content">Do you want to save the changes?</div>
              <div class="app-popup-box-foot">
                <button class="--dont-btn">Don't Save</button><button class="--save-btn">Save</button>
              </div>
            </div>
          </section>
          <script src="/@app/lolitor/main.bundle.js"></script>
       </body>
    </html>
    `
}