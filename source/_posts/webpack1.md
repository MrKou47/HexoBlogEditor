title: 使用webpack+express+typescript+react搭建纯前端框架(一):webpack2 配置
date: 2016-12-02 00:07:21
categories: javascript
tags: 
 - webpack
 - typescript
 - react
---

之前我们将服务端与客户端代码都 ready 了，现在开始编写 `webpack.config`。 我们对于 *webpack* 的配置包括单独的 `webpack.config.js` 和 服务端的 `server.js` 。 如果不依赖于 `express` ，我们大可以使用 `webpack dev server` 来跑起来我们的前端项目。但现在我们需要在 `express` 的托管下来跑。  
  大致思路就是， 使用 `express` 来托管我们的静态资源，包括 `html image css js`。 使用 `http-proxy` 模块来代理前端过来的 *GET/POST* 请求。dev环境使用 *middleware* 来实现 webpack的部分功能。
  
  
### webpack 配置

**webpack将所有文件视为js代码**

对于 *webpack* 的配置，我们要有一个清晰的思路： webpack 主要用于 **多文件** 的打包，可同时配置 **入口文件** 和 **打包文件** ，对于文件的编译（例如es6 -> es5，读取svg图片）使用loader，对于同一种类型的文件可调用多个loader进行处理（类似gulp的pipe）对于文件的压缩，生成新文件等有关于 **文件的操作** 使用插件的形式。
搞清楚了这些，我们来理一下我们需要webpack帮我们完成的工作：

 1. 我们有一个入口文件，里面有我们整个应用的render函数，同时引用了我们写的其他模块文件，webpack需要根据我们的入口文件，层层通过寻找 `import` 来找出其他模板的代码，最终生成出一份 最终的代码，这里面包含了所有的逻辑代码 （可能很大）。
 2. 我们的代码是由 *typescript & es6* 编写的，同时我们的js中可能还会有 `import *.css/less/scss` `import *.png/jpg/gif` 这种代码，所以 *webpack* 需要对这些后缀的文件进行处理。
 3. 我们只是编写了js，我们还需要 *webpack* 帮我们生成 `html` 文件。
 4. 我们的js需要压缩，css需要做兼容性处理。
 5. 我们还可能根据nodejs的环境来控制前端页面中的元素是否显示。也就是 我们需要将后端的环境变量传到前端。
 6. 我们可能还要对文件进行拆分，毕竟一个js太大会阻塞页面的显示，体验很差。

以上就是我们需要webpack为我们做的工作。下面我们根据我们这几个需求来编写 *webpack* 的配置文件。

### 1. 基本配置

```js
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');

const baseConfig = {
    context: path.resolve(__dirname, '../'),
    entry: {
        app: [
            'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000',
            path.resolve(__dirname, '../app/main.js'),
        ],
        vendor1: [
            'react',
            'react-router',
            'react-redux',
            'redux',
        ],
        vendor2: [
            'reqwest',
        ],
    },
    output: {
        filename: '[name].[hash:5].js',
        path: path.resolve(__dirname, '../dist/'),
        publicPath: '/',
    },
    resolve: {
        extensions: ['.web.js', '.ts', '.tsx', '.js'],
    },
}
```

我们在刚在的中，声明了webpack 工作的环境(context), 默认为 `process.cwd()`, 定义了打包的入口(entry), entry可以携带参数，因我们使用了 `webpack-hot-middleware`, 所以我们对入口文件加了这个参数来让 webpack的server 实时监控文件的改变来rebuild app.js。 同时我们对库文件进行了拆分， 拆成了两个文件 vendor1 和 vendor2 来减少打包后的文件体积。

我们同时定义了输出文件的属性，输出的js文件名包含5位hash码，定义了文件的输出路径（path）和 资源引用路径（publicpath）, publicpath 用于webpack生成html使用。

我们还定义了webpack在读取、解析 js的时候的解析规则(resolve), 添加了能够省略的 `import` 文件的拓展名的数组(extension)。

### 2. 文件处理（loader）

```js
  module: {
    loaders: [{
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
    }, {
      test: /\.json$/,
      loader: 'json-loader',
    }, {
      test: /\.tsx?$/,
      loader: [
        'react-hot-loader',
        'babel-loader',
        'ts-loader',
      ],
      exclude: /node_modules/,
    }, {
      test: /\.css/,
      loader: ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: 'css-loader!postcss-loader',
      }),
    }, {
      test: /\.less$/,
      loader: ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: 'css-loader!less-loader!postcss-loader',
      }),
    }, {
      test: /\.scss$/,
      loader: ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: 'css-loader?modules&localIdentName=[local]-[hash:base64:5]!postcss-loader!sass-loader',
      }),
    }, {
      test: /\.woff(\?.*)?$/,
      loader: 'url-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/font-woff',
    }, {
      test: /\.woff2(\?.*)?$/,
      loader: 'url-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/font-woff2',
    }, {
      test: /\.otf(\?.*)?$/,
      loader: 'file?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=font/opentype',
    }, {
      test: /\.ttf(\?.*)?$/,
      loader: 'url-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/octet-stream',
    }, {
      test: /\.eot(\?.*)?$/,
      loader: 'file?prefix=fonts/&name=[path][name].[ext]',
    }, {
      test: /\.(png|jpg)$/,
      loader: 'url-loader?limit=8192',
    }, {
      test: /\.(svg)$/i,
      loader: 'svg-sprite-loader',
      include: [path.resolve(__dirname, '../node_modules/antd-mobile/lib')],  // 把 svgDirs 路径下的所有 svg 文件交给 svg-sprite-loader 插件处理
    }],
  },
```

这里的配置很好理解，只是通过正则匹配文件然后走特定的loader解析的过程。 这里要注意几点：

 - loader的顺序是从右向左的，比如对css的解析,就是先通过 *postcss-loader* 处理后由 *css-loader* 处理的。
 - loader能加参数。如在加载字体文件时，*file-loader* 就添加了 *prefix* 参数。
 - 我们可以使用 `include` 参数来指定需要处理的文件的路径

### 3. 插件配置

```js
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../server/view/index.html'),
      hash: false,
      filename: 'index.html',
      inject: 'body',
      minify: {
        collapseWhitespace: true,
      },
    }),
    new webpack.LoaderOptionsPlugin({
      options: {
        context: path.join(__dirname, '/../'),
        postcss: [
          autoprefixer({
            browsers: ['last 2 version', 'Android 4.4'],
            remove: false,
          }),
          pxtorem({
            rootValue: 100,
            propWhiteList: [],
            selectorBlackList: [/^html$/, /^\.ant-/, /^\.github-/, /^\.gh-/],
          }),
        ],
      },
    }),
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor2', 'vendor1'],
    }),
    new ExtractTextPlugin('style.css'),
  ],
```

此处我们定义了 *webpack* 的插件的属性。

 - HotModuleReplacementPlugin 让我们在开发时能热更新我们的组件。
 - htmlwebpackplugin 帮助我们生成包含我们打包后的js、css的html文件
 - loaderoptionsplugin 是webpack2 新增加的plugin。我们对于第三方插件的配置都在这里面定义。
 - commonchunkplugin 帮助我们拆分单个js文件，对应着entry里面配置的两个 文件名。
 - extracttextplugin帮助我们生成打包好的css样式文件。如果没有定义这个插件，htmlwebpackplugin 会把css全部写在html里面。
 - postcss 是我们引用的一个解析css的插件。我们通过依赖它的一些插件来实现浏览器兼容性（autoprefixer）和 rem的转换（px2rem）