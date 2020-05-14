module.exports = function(){
    const http = require('http');
    const util = require('./util');
    const fs = require('./fs');
    const main = require('./main');

    return {
        http, util, fs, main
    }
}