const { http, main, fs, util } = require("./modules")();
const { Method } = require("./enums");
const unsuportedMsg = "This file has an unsuported text encoding";
const indexHtml = require("./lolitor.html.js");

function API(port = 8000) {
  http
    .createServer(function(req, res) {
      const method = req.method;
      const contentType = method === Method.GET ? "text/html" : "application/json";

      res.setHeader("content-type", contentType);
      main({
          method,
          req,
          res,
          dirname: __dirname
        }, {
          interceptor({ isAppURL, pathWithDir, currentPath }) {
            if (method === Method.GET) {
              if (isAppURL) {
                fs.readFile(pathWithDir, null, function(err, content) {
                  if (!err) {
                    util.setContentType(res, currentPath);
                    res.end(content);
                    return;
                  }
                  res.end("");
                });
              } else if (currentPath) {
                util.redirect(res, `http://${req.headers.host}/`);
                return;
              } else {
                const pathSplit = pathWithDir.split(/\/|\\/);
                const rootFolderName = pathSplit[pathSplit.length - 1];
                const html = indexHtml(rootFolderName);
                res.end(html);
              }
            } else {
              return true;
            }
          },

          onPut(content, { pathWithDir }){
            fs.writeFile({
              path: pathWithDir
            }, content, function(err){
              if(!err){
                res.end(JSON.stringify({ update: true }))
                return;
              }

              // coule be "permission access" issue
              res.end(JSON.stringify({ update: false }))
            })
          },

          onFile(err, content, { encoding, currentPath }) {
            if (!err) {
              const contentType = util.getContentType(currentPath)
              const isImage = util.isImageType(contentType)
              let isSupported, data;
              if(!isImage){
                isSupported = util.isSupported(encoding);
                data = isSupported ? content.toString() : unsuportedMsg;
              }else{
                data = `data:${contentType};base64,${content.toString('base64')}`;
                isSupported = true;
              }
              
              res.end(util.buildResObject(data, isSupported, isImage));
            } else {
              res.writeHead(404);
              res.end(util.buildResObject("404", false));
            }
          },

          onDir(err, list, { currentPath, pathWithDir }) {
            let responceData;
            if (!err) {
              const fileList = [];
              list.forEach(function(path) {
                const fileInfo = util.getFileInfo(
                  fs,
                  pathWithDir,
                  path,
                  currentPath
                );
                delete fileInfo.stat;
                fileList.push(fileInfo);
              });
              responceData = fileList;
            } else {
              responceData = false;
              res.writeHead(404);
            }

            res.end(util.buildResObject(responceData));
          },

          onError() {
            res.writeHead(404);
            res.end(util.buildResObject(false));
          }
        }
      );
    })
    .listen(port);
}

module.exports = API;