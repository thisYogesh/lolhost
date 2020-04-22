const dotenv = require('dotenv');
dotenv.config();
const PORT = process.env.PORT_NUMBER
const SERVER = require('./server')
SERVER(PORT)