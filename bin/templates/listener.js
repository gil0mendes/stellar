exports.render = data => `
'use strict'

exports.default = {
  event: '${data.name}',
  description: 'This was automatically generated',

  run (api, params, next) {
    // TODO - implement the listener behaviour

    // finish the event execution
    next()
  }
}
`
