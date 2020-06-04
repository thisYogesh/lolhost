const { logger, printBox, color, colorType, effect } = require('./print')
const icon = {
  success: '\u2714',
  fail: '\u2718'
}

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

  logFileUpdate({name, path = '', isFile = false, isUpdated = false, isCreated = false, isRenamed = false}){
    let statusIcon, message, colorCode;

    if(isFile && isUpdated){
      statusIcon = icon.success
      message = 'File updated successfully!'
      colorCode = color.green
    }else if(isFile && isCreated){
      statusIcon = icon.success
      message = 'File created successfully!'
      colorCode = color.green
    }else if(isFile && isRenamed){
      statusIcon = icon.success
      message = 'File renamed successfully!'
      colorCode = color.green
    }else if(!isFile && isCreated){
      statusIcon = icon.success
      message = 'Folder created successfully!'
      colorCode = color.green
    }else if(!isFile && !isCreated){
      statusIcon = icon.fail
      message = 'Unable to create folder!'
      colorCode = color.red
    }else{
      statusIcon = icon.fail
      message = 'Unable to update file!'
      colorCode = color.red
    }

    const info = logger
      .value(`${statusIcon} `)
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