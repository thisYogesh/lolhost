const wrap = (wrapperEl, innerEls) => {
    let el = innerEls ? `<${wrapperEl}>${innerEls}</${wrapperEl}>` : `</${wrapperEl}><${wrapperEl}>`
    return el
}

const types = {
    'default': 'text/plain',
    '.txt'   : 'text/plain',
    '.js'    : 'text/javascript',
    '.css'   : 'text/css',
    '.jpg'   : 'image/jpg',
    '.jpeg'  : 'image/jpeg',
    '.png'   : 'image/png',
    '.ico'   : 'image/ico'
}

const imageTypes = {}
Object.values(types).forEach(type => {
    type.includes('image/') && (imageTypes[type] = true) 
})

module.exports = {
    getDirName (dirname){
        var dirSplit = dirname.split('/');
        return dirSplit[dirSplit.length  - 1]
    },

    createTableRowColumn(items , itemEl = 'td', itemElWrapper = 'tr'){
        const itemsHtml = items.join(wrap(itemEl))
        const wrapped = wrap(itemEl, itemsHtml)

        return itemElWrapper ? wrap(itemElWrapper, wrapped) : wrapped
    },

    getCurrentPath(url  = '') {
        return url === '/' ? '' : url
    },

    types,

    isImageType(type){
        return !!imageTypes[type]
    }
}