const Joi = require('@hapi/joi')
const { BadRequest } = require('../exceptions')
const { ExpressAsyncCatch } = require('../utils')
/**
 * 参数校验
 * @see https://github.com/hapijs/joi
 * @param {String=[header,body,query]} requestField 待验证字段所在区域
 * @param {Object} shcema 标准模型
 * @param {Object} options
 */
function validate (requestField, schema) {
  return ExpressAsyncCatch(async (req, res, next) => {
    let validateResult = null
    if (requestField === 'header') {
      validateResult = Joi.validate(req.headers, schema)
    } else {
      validateResult = Joi.validate(req[requestField], schema)
      req[requestField] = validateResult.value
    }
    if (validateResult.error) {
      throw new BadRequest('参数有误', validateResult.value)
    }
    next()
  })
}

module.exports = validate
