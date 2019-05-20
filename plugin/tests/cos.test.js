'use strict';

const fs = require('fs');
const path = require('path');
const uuidv1 = require('uuid/v1');

const { tencent_cloud } = require('../../config');
const { COS } = require('..');
const cos = new COS(tencent_cloud.cos[0].SecretId, tencent_cloud.cos[0].SecretKey, tencent_cloud.appid);

describe('cos', () => {
  test('生成临时密钥', async done => {
    const keys = await cos.generateTemporaryKey(tencent_cloud.cos[0].Region, tencent_cloud.cos[0].Buckets[0].name, [ 'name/cos:PutObject' ], [ 'images/pack/*' ], 1000);
    expect(keys).toBeDefined();
    expect(keys.credentials).toBeDefined();
    expect(keys.expiredTime).toBeDefined();
    expect(keys.startTime).toBeDefined();
    done();
  });
  test('上传文件', async done => {
    const buffer = fs.readFileSync(path.join(__dirname, '..', '..', 'images', 'upload.png'));
    const obj = {
      Region: tencent_cloud.cos[0].Region,
      Bucket: tencent_cloud.cos[0].Buckets[0].name,
      Host: tencent_cloud.cos[0].Buckets[0].host,
      Key: 'tests/' + uuidv1(),
      Body: buffer,
      ContentLength: buffer.length,
    };
    const res = await cos.putObject(obj);
    expect(res).toEqual(obj.Host + obj.Key);
    done();
  });
});
