'use strict';

const COSObj = require('cos-nodejs-sdk-v5');
const { ThirdPartyError } = require('../exception');
const STS = require('qcloud-cos-sts');

/**
 * cos
 * @class
 */
class COS {
  constructor(SecretId, SecretKey, appId) {
    this.SecretId = SecretId;
    this.SecretKey = SecretKey;
    this.appId = appId;
    this.cos = new COSObj({ SecretId, SecretKey });
  }

  /**
   * 将文件放置到存储桶中
   * @see https://cloud.tencent.com/document/product/436/14690
   *
   * @param {Object} object 一个 COS 对象
   * @return {String} 对象的获取路径
   */
  async putObject(object) {
    return new Promise((resolve, reject) => {
      this.cos.putObject(object, (err, data) => {
        if (err) {
          reject(new ThirdPartyError('对象存储出错', { err, data }));
        } else {
          resolve(object.Host + object.Key);
        }
      });
    });
  }

  /**
     * 生成临时密钥，用于前端直传
     * @see https://cloud.tencent.com/document/product/436/9067 Web 端直传实践
     * @see https://github.com/tencentyun/cos-wx-sdk-v5 小程序端直传
     *
     * @param {String} region 对象存储桶所在的位置
     * @param {String} bucket bucket 的全称
     * @param {Array} allowActions 允许的 actions，具体参考 https://cloud.tencent.com/document/product/436/31923
     * @param {Array<String>} allowPrefixs 允许的存储桶内的前缀，如 images/*
     * @param {Number} durationSeconds 临时密钥有效时间，按秒计算
     *
     * @return {{credentials:{sessionToken:String,tmpSecretId:String,tmpSecretKey:String},expiredTime:Date,startTime:Date}} 临时密钥集合
     */
  async generateTemporaryKey(region, bucket, allowActions, allowPrefixs, durationSeconds) {
    const ShortBucketName = bucket.substr(0, bucket.lastIndexOf('-'));
    return new Promise((resolve, reject) => {
      STS.getCredential({
        secretId: this.SecretId,
        secretKey: this.SecretKey,
        durationSeconds,
        policy: {
          version: '2.0',
          statement: [{
            action: allowActions,
            effect: 'allow',
            principal: { qcs: [ '*' ] },
            resource: allowPrefixs.map(allowPrefix => `qcs::cos:${region}:uid/${this.appId}:prefix//${this.appId}/${ShortBucketName}/${allowPrefix}`),
          }],
        },
      }, (err, tmpKeys) => {
        if (err) {
          reject(new ThirdPartyError('对象存储临时密钥生成错误', { args: arguments, err }));
        } else {
          resolve(tmpKeys);
        }
      });
    });
  }
}

module.exports = COS;
