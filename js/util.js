const package = require('../package.json');
const types = require('./mime')
const config = require('./config')
const KB = 1e+3
const MB = 1e+6
const GB = 1e+9
const TB = 1e+12
const supportedExt = Object.keys(types)
const supportedTypes = Object.values(types)
const imageTypes = {}
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

const response = (res, data = '', isFile = false) => {
    !isFile && res.write(`<head> <link rel="stylesheet" href="/@app/css/style.css"/> </head>`);
    res.end(data)
}

const errorPage = (code)=> {
    let content = ''
    switch(code){
        case 404:
            content = `
            <section class="error-page">
                <article>
                    <span class="excla">!</span>
                    <h2>404</h2>
                    <p>This path does not exist!</p>
                    <button onclick='location.reload()'>Reload</button>
                    <button onclick='history.back()'>Back</button>
                </article>
            </section>
            `;
            break;
        case 403.13:
            content = `
            <section class="error-page">
                <article>
                    <span class="excla">!</span>
                    <h2>403.13</h2>
                    <p>Forbidden! The Web server is configured to not list the contents of this directory.</p>
                    <p>For more detail see <b>lolhost.config</b></p>
                </article>
            </section>
            `;
            break;
    }

    return content
}

const normPath = (path) => {
    return path.replace(`/node_modules/${package.name}`, '');
}

module.exports = {
    types,
    supportedTypes,
    supportedExt,
    package,
    createWrapper,
    response,
    normPath,

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
    },

    throwError(res, status = {}){
        const code = status.code
        res.writeHead(code, status.message || '')
        response(res, errorPage(code))
    },

    getConfig(dirname, fs){
        const message = {
            syntaxError: '✘ Syntax error in lolhost.config. Please follow JSON Syntax Rules',
            initDefault: 'ℹ Server initialize with (default) config',
            initUpdated: 'ℹ Server initialize with (updated) config'
        }
        let _config;
        dirname = normPath(dirname.replace(/\\/g, '/'));
        try{
            let data = fs.readFileSync(dirname + '/' + 'lolhost.config', 'utf-8')
            try{
                if(data.trim()) _config = JSON.parse(data), console.log(message.initUpdated)
                else _config = {}, console.log(message.initDefault)
            }catch{
                _config = {}
                console.log(message.syntaxError)
                console.log(message.initDefault)
            }
        }catch{
            _config = {}
            console.log(message.initDefault)
        }

        return Object.assign(config, _config);
    }
}