title: 热更新的尽头？
date: 2018-01-31 19:57:17
tags: react webpack
---

今日本想为 [react-ssr-example](https://github.com/MrKou47/react-ssr-example) 添加 nodemon 配置，来实现debug时的server端热更新。中途无意间看到了 [Don’t use nodemon, there are better ways!](https://codeburst.io/dont-use-nodemon-there-are-better-ways-fc016b50b45e) 这篇文章，遂引发了对热更新的一些思考，记录在此。

<!-- more -->

## 何为热更新  

热更新是开发者为了让用户无感知的更新应用的一个技术。它能做到线上bug的快速fix，也可以实现根据运营活动的不同而动态更改应用的展示结果。热更新本是从安卓而兴起的，随后IOS阵营通过JSPatch同样实现了热更新功能。
当然，说了这么多，其实和js的热更新并没有什么关系。。因为就前端而言，应该不存在热更新的问题：资源都是通过网络加载过来的，即使有缓存机制，我们也可以有相应的解决办法。所以这篇文章说的更多的是在我们前端开发过程中的热更新。

## 有哪些热更新

> TL;DR
> * JS, CSS -> webpack.devServer.hot, BrowserSync
> * react component -> react-hot-loader, react-transform-hmr(deprecated)
> * server side -> nodemon, fs.watch, chokidar, supervisor
> * server runtime -> pm2

最近一直在开发react的项目，那就从 react 开发来说起。

#### react项目的热更新

我们在开发react的时候，一般都是用 devServer 提供的 [devServer.hot](https://webpack.js.org/configuration/dev-server/#devserver-hot) 来实现代码的动态更新，即修改js或者css，浏览器都会主动更新js脚本来显示最新的结果。要求再高一点，我们不希望做全组件的reload，而希望页面中只对修改的组件做热更新，我们还可以使用 [react-hot-loader](https://github.com/gaearon/react-hot-loader) 来实现。此举同样解决了 redux 中的 store 树在热更新后数据丢失的问题。

而回到 `react-ssr-example` 中，由于我希望实现的是一个同构的react，即由server端来渲染react组件，由客户端绑定事件和初始化redux store。那么热更新的配置就和纯前端项目不同了。

假如我用写的是一个纯前端react，即客户端渲染，那我启动了 webpack devServer后，假如我还使用了 htmlWebpackPlugin(一般都用吧)，那 dev server 会在打包好js后将js插入到 `htmlWebpackPlugin` 配置的 template 中，我们访问页面时就由 `bundle.js` 中的代码来渲染页面；假如我同时还使用了 cssmodule，那 `bundle.js` 还会在 `<head>` 中插入特定的css（即内部样式）；假如我们同时又使用了 `ExtractTextPlugin`, webpack 打包的时候就会自动将样式抽出为 **单独** 的 css 文件，然后插入到 `<head>` 中（外部样式）。这其中，对于css的处理是非常蛋疼的：我们对于js的按需加载，可以使用 `webpack.ensure` 来把js 打包为chunk， 然后根据router的不同来动态引入。而对于css我们似乎最多只能达到打包为一个css文件而不能做更多的 *code split*。
所以你不得不承认 css 的处理是项目中的一个难点。
说了这么多打包的东西，似乎跑题了。。实际上我想说的是对于前端渲染的热更新，实现是非常容易的，毕竟我们只需要更新一个单独的js 就可以了。每次代码的更新都会导致webpack的compile。

对于同构react，事情似乎变得复杂了。同构react的调试，首先我们要理解一个基本概念就是：server端发送的永远是已经渲染好的字符串，webpack打包的js文件只是用于事件绑定。这个过程中一定要保证 **前后端一致**。 这意味着，假如我修改了项目中的一个组件，我需要服务器重新启动才能看到我的最新修改（想一下，我们同构项目的代码虽然都是使用 es6 语法来写的，但是我们的 runtime 是 *babel-node* ，所以我们依然使用的是nodejs的模块化）。依照这个思路，我们可以需要使用 *nodemon* 来watch我们的项目，在有文件更改时，让webpack重新compile，同时服务器重启，来确保前后端的行为一致。



#### nodejs 热更新

在 npms.io 上搜一下 hot-load，我们能看到 [超过100个结果](https://npms.io/search?q=hot-load)。其实这些热更新大多依赖了 `fs.watch` api。我们在开发环境可以选择使用 nodemon, supervisor 来做热更新，实际上就是动态重启我们的服务器，我们也可以自己依照 `fs.watch` 来做一个比较简单的热更新，或者选用第三方封装好的fs模块来实现 👉🏻 [chokidar](https://github.com/paulmillr/chokidar)。

#### runtime 热更新

当服务器运行时，我们有时候可能需要动态修改服务器上的代码。一个case：后端api宕机，运维及时使用新服务器来部署后端代码，此时后端ip已经变更，前端 config 中的 proxy 也需要更改，此时一般做法是git上修改config然后在服务端拉去，`pm2 reload` 重启服务器。其实我们也可以使用一些第三方模块来完成热更新config的工作。例如 [live-path](https://github.com/substack/live-patch)。 当然，对于nodejs的零宕机部署也可以参阅 [这篇文章](http://blog.argteam.com/coding/hardening-node-js-for-production-part-3-zero-downtime-deployments-with-nginx/)。

