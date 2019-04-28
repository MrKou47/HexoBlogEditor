title: 移动端web小结
date: 2016-03-10 23:48:32
categories: 技术
tags:
 - other
---
写了这么长时间的移动端，今天总结一下移动端页面的各种坑与技巧，省着以后在趟了>_>
<!--more-->

## html
声明设备宽度与缩放

```html
<meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0;" name="viewport" />
```

取消自动识别手机号码/邮箱
```html
<meta content="telephone=no" name="format-detection" />
<meta content="email=no" name="format-detection" />
```

其他浏览器声明

```html
<!-- 启用360浏览器的极速模式(webkit) -->
<meta name="renderer" content="webkit">
<!-- 避免IE使用兼容模式 -->
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<!-- 针对手持设备优化，主要是针对一些老的不识别viewport的浏览器，比如黑莓 -->
<meta name="HandheldFriendly" content="true">
<!-- 微软的老式浏览器 -->
<meta name="MobileOptimized" content="320">
<!-- uc强制竖屏 -->
<meta name="screen-orientation" content="portrait">
<!-- QQ强制竖屏 -->
<meta name="x5-orientation" content="portrait">
<!-- UC强制全屏 -->
<meta name="full-screen" content="yes">
<!-- QQ强制全屏 -->
<meta name="x5-fullscreen" content="true">
<!-- UC应用模式 -->
<meta name="browsermode" content="application">
<!-- QQ应用模式 -->
<meta name="x5-page-mode" content="app">
<!-- windows phone 点击无高光 -->
<meta name="msapplication-tap-highlight" content="no">
```

Apple特定的meta标签说明如下 

```html
<meta name="apple-mobile-web-app-capable" content="yes">
```
如果content被设定为yes，Web应用程序在全屏模式下运行;默认使用Safari显示网页内容。
```html 
<meta name="apple-mobile-web-app-status-bar-style" content="black">
```
如果content被设置为 `default` ，状态栏显示正常。如果设置为 `black` ，在状态栏有一个黑色的背景。如果设置为 `black-translucent` 的状态条是黑色透亮。 如果设置为 `default` 或 `black`，网页内容显示在状态栏的下方。 如果设置为`black-translucent` ，web内容被显示在整个屏幕上，通过在状态栏部分遮蔽。 默认值是 `default` 。

移动端html模板

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="format-detection"content="telephone=no" />
    <title>Demo</title>
</head>
<body>
    <!-- code here -->
</body>
</html>
```

## CSS

 所有移动端页面按照**控件弹性，文字流式，图片等比例**进行编写。
 除去 `border` 以外，以 `rem` 作为基本单位，并定义基本度量为 `100px`。
 
```css
html {
 font-size: 100px;       
}
```
 在部分android 机型中的输入框可能会出现怪异的多余的浮出表单，经过观察与测试发现只有 `input:password` 类型的输入框存在，使用 `input:text` 类型的输入框并通过样式 `-webkit-text-security: disc` 解决隐藏输入密码的问题。
 
### PS： 键盘弹起的解决方案
当输入框在最下面的时候，最开始的解决方案是在页面下制作一个假的输入框=.=，然后通过事件绑定，当点击的时候，显示真的输入框固定在键盘上面..
后来使用flex布局解决问题。
 
 设置css属性 `-webkit-user-select:none` 控制用户不可选择文字
 
### Retina 屏幕1px边框处理方案 
 
```sass
.retina-border:after {
	content: '';
	display: block;
	width: 200%;
	height: 200%;
	position: absolute;
	left: 0;
	top: 0;
	box-sizing: border-box;
	border: 0px solid #aaa;
	-webkit-transform-origin: left top;
	transform-origin: left top;
	-webkit-transform: scale(.5);
	transform: scale(.5);
}
```

### 应用硬件加速

> 使用transform3D 浏览器会自动开启硬件加速模式

```css
.box {
	position: absolute;
	width: 100%;
	height: 100%;
	-webkit-transform: translate3d(0, 0, 0);
}
```