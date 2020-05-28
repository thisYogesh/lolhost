const { logger, printBox, color, colorType, effect } = require('./print')

function logInfo({ port1, port2, name, version }){
  return ['',{
      values: [
          '    ',
          {
              value: '\u2764 ',
              options: {
                  type: colorType.fg,
                  color1: color.red,
                  effect: effect.bold
              }
          },
          {
              value: `${name} (${version})`,
              options: {
                  type: colorType.fg,
                  color1: color.blue,
                  effect: effect.bold
              }
          }
      ],
  },'' ,{
      values: [
          '    ',
          {
              value: '\u2714 ',
              options: {
                  type: colorType.fg,
                  color1: color.green,
                  effect: effect.bold
              }
          },
          'Server is live at ',
          {
              value: `http://localhost:${port1}`,
              options: {
                  type: colorType.fg,
                  color1: color.cyan,
                  effect: effect.underline
              }
          },
          '    ',
      ]
  },{
      values: [
          '    ',
          {
              value: '\u2714 ',
              options: {
                  type: colorType.fg,
                  color1: color.green,
                  effect: effect.bold
              }
          },
          'Editor is live at ',
          {
              value: `http://localhost:${port2}`,
              options: {
                  type: colorType.fg,
                  color1: color.cyan,
                  effect: effect.underline
              }
          },
          '    ',
      ]
  }, '']
}

function logFileUpdate(){
  return [{
    values: [{
      value: '\u2714 ',
      options: {
        type: colorType.fg,
        color1: color.green,
        effect: effect.bold
      }
    },
    'File updated successfully!'
    ]
  }]
}

module.exports = {
  logInfo({port1, port2, name, version}){
    const info = printBox(logInfo({port1, port2, name, version}))
    console.log(info)
  },

  logFileUpdate(filename, filepath = '', isUpdated = true){
    let icon, message, colorCode;

    if(isUpdated){
      icon = '\u2714'
      message = 'File updated successfully!'
      colorCode = color.green
    }else{
      icon = '\u2718'
      message = 'Unable to update file!'
      colorCode = color.red
    }

    const info = logger
      .value(`${icon} `)
      .color(colorType.fg, colorCode)
      .value(`(${filename}) `)
      .color(colorType.fg, color.yellow)
      .value(`${message}`)
      .color(colorType.fg, color.cyan)
      .return()

    const path = logger
      .value(`\u279C ${filepath}\n`)
      .effect(effect.dim)
      .return()

    console.log(info)
    console.log(path)
  }
}