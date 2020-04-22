const dotenv = require('dotenv');
dotenv.config();
const PORT = process.env.PORT_NUMBER || 8000
const SERVER = require('./server')
SERVER(PORT)