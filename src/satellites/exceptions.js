import os from 'os'

class ExceptionsManager {
  /**
   * API reference.
   *
   * @type {null}
   */
  api = null;

  /**
   * Array with the exceptions reporters.
   *
   * @type {Array}
   */
  reporters = []

  constructor (api) {
    this.api = api

    // load default console handler
    this.reporters.push((err, type, name, objects, severity) => {
      let output = ''
      let lines = []
      let extraMessages = []

      if (type === 'loader') {
        extraMessages.push(`Failed to load ${objects.fullFilePath}\n`)
      } else if (type === 'action') {
        extraMessages.push(`Uncaught error from action: ${name}\n`)

        extraMessages.push('Connection details:')
        const relevantDetails = [ 'action', 'remoteIP', 'type', 'params', 'room' ]
        for (let detailName of relevantDetails) {
          if (
            objects.connection[ detailName ] !== null &&
            objects.connection[ detailName ] !== undefined &&
            typeof objects.connection[ detailName ] !== 'function'
          ) {
            extraMessages.push(`    ${detailName}: ${JSON.stringify(objects.connection[ detailName ])}`)
          }
        }

        // push an empty element to create a empty line
        extraMessages.push('')
      } else if (type === 'task') {
        extraMessages.push(`Uncaught error from task: ${name} on queue ${objects.queue} (worker #${objects.workerId})\n`)
        try {
          extraMessages.push('    arguments: ' + JSON.stringify(objects.task.args))
        } catch (e) {
          // ignore error
        }
      } else {
        extraMessages.push(`Error: ${err.message}\n`)
        extraMessages.push(`    Type: ${type}`)
        extraMessages.push(`    Name: ${name}`)
        extraMessages.push(`    Data: ${JSON.stringify(objects)}`)
      }

      // reduce the extra messages into a single string
      output += extraMessages.reduce((prev, item) => prev + `${item} \n`, '')

      // FIXME I think that this can be removed, but for now we keep it where in case to be needed
      // if there is one of the known core exceptions we need to add information
      // manually to inform the correct error information
      // if (err.name) { lines.push(`${err.name}: ${err.message}`) }

      // add the stack trace
      try {
        lines = lines.concat(err.stack.split(os.EOL))
      } catch (e) {
        lines = lines.concat(new Error(err).stack.split(os.EOL))
      }

      // reduce the lines array into a single string
      output += lines.reduce((prev, item) => prev + `${item}\n`, '')

      // print out the output message
      api.log(output, severity)
    })
  }

  /**
   * Execute reporters.
   *
   * @param err
   * @param type
   * @param name
   * @param objects
   * @param severity
   */
  report (err, type, name, objects, severity = 'error') {
    let self = this

    for (let i in self.reporters) {
      self.reporters[ i ](err, type, name, objects, severity)
    }
  }

  /**
   * Loader exception.
   *
   * @param fullFilePath
   * @param err
   */
  loader (fullFilePath, err) {
    let self = this
    let name = `loader ${fullFilePath}`
    self.report(err, 'loader', name, { fullFilePath: fullFilePath }, 'alert')
  }

  /**
   * Handler for action exceptions.
   *
   * @param err
   * @param data
   * @param next
   */
  action (err, data, next) {
    let self = this
    let simpleName

    // try get the action name. Sometimes this can be impossible so we use the
    // error message instead.
    try {
      simpleName = data.action
    } catch (e) {
      simpleName = err.message
    }

    // report the error
    self.report(err, 'action', simpleName, { connection: data.connection }, 'error')

    // remove already processed responses
    data.response = {}

    if (typeof next === 'function') { next() }
  }

  /**
   * Exception handler for tasks.
   *
   * @param error       Error object.
   * @param queue       Queue here the error occurs
   * @param task
   * @param workerId
   */
  task (error, queue, task, workerId) {
    let self = this

    let simpleName

    try {
      simpleName = task[ 'class' ]
    } catch (e) {
      simpleName = error.message
    }

    self.api.exceptionHandlers.report(error, 'task', `task:${simpleName}`, simpleName, {
      task: task,
      queue: queue,
      workerId: workerId
    }, self.api.config.tasks.workerLogging.failure)
  }
}

/**
 * Satellite definition.
 */
export default class {
  /**
   * Satellite load priority.
   *
   * @type {number}
   */
  loadPriority = 130

  /**
   * Satellite load function.
   *
   * @param api     API reference
   * @param next    Callback function
   */
  load (api, next) {
    // put the exception handlers available in all platform
    api.exceptionHandlers = new ExceptionsManager(api)

    // finish the satellite load
    next()
  }
}
