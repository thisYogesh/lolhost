const { http, util, fs, main } = require('./js/modules')()
const lolitor = require('./api')
const config = util.getConfig(__dirname, fs);

function server(port1 = 8000, port2 = 8001){
    http.createServer(function(req, res){
        const infoHeaders = ['Filename', 'Type', 'Created', 'Size']
        let dirInfo = [util.createWrapper(infoHeaders, 'th', null)];

        res.setHeader('content-type', 'text/html');

        main({
            req,
            res,
            dirname: __dirname
        },{
            onFile(err, content, { currentPath }){
                if(!err){
                    util.setContentType(res, currentPath)
                    util.response(res, content, true)
                }else{
                    util.response(res, `Unable to read ${currentPath}`)
                }
            },
            onDir(err, list, { rootDirName, currentPath, pathWithDir }){
                if(!config.dirListing){
                    const dirIndex = pathWithDir + '/' + config.dirIndex
                    fs.readFile(dirIndex, null, function(err, content){
                        if(err){
                            util.throwError(res, {
                                code: 403.13,
                                message: 'Forbidden directory!'
                            })
                        }else{
                            util.setContentType(res, dirIndex)
                            util.response(res, content, true)
                        }
                    })
                    return;
                }

                if(!err){
                    list.forEach(path => {
                        const fileInfo = util.getFileInfo(fs, pathWithDir, path, currentPath)
                        const stat = fileInfo.stat
                        const type = fileInfo.isDirectory ? 'Folder' : 'File'
                        const title = fileInfo.title
                        const pathName = fileInfo.isDirectory ? `${title}/` : title
                        const hiddenClass = fileInfo.isHidden ? '--hidden' : ''
                        const pathAnchor = `<a class='path-name ${hiddenClass}' title='${title}' href='${fileInfo.href}'>${pathName}</a>`
                        const dateTime = util.getDateTime(stat.birthtime)
                        const size = util.getSize(stat.size)
                        const statInfo = util.createWrapper([pathAnchor, type, dateTime, size], 'td', null)
                        dirInfo.push(statInfo)
                    })
                    
                    const breadcrumb = util.createNav(rootDirName);

                    if(!list.length){
                        dirInfo.push(util.createWrapper(['This Folder is empty!'], `td(colspan=${infoHeaders.length})(align=center)`, 'tr'))
                    }

                    dirInfo = util.createWrapper(dirInfo, 'tr', 'table(class=theme1)')
                    util.response(res, `${breadcrumb}<section>${dirInfo}</section>`)
                }else{
                    util.response(res)
                }
            },
            onError(){
                util.throwError(res, {
                    code: 404,
                    message: 'Path does not exist!'
                });
            }
        })
    }).listen(port1)
    
    lolitor(port2)
    console.log(`✔︎ Server created at ❤ http://localhost:${port1}`)
}

module.exports = server