const util = require('./util');
const fs = require('./fs');
module.exports = function({req, res, dirname}, { onFile, onDir, onError }){
    try{
        const pathInfo = util.getPathInfo({
            url: req.url,
            dirname: dirname
        })

        fs.fetch({
            path: pathInfo.pathWithDir,
            encode: null,
        }, {
            onFile(err, content){
                onFile(err, content, pathInfo)
            },

            onDir(err, list){
                onDir(err, list, pathInfo)
            },

            onError
        })
    }catch(e){
        util.throwError(res, {
            code: 404,
            message: 'Path does not exist!'
        });
    }
}