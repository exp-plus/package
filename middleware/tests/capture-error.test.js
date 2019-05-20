const { captureError } = require('..')

const { Unauthorized, InternalServerError } = require('../../exceptions')

describe('错误捕获', () => {
  test('客户端错误捕获', async (done) => {
    const error = new Unauthorized('客户端', {})
    await captureError((serverError) => {
      done()
    })(error, { req: '' }, {
      res: '',
      status (param) { return this },
      send (param) {
        done()
        return this
      }
    })
  })

  test('服务端错误捕获', async (done) => {
    const error = new InternalServerError('服务端错误', {})
    await captureError((serverError) => {
      done()
    })(error, { req: '' }, {
      res: '',
      status (param) { return this },
      send (param) { return this }
    })
  })

  test('未知错误捕获', async (done) => {
    const error = new InternalServerError('服务端错误', {})
    await captureError((serverError) => {
      done()
    })(error, { req: '' }, {
      res: '',
      status (param) { return this },
      send (param) { return this }
    })
  })
})
