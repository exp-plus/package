const jwt = require('jsonwebtoken')
const { Unauthorized, InternalServerError } = require('../exceptions')
const { ExpressAsyncCatch } = require('../utils')

/**
 * 对请求进行鉴权，并将鉴权后的结果与 req 进行处理
 * @param {JWT} JWT JsonWebToken实例
 * @param {function(req,result)} handleAuthenticateResult 对通过 JWT 验证过后的 req 与 result 的处理。
 */
function authenticate (JWT, handleAuthenticateResult) {
  return ExpressAsyncCatch(async (req, res, next) => {
    // 检查存在
    const authorization = req.get['Authorization'] || req.get('authorization')
    if (!authorization) throw new Unauthorized('缺少登录凭证', authorization)

    // 校验格式
    const [bearer, token] = authorization.split(' ')
    if (!bearer || token.length <= 0) throw new Unauthorized('登录凭证格式有误', authorization)

    try {
      const result = JWT.verify(token)
      /**
         * 结果与 req 进行处理
         */
      handleAuthenticateResult(req, result)
      next()
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError || error instanceof jwt.NotBeforeError) throw new Unauthorized('登录凭证已过期')
      if (error instanceof jwt.JsonWebTokenError) throw new Unauthorized('登录凭证无效', error)
      throw InternalServerError('认证未知错误', error)
    }
  })
}


module.exports = authenticate
