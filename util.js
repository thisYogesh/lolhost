const package = require('./package.json');

const B = 8;
const KB = 1e+3
const MB = 1e+6
const GB = 1e+9
const TB = 1e+12

const wrap = (wrapperEl, innerEls) => {
    let el = innerEls ? `<${wrapperEl}>${innerEls}</${wrapperEl}>` : `</${wrapperEl}><${wrapperEl}>`
    return el
}

const types = {
    'default': 'text/plain',
    '.html'  : 'text/html',
    '.txt'   : 'text/plain',
    '.js'    : 'text/javascript',
    '.css'   : 'text/css',
    '.jpg'   : 'image/jpg',
    '.jpeg'  : 'image/jpeg',
    '.png'   : 'image/png',
    '.ico'   : 'image/ico'
}

const imageTypes = {}
const supportedExt = Object.keys(types)
const supportedTypes = Object.values(types)
supportedTypes.forEach(type => {
    type.includes('image/') && (imageTypes[type] = true) 
})

module.exports = {
    types,
    supportedTypes,
    supportedExt,
    package,

    getRootDirName (dirname){
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

    isImageType(type){
        return !!imageTypes[type]
    },

    isSupportedType(type){
        return !!supportedTypes[type]
    },

    isSupportedExtention(ext){
        return supportedExt.includes(ext)
    },

    getDateTime(date){
        const dt = new Date(date);
        return `${dt.toLocaleDateString()} ${dt.toLocaleTimeString()}`
    },

    getSize(bytes){
        let size = 0;
        let unit = ''
        if(bytes > TB){
            size = bytes/TB
            unit = 'TB'
        }else if(bytes > GB){
            size = bytes/GB
            unit = 'GB'
        }else if(bytes > MB){
            size = bytes/MB
            unit = 'MB'
        }else if(bytes > KB){
            size = bytes/KB
            unit = 'KB'
        }else{
            size = bytes
            unit = 'B'
        }

        size =  Math.round(size)
        return `${size} ${unit}`;
    },

    decodeURL(url){
        return decodeURIComponent(url)
    }
}