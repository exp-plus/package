const { authenticate } = require('..')
const { JsonWebToken } = require('../../utils')

describe('认证中间价', () => {
  test('缺少登录凭证', async (done) => {
    const jwt = new JsonWebToken('secret', '1h')
    const auth = authenticate(jwt, (result, req) => {
      req.test = result
      done()
    })

    await auth({
      get (field) {
        return null
      }
    },
    {},
    (error) => {
      expect(error.statusCode).toEqual(401)
      done()
    })
  })
  test('登录凭证格式有误', async (done) => {
    const jwt = new JsonWebToken('secret', '1h')
    const auth = authenticate(jwt, (result, req) => {
      req.test = result
      done()
    })

    await auth({
      get (field) {
        return 'Bearer2'
      }
    },
    {},
    (error) => {
      expect(error.statusCode).toEqual(401)
      done()
    })
  })
  test('登录凭证已过期', async (done) => {
    const jwt = new JsonWebToken('secret', '1s')
    const token = jwt.sign({ value: 'value' })
    const auth = authenticate(jwt, (result, req) => {
      req.test = result
      done()
    })

    setTimeout(async () => {
      await auth({
        get (field) {
          return 'Bearer ' + token
        }
      },
      {},
      (error) => {
        expect(error.statusCode).toEqual(401)
        done()
      })
    }, 1200)
  })
  test('头部有正确的 Authorization', async (done) => {
    const jwt = new JsonWebToken('secret', '1h')
    const key = jwt.sign({ value: 'value' })
    const auth = authenticate(jwt, (result, req) => {
      req.test = result
      done()
    })
    await auth({
      get (field) {
        if (field === 'Authorization') {
          return 'Bearer ' + key
        } else {
          return null
        }
      }
    },
    {},
    () => {})
  })
})
