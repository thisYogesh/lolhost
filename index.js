const style = `
    <style>
        table { border-collapse: collapse; border: 1px solid;}
        th, td {
            border: 1px solid;
        }

        .error {
            font-weight: lighter;
        }

        .error b {}
    </style>
`
const http = require('http');
const util = require('./util');
const fs = require('fs')

function server(port = 8000){
    http.createServer(function(req, res){
        const url = util.decodeURL(req.url)
        const dirname = __dirname.replace(/\\/g, '/').replace(`/node_modules/${util.package.name}`);
        const rootDirName = util.getRootDirName(dirname) + url
        const currentPath = decodeURIComponent(util.getCurrentPath(url))
        const pathWithDir = dirname + currentPath
        const infoHeaders = ['Filename', 'Type', 'Created', 'Size']
        let fileinfo = [util.createTableRowColumn(infoHeaders, 'th', null)];

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
                            const pathAnchor = `<a href='${href}'>${pathName}</a>`
                            const dateTime = util.getDateTime(stat.birthtime)
                            const size = util.getSize(stat.size)
                            const statInfo = util.createTableRowColumn([pathAnchor, type, dateTime, size], 'td', null)
                            fileinfo.push(statInfo)
                        })
                        fileinfo = util.createTableRowColumn(fileinfo, 'tr', 'table')
                        
                        res.write(`<head>${style}</head>`);
                        res.write(`<h3>${rootDirName}</h3>`);
                        res.end(`${fileinfo}`)
                    }else{
                        res.write(`<head>${style}</head>`);
                        res.end('');
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
                        res.end(content);
                    }else{
                        res.end(`Unable to read ${currentPath}`);
                    }
                })
            }
        }catch(e){
            res.writeHead(404, 'File not found!');
            res.write(`<head>${style}</head>`);
            res.end(`<h2 class='error --404'><b>404</b> ${currentPath} Path does not exist!</h2>` );
        }
    }).listen(port)
    console.log(`server created at http://localhost:${port}`)
}

module.exports = server