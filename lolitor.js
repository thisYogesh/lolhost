const { http, main, fs, util } = require('./js/modules')()

function API(port = 8000){
    http.createServer(function(req, res){
        if(req.method === 'GET'){
            res.writeHead(503, "DND")
            res.end("<h1>Service Unavailable</h1>")
            return;
        }
        res.setHeader('content-type', 'application/json');

        main({
            req,
            res,
            dirname: __dirname
        }, {
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