#!/usr/bin/env node

const [,, ...argv] = process.argv
const port = argv[0] === '--port' ? argv[1] : 8000
require('./index')(port)