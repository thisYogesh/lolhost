const util = require("./util");
const fs = require("./fs");
const { Method } = require("../js/enums")

module.exports = function(
  { method, req, res, dirname },
  { interceptor, onPut, onFile, onDir, onError }
) {
  try {
    const pathInfo = util.getPathInfo({
      url: req.url,
      dirname: dirname
    });

    
    if (typeof interceptor === "function") {
      if (!interceptor(pathInfo)) return;
    }
    
    if(method === Method.PUT){
      let content = ''
      req.on('data', data => {
        content += data.toString()
      })

      req.on('end', () => {
        onPut && onPut(content, pathInfo)
      })

      return;
    }

    fs.fetch(
      {
        path: pathInfo.pathWithDir,
        encode: null
      }, {
        onFile(err, content, encoding) {
          onFile && onFile(err, content, { ...pathInfo, encoding });
        },

        onDir(err, list) {
          onDir && onDir(err, list, pathInfo);
        },

        onError
      }
    );
  } catch (e) {
    util.throwError(res, {
      code: 404,
      message: "Path does not exist!"
    });
  }
};