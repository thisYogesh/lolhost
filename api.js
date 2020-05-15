const { http, main, fs, util } = require('./js/modules')()

function API(port = 8000){
    http.createServer(function(req, res){
        res.setHeader('content-type', 'application/json');

        main({
            req,
            res,
            dirname: __dirname
        }, {
            onFile(err, content, { currentPath }){
                res.end("OnFile")
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
                }

                res.end(util.buildResObject(responceData))
            },
            onError(){
                res.end("OnError")
            }
        })
    }).listen(port)

    console.log(`✔ Editor created at ❤ http://localhost:${port}`)
}

module.exports = API