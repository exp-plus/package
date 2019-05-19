module.exports = {
  wechat: {
    miniprogram: {
      appid: '',
      secret: ' '
    }
  },
  tencent_cloud: {
    // 全局的
    appid: ' ',
    SecretId: ' ',
    SecretKey: ' ',

    // 对象存储
    cos: [{
      SecretId: ' ',
      SecretKey: ' ',
      Region: ' ',
      Buckets: [{
        host: ' ',
        name: ' '
      }]
    }],
    // 短信服务
    sms: {
      appid: ' ',
      appkey: ' ',
      sign: ' ',
      templates: [
        {
          template_id: 1,
          name: '1',
          params: [' ']
        },
        {
          template_id: 2,
          name: '2',
          params: [' ']
        }
      ]
    }
  }
}

