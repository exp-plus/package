const { ImageClient } = require('image-node-sdk')
const { ServiceError } = require('../global').Errors


/**
 * ai image
 * @class
 */
class AIImage {
  constructor (appId, SecretId, SecretKey) {
    this.client = new ImageClient({
      AppId: appId,
      SecretId: SecretId,
      SecretKey: SecretKey
    })
  }
  /**
   * 
   * 检测图片违规程度
   * @see https://cloud.tencent.com/document/product/864/17609
   * @return {{result:Int,confidence:Double,normal_score:Double,hot_score:Double,porn_score:porn_score,forbid_status:Int}} 结果
   */
  async detectPorn (imgUrl) {
    try {
      const { body } = await this.client.imgPornDetect({
        data: {
          url_list: [imgUrl]
        }
      })
      const { result_list } = JSON.parse(body)
      if (!(result_list instanceof Array) || result_list.length !== 1) {
        throw ServiceError.aiImageError(`返回结果不为数据，且长度不为1${body}`)
      }
      return result_list[0].data
    } catch (error) {
      throw ServiceError.aiImageError(error)
    }
  }
}


module.exports = AIImage
