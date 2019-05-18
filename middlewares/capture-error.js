/**
 * 错误捕获
 * @param {function(error:Error)} handleServerError 服务器错误处理业务逻辑
 * @param {Boolean} printClientError 打印客户端错误
 */
function captureError (handleServerError, printError = false) {
  return async (error, req, res, next) => {
    if (printError) console.warn(error)

    // 客户端错误
    if (error.isKnown && !error.isServer) {
      return res.status(error.statusCode).send(error)
    }

    // 处理服务端错误
    handleServerError(error)
    return res.status(error.statusCode || 500).send(error.message || null)
  }
}

module.exports = captureError
