'use strict';

const crypto = require('crypto');
const axios = require('axios');
const sharp = require('sharp');
const sha1 = require('sha1');
const { BadRequest, TooManyRequest, ThirdPartyError, InternalServerError } = require('@exp-plus/exception');
/**
 * Wechat Mini Program
 * @class
 */
class WechatMiniProgram {
  constructor(appid, secret) {
    this.appid = appid;
    this.secret = secret;
  }
  /**
   * 获取小程序全局唯一后台接口调用凭据（access_token），并放至至 redis，设定1.75小时自动刷新
   * @see https://developers.weixin.qq.com/miniprogram/dev/api/getAccessToken.html
   */
  async getAccessToken() {
    try {
      const { data } = await axios.get(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.appid}&secret=${this.secret}`);
      const { access_token } = data;
      return access_token;
    } catch (error) {
      throw new ThirdPartyError('获取小程序后台 access token 失败', error);
    }
  }
  /**
   * 通过 wx.login() 接口获得临时登录凭证 code 后传到开发者服务器调用此接口完成登录流程
   * @see https://developers.weixin.qq.com/miniprogram/dev/api/code2Session.html
   *
   * @param {String} code 临时登录凭证
   */
  async code2session(code) {
    try {
      const res = await axios.post(`https://api.weixin.qq.com/sns/jscode2session?appid=${this.appid}&secret=${this.secret}&js_code=${code}&grant_type=authorization_code`);

      const { data } = res;
      const { errcode, errmsg } = data;
      if (!errcode) return data;

      switch (parseInt(errcode)) {
        case -1: throw new ThirdPartyError('系统繁忙，此时请开发者稍候再试', null);
        case 45011: throw new ThirdPartyError('频率限制，每个用户每分钟100次');
        case 40029: throw new BadRequest('Code 无效', code);
        default: throw new InternalServerError('微信文档未更新', { errcode, errmsg });
      }
    } catch (error) {
      throw new ThirdPartyError('小程序临时登录凭证', error);
    }
  }
  /**
   * 对微信数据服务器传来的密文通过 sessionKey 进行再签名
   * @see https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/signature.html
   *
   * @param {String} ciphertext 已签名密文
   * @param {String} session_key 绘画密钥
   */
  signOpenData(ciphertext, session_key) {
    return sha1(ciphertext + session_key);
  }
  /**
   * 接口如果涉及敏感数据（如wx.getUserInfo当中的 openId 和 unionId），接口的明文内容将不包含这些敏感数据。开发者如需要获取敏感数据，需要对接口返回的加密数据(encryptedData) 进行对称解密。
   * @see https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/signature.html
   *
   * @param {String} encryptedData 已签名密文
   * @param {String} iv 对称解密算法初始向量，由初始数据接口返回
   * @param {String} session_key 会话密钥
   */
  decryptOpenData(encryptedData, iv, session_key) {
    try {
      const sessionKey = Buffer.from(session_key, 'base64');
      encryptedData = Buffer.from(encryptedData, 'base64');
      iv = Buffer.from(iv, 'base64');
      let decoded;
      try {
        // 解密
        const decipher = crypto.createDecipheriv('aes-128-cbc', sessionKey, iv);
        // 设置自动 padding 为 true，删除填充补位
        decipher.setAutoPadding(true);
        decoded = decipher.update(encryptedData, 'binary', 'utf8');
        decoded += decipher.final('utf8');

        decoded = JSON.parse(decoded);
      } catch (err) {
        throw new BadRequest('buffer 有误');
      }

      if (decoded.watermark.appid !== this.appId) {
        throw new BadRequest('appid不匹配', decoded);
      }

      return decoded;
    } catch (error) {
      throw new ThirdPartyError('解密公开数据', error);
    }
  }
  /**
   * 发送模板消息
   * @see https://developers.weixin.qq.com/miniprogram/dev/api/sendTemplateMessage.html
   *
   * @param {Object} param                  参数
   * @param {String} param.access_token     接口调用凭证 https://developers.weixin.qq.com/miniprogram/dev/api/getAccessToken.html
   * @param {String} param.touser           接收者（用户）的 openid
   * @param {String} param.template_id      所需下发的模板消息的id
   * @param {String} param.page             点击模板卡片后的跳转页面，仅限本小程序内的页面。支持带参数,（示例index?foo=bar）。该字段不填则模板无跳转。
   * @param {String} param.form_id          表单提交场景下，为 submit 事件带上的 formId；支付场景下，为本次支付的 prepay_id
   * @param {Object} param.data             模板内容
   * @param {String} param.emphasis_keyword 模板需要放大的关键词，不填则默认无放大
   * @return {Boolean} 操作是否成功
   */
  async sendTemplateMessage({ access_token,
    touser,
    template_id,
    page,
    form_id,
    data,
    emphasis_keyword = '' }) {
    const res = await axios.post(`https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=${access_token}`, {
      touser,
      template_id,
      page,
      form_id,
      data,
      emphasis_keyword,
    });
    const { errcode, errmsg } = res.data;
    switch (parseInt(errcode)) {
      case 0: return;
      case 40001: throw new ThirdPartyError('发送模板消息 access_token 无效', access_token);
      case 40003: throw new ThirdPartyError('用户 openid 无效', touser);
      case 40037:
      case 41028:
      case 41029:
      case 41030:
      case 45009:
        throw new InternalServerError('模板消息出错', { errcode, errmsg });
      default:
        throw new ThirdPartyError('微信文档未更新', { errcode, errmsg });
    }
  }
  /**
   * 无限制生成小程序二维码，并可更换中间图像
   * @see https://developers.weixin.qq.com/miniprogram/dev/api/getWXACodeUnlimit.html
   * @param {Object} param 参数对象
   * @param {String} param.access_token 接口调用凭证 https://developers.weixin.qq.com/miniprogram/dev/api/getAccessToken.html
   * @param {String} param.scene 不能为空，场景值，用于扫码后页面跳转
   * @param {String} param.is_hyaline 是否需要透明底色，为 true 时，生成透明底色的小程序
   * @param {String} param.center_image_url 放置于中心的可覆盖图片 url
   */
  async generateMiniProgramQRCode({ access_token,
    scene,
    is_hyaline,
    center_image_url }) {
    // scene 长度不能为 0
    let formattedscene = scene;
    if (!scene || scene.length === 0) { formattedscene = '0'; }

    // 获取原生小程序码
    let { data } = await axios.post(`https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${access_token}`, {
      scene: formattedscene,
      // page,  必须是已经发布的小程序存在的页面（否则报错），例如 pages/index/index, 根路径前不要填加 /,不能携带参数（参数请放在scene字段里），如果不填写这个字段，默认跳主页面
      width: 430,
      auto_color: false, // 自动配置线条颜色，如果颜色依然是黑色，则说明不建议配置主色调，默认 false
      line_color: { // auto_color 为 false 时生效，使用 rgb 设置颜色 例如 {"r":"xxx","g":"xxx","b":"xxx"} 十进制表示
        r: 0,
        g: 0,
        b: 0,
      },
      is_hyaline: is_hyaline === true,
    }, {
      responseType: 'arraybuffer',
    });

    /**
     * 返回错误码时，抛出错误码
     */
    let text;
    try {
      text = JSON.parse(data.toString('utf8'));
    } catch (error) {
      throw new ThirdPartyError('小程序码 res 无法转换为JSON', error);
    }
    if (text && text.errcode) {
      const { errcode, errmsg } = text;
      switch (parseInt(errcode)) {
        case 40001: throw new InternalServerError('小程序 access_token 出错', access_token);
        case 45009: throw new TooManyRequest('调用分钟频率受限(目前5000次/分钟，会调整)', { errcode, errmsg });
        case 40003: throw new InternalServerError('所传page页面不存在，或者小程序没有发布', {
          formattedscene, errcode, errmsg,
        });
        default: throw new ThirdPartyError('小程序生成二维码文档未更新', { errcode, errmsg });
      }
    }

    // 覆盖图片
    if (center_image_url) {
      let { data: center_image } = await axios.get(center_image_url, {
        responseType: 'arraybuffer',
      });

      const roundedCorners = Buffer.from(
        '<svg><rect x="0" y="0" width="370" height="370" rx="185" ry="185"/></svg>'
      );
      center_image = await sharp(center_image).flatten({
        background: {
          r: 255,
          g: 255,
          b: 255,
        },
      }).resize(370, 370)
        .png()
        .composite([{
          input: roundedCorners,
          cutout: true,
        }])
        .toBuffer();
      data = sharp(data).resize(800, 800).png()
        .composite([{
          input: center_image,
          left: 215,
          top: 215,
        }]);
      if (is_hyaline) {
        data = data.png();
      } else {
        data = data.jpeg();
      }
    }
    data = await data.toBuffer();
    return data;
  }
  /**
   * 将开放数据转换为可读性更强的文字。
   * @see https://developers.weixin.qq.com/miniprogram/dev/api/wx.getUserInfo.html
   * @param {Number} num 性别对对应的数字
   * @return {String=[unknown,male,female]} 性别
   */
  openDataGenderConverter(num) {
    switch (num) {
      case 0:
        return 'UNKNOWN';
      case 1:
        return 'MALE';
      case 2:
        return 'FEMALE';
      default:
        return 'UNKNOWN';
    }
  }
  /**
   * @typedef {Object} UserData
   * @property {string} nickname 用户名
   * @property {string} avatar 头像url
   * @property {string} gender 性别
   * @property {string} city 城市
   * @property {string} province 省份
   * @property {string} country 城市
   * @property {string} language 语言
   * @property {number} phone 手机号码
   * @property {number} phone_country_code 号码所属国家
   */

  /**
   * 获取用户数据
   * @param {String} session_key 会话密钥
   * @param {String} rawData 原始数据
   * @param {String} signature 数据签名
   * @param {String} phone_iv 手机号码初始向量
   * @param {String} phone_encrypted_data 加密过后的手机号码
   * @return {UserData} 格式化后的用户数据
   *
   */
  getUserInfo(session_key, rawData, signature, phone_iv, phone_encrypted_data) {
    if (this.signOpenData(rawData, session_key) !== signature) {
      throw new BadRequest('会话密钥与签名不匹配', {
        session_key, rawData, signature,
      });
    }

    const userData = JSON.parse(rawData);

    const formattedData = {
      nickname: userData.nickName,
      avatar: userData.avatarUrl,
      gender: this.openDataGenderConverter(userData.gender),
      city: userData.city,
      province: userData.province,
      country: userData.country,
      language: userData.language,
    };

    // 更新电话号码
    if (phone_iv && phone_encrypted_data) {
      const phone_data = this.decryptOpenData(phone_encrypted_data, phone_iv, session_key);
      if (!phone_data) {
        throw new InternalServerError('手机号码获取出错', {
          phone_encrypted_data, phone_iv, session_key,
        });
      }

      const { purePhoneNumber, countryCode } = phone_data;
      formattedData.phone = purePhoneNumber;
      formattedData.phone_country_code = countryCode;
    }
    return formattedData;
  }
}
module.exports = WechatMiniProgram;
