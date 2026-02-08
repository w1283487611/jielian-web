const fs = require("fs");
fs.copyFileSync('src/pages.h5.json', 'src/pages.json');
console.log('✔ 使用 pages.h5.json');