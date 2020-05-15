const lt = '\u256D'
const rt = '\u256E'
const lb = '\u2570'
const rb = '\u256F'
const hl = '\u2500'
const vl = '\u2502'
const reset = "\x1b[0m";

const effect = {
    bright : 0,
    dim : 1,
    underscore : 2,
    blink : 3,
    reverse : 4,
    hidden : 5
}

/**
 * Color enum
 */

const color = {
    black : 0,
    red : 1,
    green : 2,
    yellow : 3,
    blue : 4,
    magenta : 5,
    cyan : 6,
    white : 7,
}

const type = {
    fg: 1,
    bg: 2,
    fb: 3
}

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

const log = {
    value(v){
        this.end()
        this._value = v
        return this
    },
    effect(code){
        this._value = this.setEffect(code) + this._value
        return this
    },
    color(ctype, colorCode1, colorCode2){
        let value = ''
        switch(ctype){
            case type.fg:
                value = this.forground(colorCode1)
                break;
            
            case type.bg:
                value = this.background(colorCode1)
                break;

            case type.fb:
                value = this.forground(colorCode1)
                value += this.background(colorCode2)
                break;
        }
        this._value = value + this._value
        return this
    },
    forground(code){
        return fgCodes[code]
    },
    background(code){
        return bgCodes[code]
    },
    setEffect(code){
        return effectCodes[code]
    },
    end(){
        this.stack = this.stack || []
        if(this._value){
            this.stack.push(this._value += reset)
            this._value = ''
        }
        // return this
    },

    return(){
        this.end()
        this._value = ''
        const value = this.stack.join('')
        this.stack.length = 0
        return value
    }
}

function charMultiplier(len, char){
    let val = ''
    for(let i=0; i<len; i++){
        val += char
    }

    return val
}

function getHL(len){
    return charMultiplier(len, hl)
}

function getSpace(len){
    return charMultiplier(len, ' ')
}

function buildContent(lines, maxLen){
    return lines.reduce(function(newlines, text){
        const space = getSpace(maxLen - text.length)
        newlines.push(log
            .value(`${vl}`)
            .color(type.fg, color.green)
            .value(text)
            .color(type.fg, color.white)
            .value(`${space}${vl}\n`)
            .color(type.fg, color.green)
            .return()
        )
        return newlines
    }, [])
}

function getBoxData(text){
    const lines = text.split('\n')
    let maxLen = 0
    lines.forEach(line => {
        const len = line.length
        if(len > maxLen){
            maxLen = len
        }
    })

    return {
        lines,
        maxLen
    }
}

function printBox(text){
    const data = getBoxData(text)
    const HL = getHL(data.maxLen)
    const header = log
        .value(`${lt}${HL}${rt}\n`)
        .color(type.fg, color.green)
        .return()

    const content = buildContent(data.lines, data.maxLen)

    const footer = log
        .value(`${lb}${HL}${rb}`)
        .color(type.fg, color.green)
        .return()

    return header + content.join('') + footer;
}

console.log(printBox(`  Server is live at http://localhost:8000\n  Editor is live at http://localhost:8001  `))

module.exports = printBox