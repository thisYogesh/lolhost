const svgExt = require('./extIcons');
const Bool = {
  TRUE: "true",
  FALSE: "false"
}

function lolitor() {
  this.initApp();
}

/**
 * Application
 */
Object.assign(lolitor.prototype, {
  initApp() {
    // save fetched path to avoid extra requests
    this.fetchedPath = {}

    // save all opened tab reference
    this.tabReference= {}

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
    const dataset = el.dataset
    const path = dataset.href
    const isDirectory = dataset.isdirectory
    
    if(isDirectory === Bool.TRUE){
      this.fetchDirectory(path, el)
    }else{
      this.openFile(path)
    }
  },

  openFile(path){
    const tabRef = this.tabReference[path]
    if(tabRef) {
      this.showTab(tabRef) 
      return;
    }

    this.createTab(path)
  },

  fetchDirectory(path, el){
    const isFetched = this.fetchedPath[path]
    if(!isFetched){
      this.setFetchedData(path, true)
      path && this.getData(path, (err, resp) => {
        if(!err){
          this.prepareList(resp.data, el)
          this.toggleList(el)
        }
      })
    }else{
      this.toggleList(el)
    }
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
  },

  setFetchedData(path, data){
    this.fetchedPath[path] = data
  }
})

/**
 * Editor
 */
Object.assign(lolitor.prototype, {
  initEditor(selector, tabReference) {
    const editor = ace.edit(selector);
    editor.setOptions({
      fontFamily: "Inconsolata",
      fontSize: "16px"
    });
    editor.session.setUseWorker(false);

    tabReference.editor = editor;
    this.currentEditor = editor;
    this.setTheme();
  },

  setTheme(editor) {
    (editor || this.currentEditor).setTheme("ace/theme/vs_code");
  },

  setCodeTheme() {
    (editor || this.currentEditor).session.setMode("ace/mode/html");
  },

  createTab(path){
    const editorParent = document.querySelector('#lol-editor')
    const tabParent = document.querySelector('.app-tab-wrapper')
    const filename = this.lastArrayItem(path.split('/'))

    // create tab editor area
    const tab = document.createElement('div');
    const tabReference = { el: tab, path }
    this.tabCount = this.tabCount || 0
    const tabId = `lol-editor-tab-${this.tabCount++}`
    tab.classList.add('lol-editor-tab')
    tab.setAttribute('id', tabId)
    
    // create tab button
    const tabButton = this.createTabDOM(filename, tabReference)
    tabParent.append(tabButton)
    tabReference.button = tabButton
    
    // close previous opened tab
    this.closeTab()

    // save current tab reference
    this.tabReference[path] = tabReference

    // append tab into DOM
    editorParent.append(tab)

    // initiate ace editor
    this.initEditor(tabId, tabReference)
  },

  getCurrentTab(){
    if(!this.currentEditor) return;

    const refData = Object.values(this.tabReference)
    const prevTabReference = refData.filter( tab => tab.editor === this.currentEditor )[0]
    return prevTabReference
  }

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
  },

  lastArrayItem(array){
    return array[array.length - 1]
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
    const isDirectory = item.isDirectory
    const title = item.title;
    const href = item.href;
    const iconHtml = this.getIconHtml(item);
    const html = `
        <li class="app-list-item" data-isdirectory="${isDirectory}" data-href="${href}" data-isopen="false">
          <a tabindex="0" class="app-list-name file-ex-side-pad ${itemTypeClass} ${itemHiddenClass}">
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
        
        case "ttf":
        case "otf":
        case "woff":
        case "woff2":
        case "eot":
          svg = svgExt.fonts;
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

  toggleList(el){
    const list = el.querySelector('.app-list-wrapper')
    const dataset = el.dataset
    const isOpen = dataset.isopen
    if(isOpen === Bool.TRUE){
      list.classList.add('--hide')
    }else{
      list.classList.remove('--hide')
    }

    dataset.isopen = !JSON.parse(isOpen)
  },

  createTabDOM(filename, tabReference){
    const _this = this
    const wrapper = document.createElement('div')
    const html = `
    <div class="app-tab-item --active-tab">
      ${filename}
      <a tabindex="0" class="app-file-close">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.428 8L12 10.573 10.572 12 8 9.428 5.428 12 4 10.573 6.572 8 4 5.428 5.427 4 8 6.572 10.573 4 12 5.428 9.428 8z"></path>
        </svg>
      </a>
    </div>`

    wrapper.innerHTML = html
    const tab = wrapper.querySelector('.app-tab-item')
    const closeTab = wrapper.querySelector('.app-file-close')

    tab.addEventListener('click', function(){
      _this.showTab(tabReference)
    })

    closeTab.addEventListener('click', function(){
      _this.closeTab(tabReference, true)
    })

    return tab
  },

  toggleTab(tabRef, show){
    if(show) {
      tabRef.el.classList.remove('--hide')
      tabRef.button.classList.add('--active-tab')
    }else{
      tabRef.el.classList.add('--hide')
      tabRef.button.classList.remove('--active-tab')
    }
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
  },

  showTab(tabRef){
    // close previous tab if opened
    this.closeTab()
    this.toggleTab(tabRef, true)
    this.currentEditor = tabRef.editor
  },

  closeTab(tabReference, killTab = false){
    const tabRef = tabReference || this.getCurrentTab()
    if(!tabRef) return;

    if(!killTab){
      this.toggleTab(tabRef, false)
    }else{
      tabRef.el.remove()
      tabRef.button.remove()

      delete this.tabReference[tabRef.path]
    }
  }
});

module.exports = lolitor
