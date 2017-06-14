title: 用js实现数据结构中的排序
date: 2016-01-30 22:31:59
categories: 数据结构
tags: 
 - 数据结构
 - javascript
---
## 利用JS实现数据排序

　　这次主要包括冒泡排序，插入排序与选择排序。
　　
### 1、冒泡排序

　　冒泡排序是数据结构排序中最简单的一种，通过重复遍历数组，每次比较两个元素，如果大小顺序不同则将他们交换位置。遍历的次数为数组长度。
　　我们先看一个例子： [1,5,3,8,2]。
　　我们要将此数组从小到大排序。通过冒泡的话，每次比较两个，那么第一次遍历数组，每一次比较的结果为：
　　
>原始数组：[1,5,3,8,2]
[1,5,3,8,2]--->[1,3,5,8,2]--->结果：[1,3,5,2,8]
第一次遍历数组的比较过程： 第一次：1 5   第二次：5 3 顺序错误，交换位置  第三次：5 8  第四次：8 2 顺序错误，交换位置。  
第二次遍历数组的比较过程：[1,3,5,2,8]-->[1,3,2,5,8]
第三次遍历数组的比较过程：[1,3,2,5,8]-->[1,2,3,5,8]
比较结束。

程序如下：

```js
    var arr = [1,5,3,8,2];
    k = arr.length
    while( k>0 ) {
        for(var i=0;i<arr.length;i++) {
            var num;
            if( arr[i]>arr[i+1] ){
                num = arr[i];
                arr[i] = arr[i+1];
                arr[i+1] = num;
            }
        }
        k--;
    }
```

### 2、插入排序

　　插入排序，假定数组的第一位为已排序数组，即后面的数组为未排序数组，此时要将后面的数组每次都挑出一个数，根据顺序插入到之前的已排序数组。
　　
　　代码如下：
　　
```js
    arr = [2,1,5,2,1];
    window.onload = function(arr){
    for(i=1;i<arr.length;i++){  //循环遍历数组arr
      temp = arr[i];//定义一个变量来存储当前要进行插入的数组元素
      j = i;
      //开始定义内层循环 
      for(;j > 0 && arr[j-1] > temp;j--){
      //进行内层,循环如果这个变量前一个数据大于它，，则j--
        arr[j] = arr[j-1];
        //将上一个元素的值赋值给当前元素
      }
      //j-- -->j=j-1;
      arr[j] = temp;
    }
    alert(arr);
  }
```

### 3、选择排序

　　选择排序，通过定义一个下标，定义一个“最小数”。每次遍历数组，都将每个数的下标赋给游标，将第一个数赋给“最小数”。当向后查找元素时，当找到一个更小数时，游标切换到此数，同时“最小数”切换到此处。当查找到终点时，将最小数赋值给第一个数，同时第一个数赋值给查找到最小数的位置。

```js
    var p = [2, 4, 3, 1, 7, 5, 6, 9, 6, 0];
    function sorrt(ary) {
        length = ary.length;
        for (var i = 0; i < length; i++) { //开始循环
            min = ary[i]//定义“最小数”
            k = i;//定义游标
            for (var j = i + 1; j < length; j++) { // 开始内层循环
                if ( min > ary[j] ) { //如果当前最小数大于循环到的数
                    min = ary[j];//将当前值赋值给最小数
                    k = j;游标切换到此处
                }
            }//循环结束
            //交换位置
            ary[k] = ary[i];
            ary[i] = min;
        }
        return ary;
    }
alert(pp);　　
```

### 4、快速排序

　　  这并不是最好的快速排序，因为每次都会产生两个新数组。

```js
	function quickSort(arr){
	    if(arr.length<=1){
	        return arr;//如果数组只有一个数，就直接返回；
	    }
	    var num = Math.floor(arr.length/2);//找到中间数的索引值，如果是浮点数，则向下取整
	    var numValue = arr.splice(num,1);//找到中间数的值
	    var left = [];
	    var right = [];
	    for(var i=0;i<arr.length;i++){
	        if(arr[i]<numValue){
	            left.push(arr[i]);//基准点的左边的数传到左边数组
	        }
	        else{
	            right.push(arr[i]);//基准点的右边的数传到右边数组
	        }
	    }
	    return quickSort(left).concat(numValue,quickSort(right));//递归不断重复比较
	}
	alert(quickSort([32,45,37,16,2,87]));//弹出“2,16,32,37,45,87”
```
