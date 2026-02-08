const fs = require("fs");
fs.copyFileSync('src/pages.mp-wx.json', 'src/pages.json');
console.log('✔ 使用 pages.mp-wx.json');