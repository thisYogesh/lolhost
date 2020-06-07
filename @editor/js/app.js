/**
 * @author Yogesh Jagdale <yog99mail@gmail.com>
 */
const { Method } = require('../../js/enums')
const svgExt = require('./extIcons')
const syntax = require('./syntaxMode')
const Bool = {
  TRUE: "true",
  FALSE: "false"
}
const template = {
  ImageTemplate: 0,
  FileUnsupportTemplate: 1
}
const rootPath = '/'
const ROFolders = ['.git', 'node_modules']

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
    this.tabReference = {}

    // save some usefull elements reference in context
    this.initAppDomRef()
    
    // fetch initial view
    this.fetchRoot()
    
    // attach necessary DOM events
    this.setWindowEvents()
    this.createItemEvents()
  },

  fetchRoot(){
    const rootItem = this._listRoot.querySelector('.app-list-item')
    this.fetchDirectory('/',  rootItem, (err, resp)=>{
      if(!err){
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
        const { data, isImage, isSupported } = resp

        this.setFetchedData(path, data)
        const {tabId, tabReference} = this.createTab(path, el)

        if(isImage){
          this.setTabData({
            value: data,
            template: template.ImageTemplate,
            tabRef: tabReference
          })
        } else if(!isSupported) {
          this.setTabData({
            value: data,
            template: template.FileUnsupportTemplate,
            tabRef: tabReference
          })
        } else {
          // initiate ace editor
          this.initEditor(tabId, tabReference)
          this.setTabData({value: data, tabRef: tabReference})
          this.setCodeTheme(this.getItemPathExt(path))

          this.$cursorChange()
          this.$change()
        }
        
        //Update app header and footer
        this.updateBars()

        // set readonly if file is inside of Read only folders
        if(this._isReadOnly) {
          this.setReadOnly(true)
          this._isReadOnly = false
        }
      }
    })
  },

  fetchDirectory(path, el, cb){
    const isFetched = this.fetchedPath[path]
    if(!isFetched){
      this.setFetchedData(path, true)
      path && this.getData(path, (err, resp) => {
        if(!err){
          this.saveInDataSet(resp.data)
          this.prepareList(resp.data, el)
          path !== rootPath && this.toggleList(el, true)
        }

        cb && cb(err, resp)
      })
    }else{
      this.toggleList(el, true)
    }
  },

  sendToServer(config, cb){
    const { path, update, create, isFile, content } = config
    this.fetch(path, {
      method: Method.PUT,
      body: JSON.stringify({ update, create, isFile, content }),

      responce(resp){
        // callback if provided
        cb && cb(resp)
      },
      error(){}
    })
  },

  saveCurrentTab(cb){
    const _this = this
    const currentTab = _this.currentTab
    if(!currentTab || !currentTab._unsaved) return;

    const content = currentTab.editor.getValue()
    this.sendToServer({
      path: currentTab.path,
      content,
      isFile: true,
      update: true
    }, function(resp){
      if(resp.update){
        const tabRef = _this.currentTab
        
        // save for to compare new value
        tabRef.value = tabRef.editor.getValue()
        tabRef._unsaved = false;

        // update size elements in DOM
        _this.handleSaveStatus()
        
        // update file size in dataSet
        _this.dataSet[tabRef.path].size = resp.updatedSize
        _this.updateFileSize()

        // save the unsaved status in current tab
        currentTab._unsaved = false

        // callback if provided
        cb && cb()
      }else{
        _this.throwAppError("This file can't be overwritten! File Access not allowed.")
      }
    })
  },

  saveFile(cb){
    this.saveCurrentTab(cb)
  },

  onFileContentChange(){
    const currentTab = this.currentTab;
    if(currentTab._unsaved) return;

    this.currentTab._unsaved = true
    this.handleSaveStatus()
  },

  handleSaveStatus(){
    const tabRef = this.currentTab
    const _unsaved = tabRef._unsaved
    const closeButton = tabRef.button.querySelector('.app-file-close')

    if(_unsaved) closeButton.classList.add("--not-saved")
    else closeButton.classList.remove("--not-saved")
  },

  throwAppError(message){
    clearTimeout(this.__errorTimeId)
    const appErrorEl = document.querySelector('.app-error-msg')
    const errorCopy = appErrorEl.querySelector('.error-copy')
    if(!this._inAppError){
      errorCopy.innerHTML = message
      appErrorEl.classList.add('--show')
    }else{
      const errorCopyClone = errorCopy.cloneNode(true)
      errorCopyClone.classList.add('--highlight-error')
      errorCopy.parentNode.replaceChild(errorCopyClone, errorCopy)
    }

    this.__errorTimeId = setTimeout(() => {
      errorCopy.innerHTML = ''
      appErrorEl.classList.remove('--show')
      this._inAppError = false
    }, 3000)

    this._inAppError = true
  }
});

/**
 * Dataset
 */
Object.assign(lolitor.prototype, {
  // map data by path
  dataSet: {},

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
  },

  saveInDataSet(data){
    data.forEach( item => {
      this.dataSet[item.href] = item
    })
  }
})

/**
 * Editor
 */
Object.assign(lolitor.prototype, {
  setReadOnly(value, editor){
    (editor || this.currentTab.editor).setReadOnly(value)
  },

  setTabData({value, editor, template = -1, tabRef}){
    if(template === -1){
      (editor || tabRef.editor).setValue(value, -1)
      
      /**
       * if tab has no template then save value in tab reference
       * to preserve old value if user want to reject new changes.
       */
      tabRef.value = value

      /**
       * Reset undo state to prevent file from getting 
       * empty on initial undo
       */
      tabRef.editor.session.setUndoManager(new ace.UndoManager())
      // session.getUndoManager().reset();
    } 
    else this.setTemplate(value, template)

    // setting up template type
    tabRef.template = template;
  },
  initEditor(selector, tabReference) {
    const editor = ace.edit(selector);
    const session = editor.session
    editor.setOptions({
      fontFamily: "Inconsolata",
      fontSize: "17px"
    });

    // set editor session
    session.setUseWorker(false) // to disable error info
    session.setTabSize(2)
   

    tabReference.editor = editor;
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
    const tabReference = { el: tab, path, treeItem: el, template: -1 }
    this.tabCount = this.tabCount || 0
    const tabId = `lol-editor-tab-${this.tabCount++}`
    tab.classList.add('lol-editor-tab')
    tab.setAttribute('id', tabId)
    
    // create tab button
    const tabButton = this.createTabDOM(filename, tabReference)
    tabParent.append(tabButton)
    tabButton.scrollIntoView() // scroll to active tab button
    tabParent.classList.add('--has-tabs')
    tabReference.button = tabButton
    
    // close previous opened tab
    this.closeTab()

    // save current tab reference
    this.tabReference[path] = tabReference

    // append tab into DOM
    editorParent.append(tab)
    this.currentTab = tabReference;

    return {
      tabId, 
      tabReference
    }
  },

  /** 
   * Highlight tree item mannualy by overtaking scroll event
  */
  highlightInTree(treeItem, openTillRoot = false){
    // if folders are close then open them to highlight path
    openTillRoot && this.openPathFolders(treeItem)

    this._highlighting = true
    const treeItemName = treeItem.querySelector('.app-list-name')

    this.setLastFocusedItem(treeItemName.parentNode)

    treeItemName.focus()
    treeItemName.classList.add('--active')

    this.setHighlightMargin(treeItemName)
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

  updateFooterBar(){
    if(this.currentTab){
      this._appFooterStatus.classList.remove('--hide')
      if(this.currentTab.template === -1){
        const tabSize =  this.getTabSize()
        const mode = this.getMode().toUpperCase()
      
        this._modeInfo.innerHTML = {
          JAVASCRIPT: 'JavaScript',
          CSS: 'CSS',
          TEXT: 'Plain Text'
        }[mode] || mode
        this._tabInfo.innerHTML = `Tab: ${tabSize}s`
        this.updateLineCol()
        this._imgDimension.innerHTML = ''
        this.updateFileSize()
      }else if(this.currentTab.template === template.ImageTemplate){
        this._modeInfo.innerHTML = ''
        this._tabInfo.innerHTML = ''
        this._lineInfo.innerHTML = ''
        this.showImageResolution()
        this.updateFileSize()
      }else {
        this._appFooterStatus.classList.add('--hide')
      }
      return;
    }
    this._appFooterStatus.classList.add('--hide')
  },

  showImageResolution(){
    const _this = this;
    const img = _this.currentTab.el.querySelector('img')
    const updateInfo = function(){
      _this._imgDimension.innerHTML = `${this.naturalHeight} x ${this.naturalWidth}`
    }
    img.onload = function(){
      updateInfo.apply(this)
    }
    updateInfo.apply(img)
  },

  updateFileSize(){
    const currentTab = this.currentTab;
    const fileInfo = this.dataSet[currentTab.path]  
    const sizeEl = currentTab.treeItem.querySelector('.app-list-item-size')

    this._fileSize.innerHTML = fileInfo.size
    sizeEl.innerHTML = fileInfo.size
  },

  updateHeaderBar(){
    if(this.currentTab){
      const path = this.currentTab.path
      this._appFilename.innerHTML = this.lastArrayItem(path.split('/'))
      return;
    }

    this._appFilename.innerHTML = ''
  },

  updateBars(){
    this.updateHeaderBar()
    this.updateFooterBar()
  },

  updateLineCol(){
    const {row, column} = this.getCursorPosition()
    this._lineInfo.innerHTML = `Ln ${row}, Col ${column}`
  },

  $change(){
    this.currentTab.editor.on('change', () => {
      this.onFileContentChange()
    })
  },

  $cursorChange(){
    this.currentTab.editor.on('changeSelection', () => {
      this.frames(()=>{
        this.updateLineCol()
      })
    })
  }
})

/**
 * Build template
 */

Object.assign(lolitor.prototype, {
  getTemplate(templ){
    let templateFn
    switch(templ){
      case template.ImageTemplate:
        templateFn = function(src){
          return `<figure class="app-image-tab"><img src="${src}"/></figure>`
        }
        break;
      
      case template.FileUnsupportTemplate:
        templateFn = function(message){
          return `
            <artical class="app-tab-nos">
              <div class="__msg-wrapper">
                <span class="__msg">This file has an unsuported text encoding...</span>
              </div>
            </artical>`
        }
        break;
    }

    return templateFn
  },

  setTemplate(value, template, tabEl){
    const tabElm = tabEl || this.currentTab.el
    const templateFn = this.getTemplate(template)
    const html = templateFn(value)
    tabElm.innerHTML = html
  }
})

/**
 * DOM Manipulation
 */
Object.assign(lolitor.prototype, {
  setLastFocusedItem(el){
    const focusedItem = this._lastFocusedItem

    // if found last focused item then remove --active from it.
    if(focusedItem){
      const focusedItemChild = focusedItem.querySelector('.app-list-name')
      focusedItemChild && focusedItemChild.classList.remove('--active');
    }
    
    this._lastFocusedItem = el;
  },
  getTabElems(){
    this.editorParent = this.editorParent || document.querySelector('#lol-editor')
    this.tabParent = this.tabParent || document.querySelector('.app-tab-wrapper')

    return {
      editorParent: this.editorParent, 
      tabParent: this.tabParent
    }
  },

  initAppDomRef(){
    this._listRoot = document.querySelector(".app-list-wrapper.--root-wrapper");
    this.initStatusBar();
    this._appFilename = document.querySelector('.app-header-filename')
    this._appFooterStatus = document.querySelector('.app-status')
    this._confirmationBox = document.querySelector('.app-popup')
    this._contextMenu = document.querySelector('.app-context-menu')
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
    const size = item.size
    const iconHtml = this.getIconHtml(item);
    const isReadOnly = isDirectory && ROFolders.includes(title)
    const create = item.create
    const createInnerListView = () => {
      let html = ''
      if(create){
        html = `<input type="text" spellcheck="false" class="app-create-input">`
      }else{
        html = `${title} <i class="app-list-item-size ${!size && '--hide' || ''}">&#8212; ${size}</i>`
      }

      return html
    }
    const html = `
        <li class="app-list-item${isReadOnly ? ' --read-only-dir' : ''}" data-isdirectory="${isDirectory}" data-href="${href}" data-isopen="false">
          <a tabindex="0" class="app-list-name file-ex-side-pad ${itemTypeClass} ${itemHiddenClass}">
            <span class="app-list-highlight"></span> 
            <div class="app-list-name-content">
              ${iconHtml}
              <span class="app-list-name-title">
                ${createInnerListView()}
              </span>
            </div>
          </a>
        </li>`;
    return html.trim();
  },

  createListItemDOM(options){
    const newListItem = this.createListItem(options)
    const domWrapper = document.createElement('div')
    domWrapper.innerHTML = newListItem

    return domWrapper.querySelector('.app-list-item')
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
    return this._listRoot.querySelector('.app-list-wrapper')
  },

  setHighlightMargin(listNameEl, rootWrapper){
    const rootListWrapper = rootWrapper || this.getRootListWrapper()
    const mt = rootListWrapper.scrollTop;
    const hl = listNameEl.querySelector(".app-list-highlight");
    hl.style.marginTop = -mt + "px";
  },

  toggleList(el, doHighlight = false, forceState){
    const list = el.querySelector('.app-list-wrapper')
    const dataset = el.dataset

    // to forcefully apply toggle state
    if(forceState !== undefined) dataset.isopen = !forceState

    const isOpen = dataset.isopen || Bool.FALSE
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
    <div tabindex="0" class="app-tab-item --active-tab">
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

    this.setEvents(tab, {
      click(){
        _this.showTab(tabReference)
      }
    })

    (closeTab, {
      click(e){
        e.stopPropagation();

        if(!tabReference._unsaved){
          _this.closeTab(tabReference, true)
        }else{
          _this.confirm({
            message: 'Do you want to save the changes?',
            onConfirm(){
              _this.saveFile(function(){
                _this.closeTab(tabReference, true)
              })
            },
            onDiscard(){
              _this.closeTab(tabReference, true)
            },
            // onAbort(){ }
          })
        }
      }
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
    // show previous or next tab on tab remove
    if(tabRef === this.currentTab) {
      this.showAlternativeTab(tabRef.button)
    }
  
    // remove it's elements from DOM
    tabRef.el.remove()
    tabRef.button.remove()
    
    // remove tab reference 
    delete this.tabReference[tabRef.path]
    
    // if all tabs are closed
    if(!Object.values(this.tabReference).length){
      const { tabParent } = this.getTabElems()
      tabParent.classList.remove('--has-tabs')
      this.currentTab = null
    }
  },

  initStatusBar(){
    const html = `
      <ul class="app-status">
        <li class="app-status-item --line-info"></li>
        <li class="app-status-item --mode-info"></li>
        <li class="app-status-item --tab-info"></li>
        <li class="app-status-item --img-dimension"></li>
        <li class="app-status-item --file-size"></li>
      </ul>
    `
    const statusBar = document.createElement('div')
    statusBar.innerHTML = html;

    this._fileSize = statusBar.querySelector('.--file-size')
    this._lineInfo = statusBar.querySelector('.--line-info')
    this._modeInfo = statusBar.querySelector('.--mode-info')
    this._tabInfo = statusBar.querySelector('.--tab-info')
    this._imgDimension = statusBar.querySelector('.--img-dimension')

    const footerEl = document.querySelector('.app-footer')
    footerEl.append(statusBar.querySelector('.app-status'))
  }
});

/**
 * Add event listeners
 */

Object.assign(lolitor.prototype, {
  createItemEvents(){
    const _this = this;
    const createButtons = document.querySelectorAll('.app-item-create')
    createButtons.forEach(button => {
      const isCreateFile = button.classList.contains('--create-file')
      if(isCreateFile) this.setEvents(button, {
        click(){
          _this.createFile()
        }
      })
      
      else this.setEvents(button, {
        click(){
          _this.createFolder()
        }
      })
    })
  },

  getActiveFocusedList() {
    let activeListEl;
    const focusedItem = this._lastFocusedItem
    if(focusedItem){
      const data = focusedItem.dataset
      if(data.isdirectory === Bool.TRUE) activeListEl = focusedItem.querySelector('.app-list-wrapper')
      else activeListEl = focusedItem.parentNode
    }else{
      activeListEl = this._listRoot.querySelector('.app-list-wrapper')
    }

    return activeListEl
  },

  getPlaceholderPos(listEl, isDirectory){
    let firstItem = listEl.querySelector(`:scope > [data-isdirectory=${isDirectory}]`)
    if(!firstItem && isDirectory){
      firstItem = listEl.querySelector(`:scope > [data-isdirectory=false]`)
    }

    return firstItem
  },

  createNewItemPlaceholder(isDirectory){
    const listEl = this.getActiveFocusedList()
    const firstItem = this.getPlaceholderPos(listEl, isDirectory)
    const itemConfig = {
      href: listEl.parentNode.dataset.href || '/',
      isDirectory,
      isHidden: false,
      size: "",
      title: "",
      create: true
    }
    const listItemDom = this.createListItemDOM(itemConfig)
    listEl.insertBefore(listItemDom, firstItem)

    // open tree if closed
    firstItem && this.openPathFolders(firstItem)

    // add DOM events to new treeItem
    this.CNItemEvents(listItemDom, itemConfig, isDirectory)
  },

  CNItemEvents(listItem, itemConfig, isDirectory){
    const _this = this
    const input = listItem.querySelector('input')
    const createFn = this.createNewItem.bind(_this, listItem, itemConfig, isDirectory)

    this.setEvents(input, {
      blur(){
        listItem.remove()
      },
      
      keyup(e){
        _this.onEnterKeyUp(e, createFn)
      }
    })
    
    this.addListItemMouseEv(listItem)
    input.focus()
  },

  createNewItem(listItem, itemConfig, isDirectory){
    const input = listItem.querySelector('input')
    const value = input.value
    const _path = itemConfig.href
    const prePath = _path === rootPath ? _path : _path.concat('/')
    const path = `${prePath}${value}`

    // create file on server
    this.sendToServer({
      path, 
      content: '',
      isFile: !isDirectory,
      create: true
    }, (resp) => {
      const { create, isFile, updatedSize } = resp

      if(create){
        const listItemConfig = {
          href: path,
          isDirectory: !isFile,
          isHidden: false,
          size: updatedSize,
          title: value
        }
        const listItemDOM = this.createListItemDOM(listItemConfig)
        listItem.parentNode.insertBefore(listItemDOM, listItem)
        
        // to remove listItem placeholder
        input.blur()
        
        if(isFile) this.dataSet[path] = listItemConfig

        // attach all essential events of tree item
        this.addListItemEvents(listItemDOM)

        // open tab
        if(isFile) this.openFile(path, listItemDOM)

        this.makeActiveTreeItem(null, listItemDOM)
      }else{
        this.throwAppError("Operation not allowed! File creation failed.")
      }
    })
  },

  createFile(){
    this.createNewItemPlaceholder(false)
  },

  createFolder(){
    this.createNewItemPlaceholder(true)
  },

  addListItemMouseEv(listItem, listNameItemEl){
    const _this = this
    const listNameItem = listNameItemEl || listItem.querySelector(".app-list-name")

    this.setEvents(listNameItem, {
      mouseenter() {
        _this.setHighlightMargin(this)
        _this._lastHoveredItem = this
      }
    })
  },

  addListEvents(list) {
    const _this = this;
    list.querySelectorAll(".app-list-item").forEach(function(el) {
      _this.addListItemEvents(el)
    });
  },

  addListItemEvents(listItem){
    const _this = this;
    const listNameItem = listItem.querySelector(".app-list-name")

    /**
     * Capture ON
     * This event make sure to open file in readonly mode
     * if file comes under restricted folders
     */
    this.setEvents(listItem, {
      $click(e){
        let isValidPath = false

        // check if clicked on file
        for( let el of e.path ){
          if(el.nodeType === 1 && el.classList.contains('app-list-item') && el.dataset.isdirectory === Bool.FALSE){
            isValidPath = true
          }
        }

        if(isValidPath){
          const isReadOnly = this.classList.contains('--read-only-dir')
          if(isReadOnly) _this._isReadOnly = isReadOnly
        }else{
          _this._isReadOnly = false
        }
      },

      click(e){
        _this.fetchItem(this)
        e.stopPropagation();
      }
    })
    
    (listNameItem, {
      click(){
        _this.makeActiveTreeItem(this)
      }
    })

    this.addListItemMouseEv(listItem, listNameItem)
  },

  makeActiveTreeItem(listNameItem, treeItem){
    const el = listNameItem || treeItem.querySelector('.app-list-name')

    this.setLastFocusedItem(el.parentNode)
    el.classList.add('--active');
  },

  addRootScrollEvent() {
    const _this = this;
    const rootListWrapper = this.getRootListWrapper()

    this.setEvents(rootListWrapper, {
      scroll() {
        _this.frames(function(){
          if(_this._highlighting){
            _this._highlighting = false;
            return;
          }
          if(_this._lastHoveredItem) _this.setHighlightMargin(_this._lastHoveredItem, rootListWrapper)
          
          const focusedItem = _this._lastFocusedItem
          if(focusedItem){
            const focusedItemChild = focusedItem.querySelector('.app-list-name')
            focusedItemChild.classList.remove('--active')
            focusedItemChild.blur()
          }
        })
      }
    })
  },

  showTab(tabRef){
    // close previous tab if opened
    this.closeTab()
    this.toggleTab(tabRef, true)
    this.highlightInTree(tabRef.treeItem, true);
    this.currentTab = tabRef
    this.updateBars()

    // scroll to active tab button
    tabRef.button.scrollIntoView()
  },

  closeTab(tabReference, killTab = false){
    const tabRef = tabReference || this.currentTab
    if(!tabRef) return;

    if(!killTab){
      this.toggleTab(tabRef, false)
    }else{
      this.killTab(tabRef);
    }

    this.updateBars()
  },

  setWindowEvents(){
    const _this = this

    this.setEvents(window, {
      click(){
        _this._contextMenu.classList.add('--hide')
      },

      keydown(e){
        if( (e.ctrlKey || e.metaKey) && e.keyCode === 83 ){
          e.preventDefault()
          _this.saveFile()
        }
      },
      
      contextmenu(e){
        const rootTreeWrapper = _this._listRoot.querySelector('.app-list-wrapper')
        if(e.path.includes(rootTreeWrapper)){
          e.preventDefault()
          _this.onContextMenu(e)
        }
      },

      beforeunload(e){
        e.returnValue = 'Are you want to close editor?';
      },
    })

    (this._contextMenu, {
      contextmenu(e){
        e.preventDefault()
        e.stopPropagation()
      }
    })
  }
});

/**
 * Context menu
 */

Object.assign(lolitor.prototype, {
  onContextMenu(e){
    const {x, y} = e
    const menu = this._contextMenu

    menu.classList.remove('--hide')
    this.setStyle(menu, {
      top: `${y - 10}px`,
      left: `${x + 10}px`
    })
  }
})

/**
 * Util
 */
Object.assign(lolitor.prototype, {
  fetch(url, options = {}) {
    fetch(url, {
      method: options.method || Method.POST,
      body: options.body || ''
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
  },

  frames(cb){
    window.requestAnimationFrame(cb)
  },

  onEnterKeyUp(e, cb){
    if(e.keyCode === 13) cb && cb()
  },

  setStyle(el, styles){
    for(let style in styles){
      el.style[style] = styles[style]
    }
  },

  setEvents(el, events){
    for(let event in events){
      const capture = /^\$/.test(event)
      el.addEventListener(event.replace('$', ''), events[event], capture)
    }

    return this.setEvents
  }
});

/**
 * Confirmation box
 */

Object.assign(lolitor.prototype, {
  togglConfirmBox(state){
    const cbox = this._confirmationBox
    const popupBox = cbox.querySelector('.app-popup-box')
    
    if(state){
      cbox.classList.remove('--hide');
      popupBox.classList.remove('--bump-out')
      popupBox.classList.add('--bump-in')
    }else{
      popupBox.classList.add('--bump-out')
      popupBox.classList.remove('--bump-in')
      setTimeout(() => {
        cbox.classList.add('--hide');
      }, 300);
    }
  },

  addConfirmBoxEvents({ onConfirm, onDiscard, onAbort }){
    this.$cbConfig = { onConfirm, onDiscard, onAbort }
    if(this._initConfBox) return;

    const cbox = this._confirmationBox
    this._initConfBox = true;
    const confirmBtn = cbox.querySelector('.--save-btn')
    const discardBtn = cbox.querySelector('.--dont-btn')
    const abortBtn = cbox.querySelector('.app-popup-box-close')
    const _this = this
    
    this.setEvents(confirmBtn, {
      click(){
        const { onConfirm } = _this.$cbConfig
        cboxEvents(onConfirm)
      }
    })

    (discardBtn, {
      click(){
        const { onDiscard } = _this.$cbConfig
        cboxEvents(onDiscard)
      }
    })

    (abortBtn, {
      click(){
        const { onAbort } = _this.$cbConfig
        cboxEvents(onAbort)
      }
    })

    function cboxEvents(fn){
      fn && fn()
      _this.togglConfirmBox(false)
    }
  },

  confirm({ message, onConfirm, onDiscard, onAbort }){
    this.addConfirmBoxEvents({ onConfirm, onDiscard, onAbort })
    
    const cbox = this._confirmationBox
    const contentBox = cbox.querySelector('.app-popup-box-content')
    contentBox.innerHTML = message

    this.togglConfirmBox(true)
  }
})

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
