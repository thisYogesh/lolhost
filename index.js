const http = require('http');
const util = require('./js/util');
const fs = require('fs')

function server(port = 8000){
    http.createServer(function(req, res){
        const url = util.normUrl(util.decode(req.url))
        const dirname = __dirname.replace(/\\/g, '/').replace(`/node_modules/${util.package.name}`);
        const rootDirName = util.getRootDirName(dirname) +  url
        const currentPath = decodeURIComponent(util.getCurrentPath(url))    
        const pathWithDir = dirname + currentPath
        const infoHeaders = ['Filename', 'Type', 'Created', 'Size']
        let dirInfo = [util.createWrapper(infoHeaders, 'th', null)];

        res.setHeader('content-type', 'text/html');

        try{
            const statInfo = fs.statSync(pathWithDir)
            if(statInfo.isDirectory()){
                fs.readdir(pathWithDir, 'utf8', function(err, files){
                    if(!err){
                        files.forEach(path => {
                            const stat = fs.statSync(pathWithDir + '/' + path);
                            const isDirectory = stat.isDirectory()
                            const type = isDirectory ? 'Folder' : 'File'
                            const pathName = isDirectory ? `${path}/` : path
                            const href = currentPath ? `${currentPath}/${path}` : `/${path}`
                            const pathAnchor = `<a class='path-name' title='${pathName}' href='${href}'>${pathName}</a>`
                            const dateTime = util.getDateTime(stat.birthtime)
                            const size = util.getSize(stat.size)
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
            res.writeHead(404, 'File not found!');
            util.response(res, `<h2 class='error --404'><b>404</b> ${currentPath} Path does not exist!</h2>`)
        }
    }).listen(port)
    console.log(`server created at http://localhost:${port}`)
}

module.exports = server