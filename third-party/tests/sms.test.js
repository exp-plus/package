const { SMS } = require('..')

const { tencent_cloud } = require('../../config')

const sms = new SMS(tencent_cloud.sms.appid, tencent_cloud.sms.appkey, tencent_cloud.sms.sign)

describe('短信通知', () => {
  test.skip('发送单条短信', async (done) => {
    await sms.sendSingleSms('86', '13632102314', tencent_cloud.sms.templates[0].template_id, ['参数1'])
    done()
  })
})
