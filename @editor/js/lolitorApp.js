const svgExt = require('./extIcons');
const syntax = require('./syntaxMode')
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

    this.setRootListDOM()
    this.fetchRoot()
    this.setWindowEvents()
    this.initStatusBar()
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
      this.openFile(path, el)
    }
  },

  openFile(path, el){
    const tabRef = this.tabReference[path]
    if(tabRef) {
      this.showTab(tabRef)
      return;
    }

    this.getData(path, (err, resp) => {
      if(!err){
        const content = resp.data
        const isSupported = resp.isSupported

        this.setFetchedData(path, content)
        this.createTab(path, el)
        this.setTabData(content)
        
        if(isSupported) this.setCodeTheme(this.getItemPathExt(path))
        else this.setReadOnly(true)

        this.updateStatusBar()
        this.$cursorChange()
        this.$change()
      }
    })
  },

  fetchDirectory(path, el){
    const isFetched = this.fetchedPath[path]
    if(!isFetched){
      this.setFetchedData(path, true)
      path && this.getData(path, (err, resp) => {
        if(!err){
          this.prepareList(resp.data, el)
          this.toggleList(el, true)
        }
      })
    }else{
      this.toggleList(el, true)
    }
  },

  onSave(){
    console.log('File saved!')
  },

  onChange(){}
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
  setReadOnly(value, editor){
    (editor || this.currentTab.editor).setReadOnly(value)
  },

  setTabData(value, editor){
    (editor || this.currentTab.editor).setValue(value, -1)
  },
  initEditor(selector, tabReference) {
    const editor = ace.edit(selector);
    editor.setOptions({
      fontFamily: "Inconsolata",
      fontSize: "17px"
    });
    editor.session.setUseWorker(false);

    tabReference.editor = editor;
    this.currentTab = tabReference;
    this.setTheme();
  },

  setTheme(editor) {
    (editor || this.currentTab.editor).setTheme("ace/theme/vs_code");
  },

  setCodeTheme(ext, editor) {
    const mode = syntax[ext] || 'text';
    (editor || this.currentTab.editor).session.setMode(`ace/mode/${mode}`);
  },

  createTab(path, el){
    const { editorParent, tabParent } = this.getTabElems()
    const filename = this.lastArrayItem(path.split('/'))

    // create tab editor area
    const tab = document.createElement('div');
    const tabReference = { el: tab, path, treeItem: el}
    this.tabCount = this.tabCount || 0
    const tabId = `lol-editor-tab-${this.tabCount++}`
    tab.classList.add('lol-editor-tab')
    tab.setAttribute('id', tabId)
    
    // create tab button
    const tabButton = this.createTabDOM(filename, tabReference)
    tabParent.append(tabButton)
    tabParent.classList.add('--has-tabs')
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

  /** 
   * Highlight tree item mannualy by overtaking scroll event
  */
  highlightInTree(treeItem, openTillRoot = false){
    // if folders are close then open them to highlight path
    openTillRoot && this.openPathFolders(treeItem)

    this._highlighting = true
    const treeItemName = treeItem.querySelector('.app-list-name')
    const rootListWrapper = this.getRootListWrapper()

    this._lastFocusedItem.classList.remove('--active');
    this._lastFocusedItem = treeItemName

    treeItemName.focus()
    treeItemName.classList.add('--active')

    this.setHighlightMargin(treeItemName, rootListWrapper)
  },

  openPathFolders(treeItem){
    const dataset = treeItem.dataset
    const path = dataset.href.split('/')

    // Remove first and last item
    path.pop();
    path.shift();

    let _treeItem = treeItem
    path.forEach(() => {
      _treeItem = _treeItem.parentNode.parentNode

      // open folders if closed
      this._highlighting = true
      this.toggleList(_treeItem, false, true)
      this._highlighting = false
    })
    // toggleList
  },

  getCursorPosition(){
    return this.currentTab && this.currentTab.editor.getCursorPosition()
  },

  getTabSize(){
    return this.currentTab && this.currentTab.editor.session.$tabSize
  },

  getMode(){
    const mode = this.currentTab && this.currentTab.editor.session.$modeId
    return mode && this.lastArrayItem(mode.split('/'))
  },

  updateStatusBar(){    
    const tabSize =  this.getTabSize()
    const mode = this.getMode()

    this._modeInfo.innerHTML = mode.toUpperCase()
    this._tabInfo.innerHTML = `Tab ${tabSize}`
    this.updateLineCol()
  },

  updateLineCol(){
    const {row, column} = this.getCursorPosition()
    this._lineInfo.innerHTML = `Ln ${row}, Col ${column}`
  },

  $change(){
    this.currentTab.editor.on('change', () => {
      this.onChange()
    })
  },

  $cursorChange(){
    this.currentTab.editor.on('changeSelection', () => {
      this.updateLineCol()
    })
  }
})

/**
 * DOM Manipulation
 */
Object.assign(lolitor.prototype, {
  getTabElems(){
    this.editorParent = this.editorParent || document.querySelector('#lol-editor')
    this.tabParent = this.tabParent || document.querySelector('.app-tab-wrapper')

    return {
      editorParent: this.editorParent, 
      tabParent: this.tabParent
    }
  },

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

  arrengeFoldersFirst(list){
    let lfi = 0
    list.forEach((item, i) => {
      if(item.isDirectory && lfi !== i){
        const dir = list.splice(i, 1)[0]
        list.splice(lfi, 0, dir)
        lfi++
      }
    })
  },

  prepareList(data, parent){
    this.arrengeFoldersFirst(data)
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

  toggleList(el, doHighlight = false, forceState){
    const list = el.querySelector('.app-list-wrapper')
    const dataset = el.dataset

    // to forcefully apply toggle state
    if(forceState !== undefined) dataset.isopen = !forceState

    const isOpen = dataset.isopen
    if(isOpen === Bool.TRUE){
      list.classList.add('--hide')
    }else{
      list.classList.remove('--hide')
    }

    dataset.isopen = !JSON.parse(isOpen)
    doHighlight && this.highlightInTree(el)
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

    closeTab.addEventListener('click', function(e){
      e.stopPropagation();
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
  },

  showAlternativeTab(tabButton){
    const altTabButton = tabButton.previousElementSibling || tabButton.nextElementSibling
    if(!altTabButton) return;

    const tabRef = this.getTabRefByTabButton(altTabButton)
    const treeItem = tabRef.treeItem;
    treeItem && this.fetchItem(treeItem)
  },

  getTabRefByTabButton(tabButton){
    return Object.values(this.tabReference).filter( tabRef => tabRef.button === tabButton )[0]
  },

  killTab(tabRef){
    // remove tab reference 
    delete this.tabReference[tabRef.path]

    // if all tabs are closed
    if(!Object.values(this.tabReference).length){
      const { tabParent } = this.getTabElems()
      tabParent.classList.remove('--has-tabs')
      this.currentTab = null
    }
    // show previous or next tab on tab remove
    else if(tabRef === this.currentTab) {
      this.showAlternativeTab(tabRef.button)
    }
    
    // finally remove it's elements from DOM
    tabRef.el.remove()
    tabRef.button.remove()
  },

  initStatusBar(){
    const html = `
      <ul class="app-status">
        <li class="app-status-item --line-info"></li>
        <li class="app-status-item --mode-info"></li>
        <li class="app-status-item --tab-info"></li>
      </ul>
    `
    const statusBar = document.createElement('div')
    statusBar.innerHTML = html;

    this._lineInfo = statusBar.querySelector('.--line-info')
    this._modeInfo = statusBar.querySelector('.--mode-info')
    this._tabInfo = statusBar.querySelector('.--tab-info')

    const footerEl = document.querySelector('.app-footer')
    footerEl.append(statusBar.querySelector('.app-status'))
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

      listNameItem.addEventListener('click', function(){
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
        if(_this._highlighting){
          _this._highlighting = false;
          return;
        }
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
    this.highlightInTree(tabRef.treeItem, true);
    this.currentTab = tabRef
    this.updateStatusBar()
  },

  closeTab(tabReference, killTab = false){
    const tabRef = tabReference || this.currentTab
    if(!tabRef) return;

    if(!killTab){
      this.toggleTab(tabRef, false)
    }else{
      this.killTab(tabRef);
    }
  },

  setWindowEvents(){
    const _this = this
    window.addEventListener('keydown', function(e){
      if( (e.ctrlKey || e.metaKey) && e.keyCode === 83 ){
        _this.onSave()
        e.preventDefault()
      }
    })

    window.addEventListener('beforeunload', function(e){
      e.returnValue = 'Are you want to close editor?';
    })
  }
});

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
      console.log("Error in fetchData", error);
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

  getItemPathExt(path){
    const title = this.lastArrayItem(path.split('/'))
    return this.getItemExt(title)
  },

  getExtentionType(item) {
    const type = this.getSpecialExtType(item) || this.getItemExt(item.title);
    return type;
  },

  getSpecialExtType(item){
    let type = ''

    if(item.isDirectory){
      type = 'folder'
    }else if(item.title === 'yarn.lock'){
      type = 'yarn'
    }else if(item.title === 'webpack.config.js'){
      type = 'webpack'
    }

    return type
  },

  lastArrayItem(array){
    return array[array.length - 1]
  }
});

module.exports = lolitor
