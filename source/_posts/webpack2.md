titile: 使用webpack, express, typescript, react 搭建前端框架（三）: Express 服务端配置
date: 2017-1-21 23:58:10 
categoties: javascript 
tags：
 - typescript
 - webpack
 - express
---
   
### express 配置


```js
// 依赖项
const express = require('express');
const path = require('path');
const webpack = require('webpack');
const history = require('connect-history-api-fallback');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const bodyParser = require('body-parser');

const config = require('./webpack.config.js');
const isDeveloping = process.env.NODE_ENV !== 'production';
const port = isDeveloping ? 8000 : process.env.PORT;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// 引入路由定义
require('./server/router/config.router.js')(app);

app.use(history());

if (isDeveloping) {
    const compiler = webpack(config);
    const middleware = webpackMiddleware(compiler, {
        publicPath: config.output.publicPath,
        contentBase: path.join(__dirname, '/app'),
        stats: {
            colors: true,
            hash: false,
            timings: true,
            chunks: false,
            chunkModules: false,
            modules: false
        }
    });
    app.use(middleware);
    app.use(webpackHotMiddleware(compiler));
	app.use('/statics', express.static(__dirname + '/statics'));
} else {
    app.use(express.static(__dirname + '/dist'));
}

app.listen(port, function onStart(err) {
    if (err) {
        console.log(err);
    }
    console.info(`Listening on port ${port}. Open up http://localhost:${port}/ in your browser.`);
});
```

因为我们的应用使用了HTML5的 *history api*，所以用 `connect-history-api-fallback` 来做这个事情, 这个模块代码很少，主要就是根据请求头的类型来决定是否将路由 *rewite* 到设置的首页。
参考 [https://github.com/bripkens/connect-history-api-fallback/blob/master/lib/index.js#L70](https://github.com/bripkens/connect-history-api-fallback/blob/master/lib/index.js#L70)



*webpack-dev-middleware 和 webpack-hot-middleware* 让我们在开发环境能够使用 webpack的配置，例如 `source-map` ，同时它将打包的文件放到内存中，让我们可以使用HMR这个特性。

### 请求的代理

使用 *express-http-proxy* 来做请求的转发。 此模块的使用非常简单。 比如我想将 `／request` 前缀的请求全部代理到后端的接口上，代码如下：
```js
const proxy = require('express-http-proxy');

module.exports = (app) => {
  app.all('/request/*', (req, res, next) => {
    next();
  }, proxy(`http://${backend_host}`);
}
```

*proxy* 模块将原始的 req, res 用自定义的options来处理后 ,来请求后端接口，详细的可以看 [https://github.com/villadora/express-http-proxy/blob/master/index.js](https://github.com/villadora/express-http-proxy/blob/master/index.js)

