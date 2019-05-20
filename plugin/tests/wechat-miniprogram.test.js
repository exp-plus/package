const { WechatMiniprogram } = require('..')
const Config = require('../../config')
const miniprogram = new WechatMiniprogram(Config.wechat.miniprogram.appid, Config.wechat.miniprogram.secret)

let access_token = null
describe('微信小程序', () => {
  test('获取小程序 access_token', async (done) => {
    access_token = await miniprogram.getAccessToken()
    expect(access_token.length).toBeGreaterThan(10)
    done()
  })
  test('获取小程序码', async (done) => {
    const image = await miniprogram.generateMiniProgramQRCode({
      access_token,
      is_hyaline: true,
      center_image_url: 'https://sqimg.qq.com/qq_product_operations/im/qqlogo/imlogo_b.png'
    })
    expect(image).toBeDefined()
    done()
  })
  test('手动测试 code2session', done => done())
  test('手动测试 decryptOpenData', done => done())
  test('手动测试 sendTemplateMessage', done => done())
})
