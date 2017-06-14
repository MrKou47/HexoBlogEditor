title: 通过js获取并修改元素样式
date: 2016-02-10 14:36:22
tags: javascript
---

## 1.修改CSS样式

### 1.通过DOM操作

```html
	<p id="title">box</p>
	<script>
		var pBox = document.getElementById('title');
		pBox.style.Width = '300px';
	</script>
```

### 2.通过json

```html
	<p id="title">box</p>
	<input id="button1" type = "button" value = "changeStyle" />
	<script>
	
		//写一个函数,用以传入一个DOM对象，，传入一个mJson，然后赋值。
		function css(obj , mJson) {	
			for(var i in mJson){
				obj.style[i] = mJson[i];
			}
		}
		//-------测试------
		var pBox = document.getElementById('title');
		var btn = document.getElementById('button1');
		var mJson = {
			'width':'300px',
			'height':'100px',
			'backgroundColor':'red'
		}
		btn.onclick = function() {
			css(pBox,mJson);
		}
	</script>
```

## 2.获取DOM元素的css样式的值

>getComputedStyle(obj).width
>currentStyle.width  //兼容IE6 7 8 不兼容其他浏览器

```javascript
	function getStyle (obj,str) {
		var strr = str.split(' ');
		 str = strr.join('');
		if(obj.currentStyle){
			return obj.currentStyle[str];
		} else {
			return getComputedStyle(obj)[str];
		}
		//三元表达式
		obj.currentStyle ? obj.currentStyle[str]:getComputedStyle(obj)[str];
		
	 }

```

