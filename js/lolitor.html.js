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
                        <div class="app-item-create-wrap">
                          <button class="app-item-create --create-file">
                            <svg viewBox="0 0 32 32"><path fill="currentColor" class="cls-1" d="M26.74,8.5a.65.65,0,0,0,0-.19.64.64,0,0,0,0-.07A.86.86,0,0,0,26.53,8L20.86,2.46a.83.83,0,0,0-.22-.14l-.07,0a.58.58,0,0,0-.18,0H6A.76.76,0,0,0,5.25,3V29a.76.76,0,0,0,.75.75H26a.76.76,0,0,0,.75-.75V8.55S26.74,8.52,26.74,8.5ZM21,17.75H16.75V22a.75.75,0,0,1-1.5,0V17.75H11a.75.75,0,0,1,0-1.5h4.25V12a.75.75,0,0,1,1.5,0v4.25H21a.75.75,0,0,1,0,1.5ZM25.25,9.3H20.34a.75.75,0,0,1-.75-.75V3.75H20l1.06,1,3.07,3,1.09,1.06Z"/></svg>
                          </button>
                          <button class="app-item-create --create-dir">
                            <svg viewBox="0 0 32 32"><path fill="currentColor" class="cls-1" d="M27,9.25H14.38L11.6,5.55a.74.74,0,0,0-.6-.3H4A1.76,1.76,0,0,0,2.25,7V24A2.75,2.75,0,0,0,5,26.75H27A2.75,2.75,0,0,0,29.75,24V12A2.75,2.75,0,0,0,27,9.25ZM3.75,7A.25.25,0,0,1,4,6.75h6.63l1.87,2.5H3.75ZM20,18.75H16.75V22a.75.75,0,0,1-1.5,0V18.75H12a.75.75,0,0,1,0-1.5h3.25V14a.75.75,0,0,1,1.5,0v3.25H20a.75.75,0,0,1,0,1.5Z"/></svg>
                          </button>
                        </div>
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
          <div class="app-context-menu --hide">
            <ul class="context-menu">
              <li class="context-menu-item">
                <svg viewBox="0 0 32 32"><path fill="currentColor" class="cls-1" d="M26.74,8.5a.65.65,0,0,0,0-.19.64.64,0,0,0,0-.07A.86.86,0,0,0,26.53,8L20.86,2.46a.83.83,0,0,0-.22-.14l-.07,0a.58.58,0,0,0-.18,0H6A.76.76,0,0,0,5.25,3V29a.76.76,0,0,0,.75.75H26a.76.76,0,0,0,.75-.75V8.55S26.74,8.52,26.74,8.5ZM21,17.75H16.75V22a.75.75,0,0,1-1.5,0V17.75H11a.75.75,0,0,1,0-1.5h4.25V12a.75.75,0,0,1,1.5,0v4.25H21a.75.75,0,0,1,0,1.5ZM25.25,9.3H20.34a.75.75,0,0,1-.75-.75V3.75H20l1.06,1,3.07,3,1.09,1.06Z"/></svg>
                New File
              </li>
              <li class="context-menu-item">
                <svg viewBox="0 0 32 32"><path fill="currentColor" class="cls-1" d="M27,9.25H14.38L11.6,5.55a.74.74,0,0,0-.6-.3H4A1.76,1.76,0,0,0,2.25,7V24A2.75,2.75,0,0,0,5,26.75H27A2.75,2.75,0,0,0,29.75,24V12A2.75,2.75,0,0,0,27,9.25ZM3.75,7A.25.25,0,0,1,4,6.75h6.63l1.87,2.5H3.75ZM20,18.75H16.75V22a.75.75,0,0,1-1.5,0V18.75H12a.75.75,0,0,1,0-1.5h3.25V14a.75.75,0,0,1,1.5,0v3.25H20a.75.75,0,0,1,0,1.5Z"/></svg>
                New Folder
              </li>
              <li class="context-menu-item">
                <svg version="1.1" viewbox="0 0 8.4666665 5.9" x="0px" xmlns:cc="http://creativecommons.org/ns#" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" y="0px">
                  <g transform="translate(0,-289.8)">
                    <path fill="currentColor" d="m 4.7624996,289.85624 v 0.52917 H 5.027083 c 0.2977356,0 0.5291666,0.23143 0.5291666,0.52916 v 3.70417 c 0,0.29774 -0.231431,0.52917 -0.5291666,0.52917 H 4.7624996 v 0.52916 H 5.027083 c 0.3169946,0 0.5992944,-0.14449 0.79375,-0.36741 0.1944555,0.22292 0.4767553,0.36741 0.79375,0.36741 h 0.2645833 v -0.52916 H 6.614583 c -0.2977357,0 -0.5291667,-0.23143 -0.5291667,-0.52917 v -0.26458 h 1.8520833 v -3.175 H 6.0854163 v -0.26459 c 0,-0.29773 0.231431,-0.52916 0.5291667,-0.52916 h 0.2645833 v -0.52917 H 6.614583 c -0.3169947,0 -0.5992945,0.14449 -0.79375,0.36742 -0.1944556,-0.22293 -0.4767554,-0.36742 -0.79375,-0.36742 z m -4.23333341,1.32292 v 3.175 H 5.027083 v -0.52917 H 1.0583329 v -2.11667 h 4.001823 v -0.52916 z m 5.55625011,0.52916 H 7.408333 v 2.11667 H 6.0854163 Z" />
                  </g>
                </svg> Rename
              </li>
            </ul>
          </div>
          <script src="/@app/lolitor/main.bundle.js"></script>
       </body>
    </html>
    `
}