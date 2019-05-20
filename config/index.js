'use strict';

const fs = require('fs');
const path = require('path');

// 配置文件路径
const configFilePath = path.join(__dirname, 'test.js');

if (!fs.existsSync(configFilePath)) {
  console.error('配置文件不存在，请参考 template.js 新建 test.js');
  process.exit(1);
}

module.exports = require('./test.js');
