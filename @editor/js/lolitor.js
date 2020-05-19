function lolitor() {
  this.initApp();
  this.initEditor();
}

/**
 * Application
 */
Object.assign(lolitor.prototype, {
  initApp() {
    this.setRootListDOM();
    this.fetchRoot()
  },

  fetchRoot(){
    this.getData('/', (err, resp)=>{
      if(!err){
        const rootItem = this.listRoot.querySelector('.app-list-item')
        this.prepareList(resp.data, rootItem)
        this.addRootScrollEvent();
      }
    })
  },

  fetchItem(el){
    const listName = el.querySelector('.app-list-name');
    const href = listName && listName.dataset.href
    
    href && this.getData(href, (err, resp) => {
      if(!err){
        this.prepareList(resp.data, el)
      }
    })
  }
});

/**
 * Dataset
 */
Object.assign(lolitor.prototype, {
  getData(url, cb){
    this.fetch(url, {
      responce(data) {
        cb(null, data)
      },
      error(e) {
        cb(e, null)
      }
    });
  }
})

/**
 * Editor
 */
Object.assign(lolitor.prototype, {
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
})

/**
 * Util
 */
Object.assign(lolitor.prototype, {
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
});

/**
 * Helpers
 */
Object.assign(lolitor.prototype, {
  getItemExt(title) {
    const ext = title.match(/\w+$/);
    return (ext && ext[0]) || "default";
  },

  getExtentionType(item) {
    const type = item.isDirectory ? "folder" : this.getItemExt(item.href);
    return type;
  }
});

/**
 * DOM Manipulation
 */
Object.assign(lolitor.prototype, {
  setRootListDOM(){
    this.listRoot = document.querySelector(".app-list-wrapper.--root-wrapper");
  },
  createList(items) {
    const listItems = [];
    items.forEach(item => {
      listItems.push(this.createListItem(item));
    });

    const html = `<ul class="app-list-wrapper">${listItems.join("")}</ul>`;
    return html;
  },
  createListItem(item) {
    const itemTypeClass = this.getItemTypeClass(item);
    const itemHiddenClass = this.getItemHiddenClass(item);
    const title = item.title;
    const href = item.href;
    const iconHtml = this.getIconHtml(item);
    const html = `
        <li class="app-list-item">
          <a tabindex="0" data-href="${href}" class="app-list-name file-ex-side-pad ${itemTypeClass} ${itemHiddenClass}">
            <span class="app-list-highlight"></span> 
            <div class="app-list-name-content">
              ${iconHtml}
              <span class="app-list-name-title">${title}</span>
            </div>
          </a>
        </li>`;

    return html.trim();
  },
  getItemTypeClass(item) {
    return item.isDirectory ? "--is-folder" : "--is-file";
  },
  getItemHiddenClass(item) {
    return item.isHidden ? "--hidden" : "";
  },
  getIconHtml(item) {
    const type = this.getExtentionType(item);
    let svg = "";

    switch (type) {
      case "html":
        svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="app-svg --common --svg-html"><path fill="currentColor" d="M8 15l6-5.6V12l-4.5 4 4.5 4v2.6L8 17v-2zm16 2.1l-6 5.6V20l4.6-4-4.6-4V9.3l6 5.6v2.2z"></path></svg>`;
        break;

      case "css":
        svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="app-svg --common --svg-css"><path fill="currentColor" d="M10.3 23.3l.8-4H8.6v-2.1h3l.5-2.5H9.5v-2.1h3.1l.8-3.9h2.8l-.8 3.9h2.8l.8-3.9h2.8l-.8 3.9h2.5v2.1h-2.9l-.6 2.5h2.6v2.1h-3l-.8 4H16l.8-4H14l-.8 4h-2.9zm6.9-6.1l.5-2.5h-2.8l-.5 2.5h2.8z"></path></svg>`;
        break;

      case "js":
        svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="app-svg --common --svg-js"><path fill="currentColor" d="M11.4 10h2.7v7.6c0 3.4-1.6 4.6-4.3 4.6-.6 0-1.5-.1-2-.3l.3-2.2c.4.2.9.3 1.4.3 1.1 0 1.9-.5 1.9-2.4V10zm5.1 9.2c.7.4 1.9.8 3 .8 1.3 0 1.9-.5 1.9-1.3s-.6-1.2-2-1.7c-2-.7-3.3-1.8-3.3-3.6 0-2.1 1.7-3.6 4.6-3.6 1.4 0 2.4.3 3.1.6l-.6 2.2c-.5-.2-1.3-.6-2.5-.6s-1.8.5-1.8 1.2c0 .8.7 1.1 2.2 1.7 2.1.8 3.1 1.9 3.1 3.6 0 2-1.6 3.7-4.9 3.7-1.4 0-2.7-.4-3.4-.7l.6-2.3z"></path></svg>`;
        break;

      case "jpg":
      case "jpeg":
      case "gif":
      case "ico":
      case "png":
        svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="app-svg --common --svg-image"><path fill="currentColor" d="M21.3 17.2c1 0 1.8-.8 1.8-1.8s-.8-1.8-1.8-1.8-1.8.8-1.8 1.8.8 1.8 1.8 1.8zm-11.1-5.5v12.4h15.3V11.7H10.2zm.7.7h13.9v10.8l-3.6-4.1-2.2 2.6-4.4-4.7-3.7 4.6v-9.2zm9.8-4.5H6.5v10.8h1.9V9.6h12.3V7.9z"></path></svg>`;
        break;

      case "folder":
        svg = `<svg class="app-svg --svg-folder" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="currentColor" d="M28.8 6.9H16.1V5.7c0-1.4-1.1-2.5-2.5-2.5H.6v25.6h30.6V9.4c.1-1.4-1-2.5-2.4-2.5z"></path></svg>`;
        break;
      default:
        svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1000" class="app-svg --unknown"><path fill="currentColor" d="M394.1 537.8h411.7v54.7H394.1v-54.7zm0-130.3H624v54.7H394.1v-54.7zm0-130.3h411.7v54.7H394.1v-54.7zm0 390.9H700v54.7H394.1v-54.7z"></path></svg>`;
    }

    return `<span class="app-icon-wrapper">${svg}</span>`;
  },
  generateListDOM(data){
    const html = this.createList(data)
    const listDOM = document.createElement('div')
    listDOM.innerHTML = html;

    return listDOM.querySelector('.app-list-wrapper')
  },
  appendList(root, listDOM){
    root.appendChild(listDOM)
    this.addListEvents(listDOM)
  },
  prepareList(data, parent){
    const listDOM = this.generateListDOM(data);
    this.appendList(parent, listDOM)
  },
  getRootListWrapper(){
    return this.listRoot.querySelector('.app-list-wrapper')
  },
  setHighlightMargin(listNameEl, rootWrapper){
    const mt = rootWrapper.scrollTop;
    const hl = listNameEl.querySelector(".app-list-highlight");
    hl.style.marginTop = -mt + "px";
  }
});

/**
 * Add event listeners
 */

Object.assign(lolitor.prototype, {
  addListEvents(list) {
    const _this = this;
    const rootListWrapper = this.getRootListWrapper()
    list.querySelectorAll(".app-list-item").forEach(function(el) {
      const listItem = el
      const listNameItem = listItem.querySelector(".app-list-name")

      listItem.addEventListener("click", function(e){
        _this.fetchItem(this)
        e.stopPropagation();
      })

      listNameItem.addEventListener("mouseenter", function() {
        _this.setHighlightMargin(this ,rootListWrapper)
        _this._lastHoveredItem = this
      });

      listNameItem.addEventListener('focus', function(){
        const focusedItem = _this._lastFocusedItem
        focusedItem && focusedItem.classList.remove('--active');
        
        _this._lastFocusedItem = this;
        this.classList.add('--active');
      })
    });
  },

  addRootScrollEvent() {
    const _this = this;
    const rootListWrapper = this.getRootListWrapper()
    rootListWrapper.addEventListener("scroll", function() {
      window.requestAnimationFrame(function(){
        const focusedItem = _this._lastFocusedItem
        if(_this._lastHoveredItem) _this.setHighlightMargin(_this._lastHoveredItem, rootListWrapper)
        if(focusedItem){
          focusedItem.classList.remove('--active')
          focusedItem.blur()
        }
      })
    });
  }
});

module.exports = lolitor
