title: 使用webpack+express+typescript+react搭建纯前端框架(一):基础构建
date: 2016-12-02 00:07:21
categories: 技术
tags: 
 - webpack
 - typescript
 - react
---

## 前言

最近公司业务急剧膨胀， 一下子要有三个大后台要开撸..之前的 `jquery` 和 `express` 的搭配已经不能满足需求了ORZ..., 所以就想开始用新的框架来写。对于新框架，老板同志同时还提出了几点要求：  

- 路由要前端配置(这是肯定的啦之前用express不就是么 - -)
- 你这 js 不行啊，还是强类型语言好（可以，很强势这波）
- 要用异步加载，不要全部都是服务器渲染
- "回头我把持续集成加上（说的第十遍）"
- 代码要漂亮， 我们要给歪果仁看  

针对老板提出的这几个问题..我经过几天几夜的深入领会后(天降正义！..我看到你了！...double kill..)，针对每一条都给出了技术选型  
  
- 路由要前端配置 ----------------------        react-router
- 你这 js 不行啊，还是强类型语言好 ----------  typescript 
- 要用异步加载，不要全部都是服务器渲染 ------- react (可选 react-ssr)
- "回头我把持续集成加上（说的第十遍）" ------- gitlab ci
- 代码要漂亮， 我们要给歪果仁看   ------------ eslint + tslint 

都选完了，赶紧开整。工期有限，玩不起猝死了..

## 基础配置

首先肯定是装包啦，当然我们先一步一步来..  
  这次用新的编辑器 [visual studio code][1] , 微软出的新编辑器，类似于 sublime 又高于它， 主要它天生支持 ts , 同时支持编辑器内调试，打断点， git 支持， 还支持安装拓展包... 反正就是贼好，就它了。
  同时， 听说 `pm2` 支持 `nodejs` 端的 `es6` 语法了，所以我们这次服务端也使用es6编写。
  再同时， 因为我们的代码包含前后端， 所以我们的目录结构要把服务端和前端代码分开
  
  > |-src // 前端代码
    |-server  // 服务端代码
     
### 1. 搭建基础的 `express` 框架  
因为 `express` 的 `generator` 只生成es5的代码，所以我们自己来写一个简单的服务端。同时我们的业务也可能要求会有一些页面会由服务端渲染，所以我们的目录结构为:
```shell
  |- /server
     |- router
     |- view
     |- server.js
     |- config.js
```
我们先写个入口文件
```js
import express from 'express';
import path from 'path';
import compression from 'compression';

import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import config from './config';

const isDeveloping = process.env.NODE_ENV !== 'production';

const port = config[isDeveloping ? 'dev' : 'production'].port;

const app = express();

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
  extended: true,
}));

app.use(cookieParser());
app.use(compression());
app.use('/statics', express.static(path.join(__dirname, './statics')));

app.listen(port, (err) => {
  console.log('err: ', err);
  if (isDeveloping) {
    console.log(`server start in develop environment, Open up http://localhost:${port}/ in your browser.`);
  } else {
    console.log(`server start in production environment, Open up http://localhost:${port}/ in your browser.`);
  }
});
```
tips：windows电脑可以使用 `cross-env` 来实现配置 `NODE_ENV`;
### 2. 构建前端代码
```shell
    |- /src
      |- /component # 公共component
      |- /container # 页面级component
        |- component # 仅此页面使用的component
        |- index.scss
        |- index.tsx
      |- /interface # proto2ts 的类型声明文件
      |- /router # 前端路由定义
        |- index.ts
      |- /style # 公共style
      |- /util # 工具类
        |- index.ts
      |- client.tsx # 总入口文件
      |- index.js # 提供给webpack打包的出口文件
      |- Global.d.ts # 全局变量/模块定义文件 
```
我们先写一个类似于微信小程序demo的首页。我们希望首页能显示用户头像与昵称，有个按钮能控制显示头像与昵称的显示隐藏。所以我们可以创建一个 `Home` 组件，它包含一个子组件 `Avatar` 。  

#### 父组件  

```tsx
// /container/Home/index.tsx
import * as React from 'react';
import Avatar from './Avatar';

export interface HomeState {
  avatar?: string;
  name?: string;
  visible?: boolean;
}

class Home extends React.PureComponent<any, HomeState> {
  constructor(props) {
    super(props);
  
    this.state = {
      visible: false,
      avatar: '',
      name: '',
    };
  }
  
  componentWillMount = () => {
    // 模拟ajax
    setTimeout(() =>  {
      this.setState({
        avatar: 'http://mrkou47.github.io/img/logo.png',
        name: 'mrkou47',
      });
    }, 2000);
  }

  toggleVisible = () => {
    this.setState({ visible: !this.state.visible });
  }

  render() {
    const { visible, avatar, name } = this.state;
    return (
      <div>
        <Avatar avatar={avatar} name={name} />
        <div className="button" onClick={this.toggleVisible}>{visible?'隐藏':'显示'}</div>
      </div>
    );
  }
}

export default Home;
```  

#### 子组件 `Avatar`  

```tsx
import * as React from 'react';

export interface AvatarProps {
    avatar: string;
    name: string;
}

class Avatar extends React.PureComponent<AvatarProps, any> {
  constructor(props) {
    super(props);
  }

  static defaultProps: AvatarProps = {
    avatar: '',
    name: '',
  }

  render() {
    const {avatar, name} = this.props;  
    return (
      <div>
        <img src={avatar} alt="avatar"/>
        <span className="user-name">{name}</span>
      </div>
    );
  }
}
export default Avatar;
```
有关使用 [pureComponent][2] 的问题此处不再赘述。

组件编写好，我们开始编写路由: 
#### 路由配置
```ts
// src/router/index.ts

import Home from '../container/Home';

const routes = [{
    path: '/',
    component: Home,
}];

export default routes;

```

#### 总入口文件
编写总入口文件 `client.tsx` :

```tsx
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Route, Router, browserHistory } from 'react-router';
import routes from './router';

const render = () => {
  ReactDOM.render(
		<Router history={browserHistory} routes={routes} />
		document.getElementById('app'), // 此处为提前编写的模板文件中的DOM
	);
};

export default render;
```
#### 总出口文件
编写总出口文件 `index.js`:
```js
import render from './client.tsx';

require('babel-polyfill');

render();

```

为什么需要引入 `babel-polyfill` 呢？ [babel-polyfill][3]。

至此，我们的前端页面就写好了，下一节在写连接后端与前端的webpack config

  [1]: https://code.visualstudio.com/
  [2]: https://60devs.com/pure-component-in-react.html "pureComponent"
  [3]: http://guoyongfeng.github.io/my-gitbook/03/toc-babel-polyfill.html