const fs = require("fs");
fs.copyFileSync('src/pages.default.json', 'src/pages.json');
console.log('✔ 使用 pages.default.json');