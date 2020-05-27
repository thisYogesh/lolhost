const { printBox, color, colorType, effect } = require('./print')

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

module.exports = function({port1, port2, name, version}){
  const info = printBox(logInfo({port1, port2, name, version}))
  console.log(info)
}