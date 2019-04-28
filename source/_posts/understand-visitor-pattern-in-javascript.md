title: 学习访问者模式
date: 2018-03-29 11:41:55
tags:
 - javascript
 - 设计模式
---


最近在学习如何写一个 *babel-plugin* 的时候，发现 babel 在设计插件系统的时候，使用了 visitor pattern，遂学习了一下此模式，记录于此。

<!--more-->

### 定义

表示要在具有对象结构的元素上进行的操作。Visitor 能保证在不改变被操作元素的类的时候同时对元素进行新的操作。

使用频率(*in Javascript*): ![frequency][1] low

### 概要

访问者模式在不改变集合中对象的时候同时为对象集合定义新的操作。新的逻辑定义在一个叫做 *Visitor* 的单独对象中。

**访问者模式在构建库或者框架的可拓展性的时候非常有用**。如果你项目中的对象向外暴露 'visit' 方法，这个方法可以接收一个用于修改当前对象的Visitor Object。那么实际上你已经为client实现了创建未来拓展的方法。

在大多数的编程语言中，访问者模式要求开发者预期未来将会出现的功能调整。这是通过在类中增加可以接受 *Visitor* 的方法来完成的。

### 示意图

![diagram][2]

### 包含的部分

此模式中包含：

- 对象集合：维护了一个可遍历的元素的集合
- 元素
  - 定义一个能够接收 *Visitor* 的 `accept` 方法
  - 在 `accept` 方法中，使用 `this` 来调用 *Visitor* 的 `visit` 方法
- Visitor
  - 实现一个 `visit` 方法。参数是被访问的元素。这里也是实现元素变化的地方

### 简单的栗子
  
  在接下来的栗子中，我们创建三个员工，每一个员工都将获得10%的涨薪和2天的额外假期。我们使用访问者模式来实现此功能。
  
```js
 var Employee = function (name, salary, vacation) {
    var self = this;
        
    this.accept = function (visitor) {
        visitor.visit(self);
    };
 
    this.getName = function () {
        return name;
    };
 
    this.getSalary = function () {
        return salary;
    };
 
    this.setSalary = function (sal) {
        salary = sal;
    };
 
    this.getVacation = function () {
        return vacation;
    };
 
    this.setVacation = function (vac) {
        vacation = vac;
    };
};
 
var ExtraSalary = function () {
    this.visit = function (emp) {
        emp.setSalary(emp.getSalary() * 1.1);
    };
};
 
var ExtraVacation = function () {
    this.visit = function (emp) {
        emp.setVacation(emp.getVacation() + 2);
    };
};
 
// log helper
 
var log = (function() {
    var log = "";
 
    return {
        add: function(msg) { log += msg + "\n"; },
        show: function() { alert(log); log = ""; }
    }
})();
 
function run() {
        
    var employees = [
        new Employee("John", 10000, 10),
        new Employee("Mary", 20000, 21),
        new Employee("Boss", 250000, 51)
    ];
 
    var visitorSalary = new ExtraSalary();
    var visitorVacation = new ExtraVacation();
        
    for (var i = 0, len = employees.length; i < len; i++) {
        var emp = employees[i];
            
        emp.accept(visitorSalary);
        emp.accept(visitorVacation);
        log.add(emp.getName() + ": $" + emp.getSalary() +
            " and " + emp.getVacation() + " vacation days");
    }
 
    log.show();
}
```

上面的代码中，每一个员工都有一个相应的访问者对象用来操作员工对象。

## Reference

[visitor-design-pattern][3]
[how-to-implement-visitor-pattern-in-javascript][4]
[访问者模式][5]


  [1]: http://www.dofactory.com/images/use_low.gif
  [2]: http://www.dofactory.com/images/diagrams/javascript/javascript-visitor.jpg
  [3]: http://www.dofactory.com/javascript/visitor-design-pattern
  [4]: https://stackoverflow.com/questions/9831415/how-to-implement-visitor-pattern-in-javascript
  [5]: http://blog.csdn.net/cooldragon/article/details/52177273