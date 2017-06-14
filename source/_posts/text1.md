title: JS:函数与对象
date: 2016-02-21 21:50:13
categories: javascript
tags: 
 - javascript
---

## 1.function vs object

先引用W3C上对函数的定义：

>函数是由事件驱动的或者当它被调用时执行的可重复使用的代码块。

函数是一种特殊的对象，同样具有属性(arguments)，同时它的书写方法也是过程式的，引用方式也与普通对象不同。
函数的复制是内存拷贝，对象是引用。

## 2.function create

函数名可以看成指针，函数体可以看成对象。
函数的创建方式有三种：

1.声明式
```js
function add(num1,num2){
    return num1+num2;
}
```

2.函数表达式

```js
 var add = function(num1,num2){
    return num1+num2;
 };
```
 
3.利用`Function`构造函数
```js
var fn = new Function("num1","num2","return num1+num2"); 
```
Function这种创建函数的方式**不推荐**使用，因为这样会在解释器读取到此行代码时解析两次，第一次正常解析代码，第二次解析构造函数的参数。

## 3.array.sort function

JS内置了数组排序方法`sort()`,默认是根据ASCII码进行排序。
`sort()`排序方式ECMA未给出，经测试类似快排。

```js
var arr = [1,2,4,5,2];
arr.sort();
console.log(arr);//[1,2,2,4,5]
var arr1 = [1,"4","19",3,2];
console.log(arr1.sort());//[1, "19", 2, 3, "4"]
```
`sort()`方法接收一个**排序函数**，根据**排序函数**的返回值进行排序。

例：
```js
var arr = [1,"4","19",3,2];
arr.sort(function(a,b) {
        return a-b;
        });
console.log(arr);//[1, 2, 3, "4", "19"]
```
排序函数中a和b是数组中两个任意元素，`a-b`输出从小到大排序，`b-a`输出从大到校排序。
特殊的，当数组中元素为对象,并且要根据对象的属性进行排序，排序函数要写成返回值为函数的形式。

例：根据人的年龄进行排序

```js
//创建People类
function People(name,age) {
	this.name = name;
	this.age  = age;
}
//生成对象
var fir = new People("Lisa","20");
var sec = new People("Susan","10");
var thir = new People("James","59");
var fou = new People("Li","40");
var arr2 = [fir,sec,thir,fou];
//比较函数
function compare() {
	return function (a,b) {
		return a.age-b.age;
	}
};
arr2.sort(compare(fir,sec));
//循环输出对象年龄
for (var i = 0; i < arr2.length; i++) {
	console.log(arr2[i].age);
}//10,20,40,59
```

## 4.factorial  arguments.callee 

函数的递归。即在函数中调用本函数。
一个最简单的递归的例子：

```js
function c(num) {
	if (num==1) {
		return 1;
	}else {
		return num*c(num-1);
	}
}
alert(c(3));//6
```

同时，递归也可以用`arguments.callee()`方法实现。它的主要功能是递归调用自身的函数（可匿名），但在严格模式下已经禁止使用。
[Why was the arguments.callee.caller property deprecated in JavaScript?](http://stackoverflow.com/questions/103598/why-was-the-arguments-callee-caller-property-deprecated-in-javascript/235760#235760)

## 5.function call/apply

call,apply均改变函数的内部指向。
> fn.call(obj,arguments,arguments2,arguments3...);
> fn.apply(obj,[argument]);

`fn`是要绑定的函数，后面的参数为要绑定的函数的参数。

区别：

`call()`后面传的arguments是单独的，`apply()`传的为arguments的数组

作用：

 1.用于动画的回调函数

当用js写动画的时候，在事件的结束阶段调用call方法，可以在事件结束阶段给此对象传入新的方法。

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Document</title>
	<style>
		* {
			padding: 0;margin: 0;
		}
		#box {
			width: 50px;
			height: 50px;
			background-color: #f00;
		}
		#box1 {
			width: 50px;
			height: 50px;
			background-color: blue;
		}
	</style>
</head>
<body>
	<div id="box"></div>
	<div id="box1"></div>
	<script type="text/javascript">
		var box = document.getElementById('box');
		var box2 = document.getElementById('box1');
		var timer = null;
		box2.onclick = function () {
			widthChange(box);
		}
		function widthChange(obj) {
			var boxWidth = parseInt(getStyle(obj,'width'));
			var num = 1;
			timer = setInterval(function () {
				if (parseInt(getStyle(obj,'width'))>=150) {
					obj.style.width = 150 + 'px';
					clearInterval(timer);
					heightChange.call(this,box);//回调
				} else {
					num+=5;
					obj.style.width = boxWidth + num + 'px';
				}
			},30)
		}
		function heightChange(obj) {
			var boxHeight = parseInt(getStyle(obj,'height'));
			var num = 1;
			timer = setInterval(function () {
				if (parseInt(getStyle(obj,'height'))>=150) {
					obj.style.height = 150 + 'px';
					clearInterval(timer);
				} else {
					num+=5;
					obj.style.height = boxHeight + num + 'px';
				}
			},30)
		}
		function getStyle(obj,attr) {
			return obj.currentStyle?obj.currentStyle(attr):getComputedStyle(obj)[attr];
		}
	</script>	
</body>
</html>
```

上例中，当`changeWidth()`运行结束后启用`changeHeight()`，通过`	heightChange.call(this,box)`实现了事件的回调。

 2.实现面向对象中的伪造继承
 
 面向对象的伪造继承，仅仅继承了父类的类而没有继承父类的原型。
 使用call方法调用父类构造函数。
```js
        function Teacher(name,sex) {
			this.name = name;
			this.sex = sex;
		}
		Teacher.prototype.say = function () {
			alert(this.name+":hello");
		}
		function Student() {
			Teacher.call(this,"xiaoming","nan");
		}
		var s = new Student();
		alert(s.name);  //xiaoming
		s.say();    //s.say() is not a function
```
如上，`Student`类只继承了`Teacher`类的方法和属性而没有继承原型。
当我们加上`Student.prototype = new Teacher();`之后，才可以继承父类的原型。

3.调用匿名函数

```js
    function greet() {
      var reply = [this.person, 'Is An Awesome', this.role].join(' ');
      console.log(reply);
    }
    
    var i = {
      person: 'Douglas Crockford', role: 'Javascript Developer'
    };
    
    greet.call(i); //更改了上下文的指向
```

其实`call()`和`apply()`真正强大的地方在于能够扩充函数的作用域，而且对象不需要与方法存在任何的耦合关系。