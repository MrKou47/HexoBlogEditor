title: github+hexo+nodejs搭建个人博客
date: 2016-04-01 16:08:29
categories: 技术
tags: hexo
---

这个东西也是拖了好久..回想起当初踩过的坑现在还是历历在目啊..因为网上大多数的教程都是老版本的，不是git老，就是nodejs,npm的版本太低，所以坑大多数都踩在这里了。不多说了，上干货。

<!--more-->

搭建环境：win8或win10,时间是2016年1月。

### 注册github && 生成ssh-key

注册应该都会，我就不细讲了。点击[github](https://github.com/)注册即可。主要是后面这里，要生成一个ssh-key绑定自己的电脑。

此处的坑：
现在的github有客户端了，同时还随客户端赠送一个**git shell**命令行工具,当时生成ssh用的这个，但是生成的key却不是标准格式的，也不知道什么原因，困扰了很长时间..后来下载了[git](https://git-for-windows.github.io/),用**git bush**才生成成功。

生成过程：

1.配置git账户：
>$ git config --global user.name "your_name"
>$ git config --global user.email "your_email"

1.检查本机是否已经有了ssh-key

首先，你需要确认自己是否已经拥有密钥。 默认情况下，用户的SSH密钥存储在其 `~/.ssh` 目录下。 进入该目录并列出其中内容，你便可以快速确认自己是否已拥有密钥：
桌面右击点击git bush,输入`$ cd ~/.ssh`,若没有则提示`No such file or directory`。
若没有，输入`ssh-keygen -t rsa -C your_email`,your_email为你github注册时的邮箱。此时会提醒你输入密码等等，一路回车跳过即可。
>Generating public/private rsa key pair.
Enter file in which to save the key (/home/schacon/.ssh/id_rsa):
Created directory '/home/schacon/.ssh'.
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in /home/schacon/.ssh/id_rsa.
Your public key has been saved in /home/schacon/.ssh/id_rsa.pub.
The key fingerprint is:
d0:82:24:8e:d7:f1:bb:9b:33:53:96:93:49:da:9b:e3 schacon@mylaptop.local

最后会提醒你生成完成，此时会得到两个文件id_rsa和id_rsa.pub。默认的文件夹保存在你用户文件夹下面。将pub后缀的文件用记事本打开，将内容复制，然后进入[github](https://github.com/)的个人设置界面，点击左侧的**SSH Key**，点击**New SSH** key，在title输入任意名字，下面的Key粘贴刚才复制的密钥，点击**Add SSH key**，添加完成。


### 2.建立博客库

在github生成一个库，取名为yourname.github.io。
点击new repository,创建库
![creat](http://7xr185.com1.z0.glb.clouddn.com/1.png)

description输入对库的描述，下面选择private，然后点击creat repository。我们的博客空间就创建完成了。

### 3.安装hexo

这个阶段因为nodejs，npm，hexo的版本问题，会有很多坑要踩。

1.安装nodejs

在[Node.js中文网](http://nodejs.cn/)直接下载最新的nodejs，最新版本的nodejs自带npm。

2.配置&安装hexo

我们在本地计算机创建一个文件夹，用来保存博客的文件。例如我新建文件夹，叫做KBScript，进入文件夹，右键选择git bush。启动命令行工具，输入
>npm install -g hexo

安装hexo，安装成功后，进入你创建的文件夹，右键选择git bush，输入`hexo init`在此文件夹中建立博客框架。此时你的文件夹中会生成很多配置文件。然后输入`hexo g`生成静态界面。按照正常流程，此命令结束后，执行`hexo s`可启动本地服务器，在浏览器中输入`localhost:4000`可进入生成的静态界面，如果显示成功那么你的本地博客就创建完成了，但是事实并不是这样..

问题1：当你的计算机中安装**福昕阅读器**的时候，进程中会有个福昕更新进程，此线程会占用4000端口导致hexo无法部署本地博客，关掉就可以了。

问题2：ERROR Plugin load failed: hexo-server

执行命令`sudo npm install hexo-server`

问题3： Usage: hexo

执行命令： `npm install hexo-server --save`

问题4：CANT GET /INDEX.html

执行
>    npm install hexo-renderer-ejs --save

>    npm install hexo-renderer-stylus --save

>   npm install hexo-renderer-marked --save


问题5：npm WARN optional dep failed,continuing...

npm版本问题，执行`npm install -g npm@3.3.12`

问题6：Could not open a connection to your authentication agent.

这个问题让我都要抓狂了。前面踩了很多坑到最后上传的时候又把我卡在这里了T_T。这个时候已经是凌成1点多了，我找很多地方都没有解决方案..无奈最后去[stack overflow](http://stackoverflow.com/),搜了一下这个问题，一下就蹦出来高票回答了：

解决方案：执行`eval $(ssh-agent)`。

当时执行了之后感觉整个人都上天了啊！发张图你们随意感受一下歪果人解决之后的激动心情
![stackoverflow](http://7xr185.com1.z0.glb.clouddn.com/3.png)

不说了，stackoverflow一生推啊。

### 4.生成博客&应用主题

当hexo配置并部署好后，输入`hexo s`启动本地服务器
成功后显示hexo默认主题（使用的默认主题）：
![hello hexo](http://7xr185.com1.z0.glb.clouddn.com/hexo.png)

打开你博客目录下面的config.xml文件,建立与你github库的关联。
deploy：
```nodejs
## Docs: http://hexo.io/docs/deployment.html
deploy:
  type: git
  repository: https://github.com/voidking/mrkou47.github.io.git
  branch: master
```

type可能是git或者github，一个不行就换另一个吧。
配置成功后在git shell中执行 `hexo d`,若报错，执行`npm install hexo-deployer-git --save`

执行成功后会提醒你输入git的账户名和密码，密码输入的时候是不显示出来的，回车后等待片刻，会提醒上传成功，因为github可能会延迟，等待10几分钟后浏览器输入username.github.io，你就能看到你自己的博客啦！XD


## 更改hexo主题

首先，我们先了解一下Hexo的目录结构：
<br>
![hexo目录](http://7xr185.com1.z0.glb.clouddn.com/hexo.jpg)

```
|--node_modules (npm)
|-- _config.yml  (全局配置文件)
|-- package.json （hexo框架参数）
|-- scaffolds （博文目录，hexo根据此文件夹来生成网页）
|-- source （重要，里面为新建的文章）
   |-- _drafts
   |-- _posts（通常hexo new 的文章都在这里）
|-- themes （主题文件）
```
这些了解一下就可以了。

我用的是[TKL](https://github.com/SuperKieran/TKL)一个响应式的主题，作者在这里[Kieran's Blog](http://go.kieran.top/)。

1.下载TKL

很简单，直接在theme目录下clone一下就行了，详细见[TKL README](https://github.com/SuperKieran/TKL)

2.修改全局配置文件

打开`_config.yml`文件，修改theme为TKL。
**注意！**
主题配置文件为YAML格式，yml文件有严格的格式，要按照格式编写。例如`key: value` 中间的空格一定不能少。当配置有子元素时，要在键换行后，每个值前面都有两个空格。

3.TKL 简单介绍
因为作者是用ejs写的，所以我们修改主题的时候要考虑的问题要多一些。
![TKL主目录](http://7xr185.com1.z0.glb.clouddn.com/tkl1.jpg)
```
|-- layout (布局文件)
    |-- _widget (控件)
    |-- casper ( meta 等布局)
|-- source （资源文件 字体，样式，js等）
```
主要的布局都在casper文件夹下，如主页布局`index.ejs`,文章页布局`post.ejs`,顶部导航`header.ejs`,关于界面`about.ejs`。


## 结语

  stackoverflow大法好，npm版本更新真坑爹，exprss更是！
  希望大家不要和我一样折腾一宿了ORZ..