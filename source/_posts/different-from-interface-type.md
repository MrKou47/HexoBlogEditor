title: typescript interface 与 type 声明类型的区别
date: 2017-01-27 11:50:13
categories: 技术
tags: 
 - typescript
---

最近做项目用的是 `ant design`, 正好也是用 `ts` 写的, 就顺便看了看源码。结果发现有些类型声明还用了 `type` 来写(这是什么鬼), 于是赶紧google一下, 搁这里记录一手
<!-- more -->


*refer:* [stackoverflow: typescript-interfaces-vs-types][1]

Q: 在 *typescript* 中, 我们定义类型有两种方式： 接口(interface) 和类型别名(type alias)
```ts
interface Child {
  name?: string;
  age?: number;
  hobby?: Array<string>;
}

type Child = {
  name?: string;
  age?: number;
  hobby?: Array<string>;
}
```
这两种定义方式有什么区别？

A: 在官方文档中我们可以看到: 

> Unlike an interface declaration, which always introduces a named object type, a type alias declaration can introduce a name for any kind of type, including primitive, union, and intersection types.
不同于 interface 只能定义对象类型， type 声明的方式可以定义组合类型，交叉类型，原始类型。


但如果用 `type alias` 声明的方式，会导致一些功能的缺失：

 1.  *interface* 方式可以实现接口的 *extends* 和 *implements* ， 而 *type alias* 则不行。
 2.  *interface* 可以实现接口的 *merge* ，但 *type alias* 则不行。

example:

```ts
    interface C {
        a: string;
    }
    interface C {
        b: number;
    }
    const obj:C = {
        a: '',
    }; // Error: Type '{ a: string; }' is not assignable to type 'C'.  Property 'b' is missing in type '{ a: string; }'.
    
    type C =  {
        a: string;
    }
    // Error:  Duplicate identifier 'C'.
    type C =  {
        b: number;
    }
        
```
 
 
  [1]: https://stackoverflow.com/questions/37233735/typescript-interfaces-vs-types "typescript-interfaces-vs-types"