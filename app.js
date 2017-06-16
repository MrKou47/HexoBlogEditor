const Hexo = require('hexo');
const path = require('path');

console.log(process.cwd(), __dirname);

const hexo = new Hexo(__dirname, {});


hexo.init().then(() => {
  console.log('hexo init success');
});

hexo.load().then(() => {
  console.log('hexo load success');
  console.log(hexo.route.list());
});

hexo.watch().then(() => {
  console.log('hexo watch success');
});

