const QcloudSms = require('qcloudsms_js')
const { ThirdPartyError } = require('../exceptions')


/**
 * Tencent SMS Client
 * @class
 */
class SMS {
  /**
     * 
     * @see APK https://github.com/qcloudsms/qcloudsms_js
     * @see 模板id https://console.cloud.tencent.com/sms/smsContent/1400132013/1/10
     */
  constructor (appid, appkey, sign) {
    this.sign = sign
    this.qcloudsms = QcloudSms(appid, appkey)
  }
  /**
     * 发送单条短信
     * @see 文档 https://cloud.tencent.com/document/product/382/5976
     * 
     * @param {String} country_code  城市代码
     * @param {String} phone 电话号码
     * @param {*} template_id 模板 id
     * @param {*} params 模板对应的参数
     */
  async sendSingleSms (country_code, phone, template_id, params) {
    const ssender = this.qcloudsms.SmsSingleSender()
    return new Promise((resolve, reject) => {
      ssender.sendWithParam(country_code, phone, template_id, params, this.sign, '', '', function (err, res, resData) {
        if (err) {
          throw new ThirdPartyError('短信发送错误', err)
        } else {
          resolve(resData)
        }
      })
    })
  }

  /**
     * 发送多条短信
     * @see 文档 https://cloud.tencent.com/document/product/382/5977
     * 
     * @param {String} country_code  城市代码
     * @param {[String]} phones 电话号码列表
     * @param {Number} template_id 模板 id
     * @param {[String]} params 模板对应的参数
     */
  async sendMultiSms (country_code, phones, template_id, params) {
    var msender = this.qcloudsms.SmsMultiSender()
    return new Promise((resolve, reject) => {
      msender.sendWithParam(country_code, phones, template_id,
        params, this.sign, '', '',
        function (err, res, resData) {
          if (err) {
            throw new ThirdPartyError('短信发送错误', err)
          } else {
            resolve(resData)
          }
        })
    })
  }
}

module.exports = SMS
