const svgExt = require('./extIcons');

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
        <li class="app-list-item" data-isOpen="false" data-isFetched="false">
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
    let svg = svgExt[type];

    if(!svg) {
      switch (type) {
        case "jpg":
        case "jpeg":
        case "gif":
        case "ico":
        case "png":
          svg = svgExt.images;
          break;
        default:
          svg = svgExt.defaulf;
          break;
      }
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
  },

  datasetInit(el){
    const dataset = el.dataset
    dataset.isOpen = dataset.isOpen === "false" ? true : false;
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
