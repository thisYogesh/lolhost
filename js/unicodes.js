const frame = {
    lt : '\u256D',
    rt : '\u256E',
    lb : '\u2570',
    rb : '\u256F',
    hl : '\u2500',
    vl : '\u2502',
}

const reset = "\x1b[0m";

const fgCodes = [
    "\x1b[30m",
    "\x1b[31m",
    "\x1b[32m",
    "\x1b[33m",
    "\x1b[34m",
    "\x1b[35m",
    "\x1b[36m",
    "\x1b[37m",
]
const bgCodes = [
    "\x1b[40m",
    "\x1b[41m",
    "\x1b[42m",
    "\x1b[43m",
    "\x1b[44m",
    "\x1b[45m",
    "\x1b[46m",
    "\x1b[47m",
]
const effectCodes = [
    "\x1b[1m",
    "\x1b[2m",
    "\x1b[4m",
    "\x1b[5m",
    "\x1b[7m",
    "\x1b[8m",
]

module.exports = {
    frame, reset, fgCodes, bgCodes, effectCodes
}