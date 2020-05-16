const { effect, color, colorType, valueType } = require('./enums')
const { frame, reset, fgCodes, bgCodes, effectCodes } = require('./unicodes')

const log = {
    value(v){
        this.end()
        this._value = v
        return this
    },
    effect(code){
        if(code !== undefined) this._value = this.setEffect(code) + this._value
        return this
    },
    color(ctype, colorCode1, colorCode2){
        let value = ''
        switch(ctype){
            case colorType.fg:
                value = this.forground(colorCode1)
                break;
            
            case colorType.bg:
                value = this.background(colorCode1)
                break;

            case colorType.fb:
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
    return charMultiplier(len, frame.hl)
}

function getSpace(len){
    return charMultiplier(len, ' ')
}

function buildContent(lines, maxLen){
    return lines.reduce(function(newlines, lineItem){
        const lineType = typeof lineItem === 'string' ? 1 : 0
        const value = lineType === valueType.Object ? lineItem.value : lineItem
        const diff = lineType === valueType.Object ? lineItem.diff : 0
        const space = getSpace(maxLen - value.length + diff)
        newlines.push(log
            .value(`${frame.vl}`)
            .color(colorType.fg, color.green)
            .value(value)
            .color(colorType.fg, color.white)
            .value(`${space}${frame.vl}\n`)
            .color(colorType.fg, color.green)
            .return()
        )
        return newlines
    }, [])
}

function formatLine(value, options){
    if(options){
        value = log
        .value(value)
        .effect(options.effect)
        .color(options.type, options.color1, options.color2)
        .return()
    }
    return value
}

function combineValues(values){
    let val = ''
    if(Array.isArray(values)){
        values.forEach(function(item){
            val += (item.value || item)
        })
    }else{
        val = values
    }

    return val
}

function buildupLines(line, maxLen, dataset){
    const lineType = typeof line === 'string' ? 1 : 0
    const lineValue = lineType === valueType.Object ? combineValues(line.value || line.values) : line
    const lines = lineValue.split('\n')

    lines.forEach((lineItem, i) => {
        const len = lineItem.length
        if(len > maxLen) maxLen = len

        if(lineType === valueType.Object){
            let formattedValue = ''

            if(line.value){
                formattedValue = formatLine(lineItem, line.options)
            }else{
                formattedValue = line.values.reduce(function(fvalues, lineWord){
                    fvalues += formatLine((lineWord.value || lineWord), lineWord.options)
                    return fvalues
                }, '')
            }

            lines[i] = {
                value: formattedValue,
                diff: formattedValue.length - len
            }
        }
    })

    dataset.push.apply(dataset, lines)

    return maxLen
}

function getBoxData(lines){
    const dataset = []
    let maxLen = 0
    if(Array.isArray(lines)){
        lines.forEach(function(line){
            maxLen = buildupLines(line, maxLen, dataset)
        })
    }else{
        maxLen = buildupLines(lines, maxLen, dataset)
    }

    return {
        lines: dataset, maxLen
    }
}

function printBox(text){
    const data = getBoxData(text)
    const HL = getHL(data.maxLen)
    const header = log
        .value(`${frame.lt}${HL}${frame.rt}\n`)
        .color(colorType.fg, color.green)
        .return()

    const content = buildContent(data.lines, data.maxLen)

    const footer = log
        .value(`${frame.lb}${HL}${frame.rb}`)
        .color(colorType.fg, color.green)
        .return()

    return header + content.join('') + footer;
}

module.exports = {
    printBox,
    colorType,
    color,
    effect
}