const { util } = require("./modules")();
const { logInfo } = require('./log')
const lolhost = require('./lolhost')
const lolitor = require('./lolitor')

module.exports = function(port1 = 8000, port2 = 8001){
  // initiate apps
  lolhost(port1) // static server
  lolitor(port2) // code editor

  // print app server info
  logInfo({ port1, port2, name: util.package.name, version: util.package.version })
}