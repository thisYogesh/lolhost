const package = require('../package.json');
const B = 8;
const KB = 1e+3
const MB = 1e+6
const GB = 1e+9
const TB = 1e+12
const types = {
    'default': 'text/plain',
    '.html'  : 'text/html',
    '.txt'   : 'text/plain',
    '.js'    : 'text/javascript',
    '.css'   : 'text/css',
    '.json'  :  'application/json',
    
    // Image types 
    '.jpg'   : 'image/jpg',
    '.jpeg'  : 'image/jpeg',
    '.png'   : 'image/png',
    '.ico'   : 'image/ico',

    // Font types
    '.ttf'   : 'application/octet-stream'
}
const imageTypes = {}
const supportedExt = Object.keys(types)
const supportedTypes = Object.values(types)
supportedTypes.forEach(type => {
    type.includes('image/') && (imageTypes[type] = true) 
})

const getElAttrs = (tag) => {
    const attrRx = /\([a-z]+=[a-z|\-|\w+]+\)/ig
    const start = tag.replace(/\(|\)/g, ' ')
    const end = tag.replace(attrRx, '')

    return { start, end }
}

const wrap = (wrapperEl, innerHtml) => {
    try{
        const elAttrs = getElAttrs(wrapperEl)
        const wrapperElStart = elAttrs.start
        const wrapperElEnd = elAttrs.end

        let el = innerHtml ? `<${wrapperElStart}>${innerHtml}</${wrapperElEnd}>` : `</${wrapperElEnd}><${wrapperElStart}>`
        return el
    }catch{
        console.log('Error at .wrap() in util.js')
    }
}

const createWrapper = (items , itemEl = 'td', itemElWrapper = 'tr')  => {
    const isObject = typeof items[0] === "object"
    let html = '', wrapped = ''
    if(!isObject){
        const innerHtml = items.join(wrap(itemEl))
        wrapped = wrap(itemEl, innerHtml)
    }else{
        const el = getElAttrs(itemEl).end
        wrapped = items.reduce((acc, item) => {
            const elAttrs = getElAttrs(item.attr)
            acc.push(`<${el} ${elAttrs.start}>${item.content}</${el}>`)
            return acc
        }, []).join('')
    }
    
    html = itemElWrapper ? wrap(itemElWrapper, wrapped) : wrapped

    return html
}

const addAttrs = (str, attrs) => {
    Object.keys(attrs).forEach(attr => {
        str  = str.concat('(', attr, '=', attrs[attr], ')')
    })

    return str
}


module.exports = {
    types,
    supportedTypes,
    supportedExt,
    package,
    createWrapper,

    getRootDirName (dirname){
        var dirSplit = dirname.split('/');
        global.appRootPath = dirSplit[dirSplit.length  - 1]
        return dirSplit[dirSplit.length  - 1]
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

    decode(url){
        return decodeURIComponent(url)
    },

    response(res, data = '', isFile = false){
        !isFile && res.write(`<head> <link rel="stylesheet" href="/css/style.css"/> </head>`);
        res.end(data)
    },

    createNav(localpath){
        let _path = ''
        const paths = localpath.split('/').reduce((acc, path) => {
            const __path = path === global.appRootPath ? '/' : path.concat('/')
            path && acc.push({
                content: path,
                attr: addAttrs('', { href: _path += __path })
            })
            return acc
        }, [])

        return createWrapper(
            paths, 
            addAttrs('a', { class: 'nav-item' }), 
            addAttrs('nav', {id: 'nav-bar'})
        )
    },

    normUrl(url){
        return url ===  '/' ? url : url.replace(/\/$/, '')
    }
}