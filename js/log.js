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

  logFileUpdate({name, path = '', isFile = false, isUpdated = false, isCreated = false}){
    let icon, message, colorCode;

    if(isFile && isUpdated){
      icon = '\u2714'
      message = 'File updated successfully!'
      colorCode = color.green
    }else if(isFile && isCreated){
      icon = '\u2714'
      message = 'File created successfully!'
      colorCode = color.green
    }else if(!isFile && isCreated){
      icon = '\u2714'
      message = 'Folder created successfully!'
      colorCode = color.green
    }else{
      icon = '\u2718'
      message = 'Unable to update file!'
      colorCode = color.red
    }

    const info = logger
      .value(`${icon} `)
      .color(colorType.fg, colorCode)
      .value(`(${name}) `)
      .color(colorType.fg, color.yellow)
      .value(`${message}`)
      .color(colorType.fg, color.cyan)
      .return()

    const _path = logger
      .value(`\u279C ${path}\n`)
      .effect(effect.dim)
      .return()

    console.log(info)
    console.log(_path)
  }
}