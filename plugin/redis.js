const Promise = require('bluebird')
const redis = Promise.promisifyAll(require('redis'))


class Redis {
  /**
   * @param {String} host 主机
   * @param {String} port 端口
   * @param {String='0'} db 数据库，默认为0
   * @param {Boolean=true} enable_offline_queue 等待连接建立后再发送请求，而不是立即抛错
   */
  constructor (host, port = 6379, db = '0', enable_offline_queue = true) {
    this.host = host
    this.client = redis.createClient({
      host: host,
      port: port,
      db: db,
      enable_offline_queue: enable_offline_queue
    })

    this.client.on('ready', () => {
      console.info('[redis]\t\t缓存\t\tok')
      console.info(`[redis]\t\t缓存\t\t${this.host}:${6379} ${0}`)
    })
    this.client.on('reconnecting', () => {
      console.info('[redis]\t\t重新尝试连接\t\tok')
    })
    this.client.on('error', error => {
      console.error('[Service]\tRedis\t\t出错')
      console.error(error)
      process.exit(1)
    })
  }
  /**
   * 将传入的对象经序列化后以 k-v 形式存储到 redis 中，并在设置的时间后过期
   * @param {String} key 键
   * @param {String} object 对象，会被转换成 String 后存储
   * @param {String} expired_in_seconds 过期时间，按秒计
   */
  async set (key, object, expired_in_seconds) {
    await this.client.setAsync(key, JSON.stringify(object), 'EX', expired_in_seconds)
  }


  /**
   * 从 redis 读取 key 所对应的字符串，并经由反序列化后得到对象
   * @param {String} namespace 命名空间，为防止不同区域的键值冲突
   * @param {String} key 键
   * @returns {Object} 经由反序列化后得到的对象
   */
  async get (key) {
    const result = await this.client.getAsync(key)
    if (!result) return null
    return JSON.parse(result)
  }
}


module.exports = Redis
