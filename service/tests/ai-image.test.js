'use strict';

const { AIImage } = require('..');
const { tencent_cloud } = require('../../config');
const aiImage = new AIImage(tencent_cloud.appid, tencent_cloud.SecretId, tencent_cloud.SecretKey);


describe('万象优图', () => {
  test('检测图片违规程度', async done => {
    const result = await aiImage.detectPorn('https://sqimg.qq.com/qq_product_operations/im/qqlogo/imlogo_b.png');
    expect(result).toHaveProperty('result');
    expect(result).toHaveProperty('confidence');
    expect(result).toHaveProperty('normal_score');
    expect(result).toHaveProperty('hot_score');
    expect(result).toHaveProperty('porn_score');
    expect(result).toHaveProperty('forbid_status');
    done();
  });
});
