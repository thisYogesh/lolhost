const { http, main, fs, util } = require('./js/modules')()
const { Method } = require('./js/enums')

function API(port = 8000){
    http.createServer(function(req, res){
        const type = req.method
        const contentType = type === Method.GET ? 'text/html' : 'application/json'
        
        res.setHeader('content-type', contentType);
        main({
            req,
            res,
            dirname: __dirname
        }, {
            interceptor({isAppURL, pathWithDir, currentPath}){
                if(type === Method.GET){
                    if(isAppURL){
                        fs.readFile(pathWithDir, null, function(err, content){
                            if(!err){
                                util.setContentType(res, currentPath)
                                res.end(content)
                                return;
                            }
                            res.end('')
                        })
                    } else if(currentPath){
                        util.redirect(res, `http://${req.headers.host}/`);
                        return;
                    }else{
                        const indexHtml = require('./js/lolitor.html.js')
                        const pathSplit = pathWithDir.split(/\/|\\/)
                        const rootFolderName = pathSplit[pathSplit.length - 1]
                        const html = indexHtml(rootFolderName)
                        res.end(html)
                    }
                }else{
                    return true
                }
            },
            onFile(err, content){
                if(!err){
                    res.end(util.buildResObject(content))
                }else{
                    res.writeHead(404);
                    res.end(util.buildResObject(false))
                }
            },
            onDir(err, list, { currentPath, pathWithDir }){
                let responceData;
                if(!err){
                    const fileList = []
                    list.forEach(function(path){
                        const fileInfo = util.getFileInfo(fs, pathWithDir, path, currentPath)
                        delete fileInfo.stat
                        fileList.push(fileInfo)
                    })
                    responceData = fileList
                }else{
                    responceData = false
                    res.writeHead(404);
                }

                res.end(util.buildResObject(responceData))
            },
            onError(){
                res.writeHead(404);
                res.end(util.buildResObject(false))
            }
        })
    }).listen(port)
}

module.exports = API