const jwt = require('jsonwebtoken')

/**
 * json web token
 * @class
 */
class JsonWebToken {
  constructor (SECRET_KEY, EXPIRES_IN) {
    this.SECRET_KEY = SECRET_KEY
    this.EXPIRES_IN = EXPIRES_IN
    this.jwt = jwt
  }
  /**
   * 使用密钥对传入参数进行签名， 注意 expiredsIn 以毫秒为单位
   * @param {String | Object | Buffer} obj 待存储对象
   * @returns {String} 一个签名过的令牌
   */
  sign (obj) {
    return jwt.sign(obj, this.SECRET_KEY, {
      expiresIn: this.EXPIRES_IN
    })
  }

  /**
   * 对 Token 进行校验
   * @param {String} token
   * @returns {String | Object | Buffer} 存储的对象
   */
  verify (token) {
    return jwt.verify(token, this.SECRET_KEY)
  }
}

module.exports = JsonWebToken
