const http = require('http');
const util = require('./js/util');
const fs = require('fs');
const appRx = /^\/@app/;
const config = util.getConfig(__dirname, fs);

function server(port = 8000){
    http.createServer(function(req, res){
        let url = util.normUrl(util.decode(req.url))
        let dirname = __dirname.replace(/\\/g, '/');
        
        if(appRx.test(url)) url = url.replace(appRx, '');
        else dirname = util.normPath(dirname)
        
        const rootDirName = util.getRootDirName(dirname) +  url
        const currentPath = decodeURIComponent(util.getCurrentPath(url))    
        const pathWithDir = dirname + currentPath
        const infoHeaders = ['Filename', 'Type', 'Created', 'Size']
        let dirInfo = [util.createWrapper(infoHeaders, 'th', null)];

        res.setHeader('content-type', 'text/html');

        try{
            const statInfo = fs.statSync(pathWithDir)
            if(statInfo.isDirectory()){
                fs.readFile(pathWithDir + '/' + config.dirIndex, null, function(err, content){
                    if(!err){
                        res.setHeader('content-type', 'text/html');
                        util.response(res, content, true)
                        return;
                    }

                    // if dirIndex is not present then show directory list
                    showDirListing()
                })

                function showDirListing(){
                    fs.readdir(pathWithDir, 'utf8', function(err, files){
                        if(!err){
                            files.forEach(path => {
                                const stat = fs.statSync(pathWithDir + '/' + path);
                                const isDirectory = stat.isDirectory()
                                const type = isDirectory ? 'Folder' : 'File'
                                const pathName = isDirectory ? `${path}/` : path
                                const href = currentPath ? `${currentPath}/${path}` : `/${path}`
                                const isHidden = /^\./.test(pathName) ? '--hidden' : ''
                                const pathAnchor = `<a class='path-name ${isHidden}' title='${pathName}' href='${href}'>${pathName}</a>`
                                const dateTime = util.getDateTime(stat.birthtime)
                                const size = isDirectory ? '--' : util.getSize(stat.size)
                                const statInfo = util.createWrapper([pathAnchor, type, dateTime, size], 'td', null)
                                dirInfo.push(statInfo)
                            })
                            
                            const breadcrumb = util.createNav(rootDirName);
    
                            if(!files.length){
                                dirInfo.push(util.createWrapper(['This Folder is empty!'], `td(colspan=${infoHeaders.length})(align=center)`, 'tr'))
                            }
    
                            dirInfo = util.createWrapper(dirInfo, 'tr', 'table(class=theme1)')
                            util.response(res, `${breadcrumb}<section>${dirInfo}</section>`)
                        }else{
                            util.response(res)
                        }
                    })
                }
            }else{ // open file
                fs.readFile(pathWithDir, null, function(err, content){
                    if(!err){
                        const extention = currentPath.match(/\.\w+$/)
                        const ext = extention && extention[0]
                        const isSupportedExtention = util.isSupportedExtention(ext)
                        let contentType = isSupportedExtention ? util.types[ext] : util.types['default']
    
                        res.setHeader('content-type', contentType);
                        util.response(res, content, true)
                    }else{
                        util.response(res, `Unable to read ${currentPath}`)
                    }
                })
            }
        }catch(e){
            util.throwError(res, {
                code: 404,
                message: 'Path does not exist!'
            });
        }
    }).listen(port)
    
    console.log(`✔︎ Server created at ❤ http://localhost:${port}`)
}

module.exports = server