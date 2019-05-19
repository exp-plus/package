const axios = require('axios')
const { JSDOM } = require('jsdom')
const Entities = require('html-entities').AllHtmlEntities
const entities = new Entities()

const preview_image_regexp = /msg_cdn_url = "(.*)"/g
const title_regexp = /msg_title = "(.*)"/g
const description_regexp = /msg_desc = "(.*)"/g


/**
 * 获取公众号文章的标题、预览图、简述、内容等
 * @param  {String} url 公众号文章链接，必须以https://mp.weixin.qq.com开头
 * @returns {{title:String,description:String,content:String,origin_url:String,preview_image_url:String}} article
 */
async function convertToArtcile (origin_url) {
  if (origin_url && origin_url.indexOf('https://mp.weixin.qq.com') !== 0) {
    throw new Error('必须为公众号文章')
  }

  let preview_image_url
  let title
  let description
  let content
  let { data } = await axios.get(origin_url)

  preview_image_url = preview_image_regexp.exec(data)
  title = title_regexp.exec(data)
  description = description_regexp.exec(data)
  if (preview_image_url === null || title === null || description === null ||
    preview_image_url[1] === undefined || title[1] === undefined || description[1] === undefined) {
    throw new Error('获取公众号文章概要内容失败')
  }
  preview_image_url = preview_image_url[1]
  title = title[1]
  description = description[1]

  const dom = new JSDOM(data)
  content = dom.window.document.getElementById('js_article').outerHTML
  if ((typeof content) !== 'string' || content.length === 0) {
    throw new Error('获取公众号文章概要内容失败')
  }
  content = `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="referrer" content="no-referrer">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="ie=edge">
          <script src="https://static.deeract.com/assets/process.js"></script>
          <link rel="stylesheet" type="text/css" href="https://static.deeract.com/assets/weixin.css" /> 
          <link rel="stylesheet" type="text/css" href="https://static.deeract.com/assets/style.css" /> 
          <title>${entities.encode(title)}</title>
        </head>
        <body onload="processArticle()">
        ${content}
        </body>
        </html>`

  return {
    title,
    description,
    content,
    origin_url,
    preview_image_url
  }
}

module.exports = convertToArtcile
