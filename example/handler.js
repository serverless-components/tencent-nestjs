// require('tencent-component-monitor')
const fs = require('fs')
const path = require('path')
const { createServer, proxy } = require('tencent-serverless-http')

let server
const createApp = require('./dist/main')

exports.handler = async (event, context) => {
  const app = await createApp()
  // cache server, not create repeatly
  if (!server) {
    server = createServer(app, null, app.binaryTypes || [])
  }

  context.callbackWaitsForEmptyEventLoop =
    app.callbackWaitsForEmptyEventLoop === true ? true : false

  // provide sls intialize hooks
  if (app.slsInitialize && typeof app.slsInitialize === 'function') {
    await app.slsInitialize()
  }

  const result = await proxy(server, event, context, 'PROMISE')
  return result.promise
}
