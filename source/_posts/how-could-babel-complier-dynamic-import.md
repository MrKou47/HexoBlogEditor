title: Dynamic import 介绍
date: 2018-03-27 20:19:41
tags:
 - babel
 - 编译相关
---

## 前言

Dynamic import相对于 static import提供了一种新的 *function-lick* 的形式来实现 *import*。这篇文章通过介绍这两种 *import* 的方式来解释两者的差异，同时也根据 *babel* 来学习一下 babel 对于此新语法的处理。

<!--more-->

## Static import

早在去年九月(2017.09)，chrome 61开始支持在模块系统中使用 *es2015* 的 *import* 语法。

观察下面的 `./utils.mjs` 模块：

```js
// Default export
export default () => {
  console.log('Hi from the default export!');
};

// Named export `doStuff`
export const doStuff = () => {
  console.log('Doing stuff…');
};
```

我们可以使用 `import Utils, { doStuff } from './utils.mjs';` 来调用此模块。如下代码：

```html
<script type="module">
  import * as module from './utils.mjs';
  module.default();
  // → logs 'Hi from the default export!'
  module.doStuff();
  // → logs 'Doing stuff…'
</script>
```

> 🌟 注意: 上面的栗子使用`.mjs`作为拓展名来标示这是一个模块而不是一个普通的script脚本。在浏览器上，文件的拓展名并不是很有用，这完全取决于请求资源的 Content-type中定义的文件 MIME type(比如js文件的 text/javascript)。.mjs 扩展名在诸如 Node.js 之类的其他平台上特别有用，其中没有 mime 类型或其他钩子的概念，例如 type =“module” 来确定某事是模块还是普通脚本。
我们在此使用相同的扩展来实现跨平台的一致性，并明确区分模块和常规脚本。

这种引入模块的语法形式是 **static** declaration。它只接收字符串来当作模块标示符。并在代码运行前调用一个 *link process* 来将模块绑定到本地作用域。静态 `import` 语法只能在文件顶层使用。静态 `import` 让一些重要的 use case 得以实现，诸如 静态分析，绑定工具，和树状结构。

但是在一些情况下，比如：

- 按需加载（或在指定情况下加载代码）
- 在 runtime 中计算模块标示符
- 从常规脚本中加载模块（而不是模块文件）

**static** import 就不能实现了。

## Dynamic import 🔥

**Dynamic** `import` 提供了一种 *function-like* import模式实现以上case。`import(moduleSpecifier)`为所请求的模块返回一个带有模块命名空间对象的 *Promise*。它是在获取，实例化模块依赖以及模块本身之后创建的。

下面是一个动态引入模块的栗子：
```html
<script type="module">
  const moduleSpecifier = './utils.mjs';
  import(moduleSpecifier)
    .then((module) => {
      module.default();
      // → logs 'Hi from the default export!'
      module.doStuff();
      // → logs 'Doing stuff…'
    });
</script>
```
> 注意: 虽然 import() 像是一个 *function call*，但实际上它是一个特殊的语法标示，类似与 `super()`, 都是使用括号的语法标示。这也就意味 `import` 并不继承自 `Function.prototype`，所以你不能在 `import` 上使用 `call` 或者 `apply`。同时类似于 `const importAlias = import` 这样的声明语句同样也不会有效果———— `import` 从不是一个对象

下面是一个在单页应用中利用 `import` 实现 *lazy-load* 的一个栗子：

```html
<!DOCTYPE html>
<meta charset="utf-8">
<title>My library</title>
<nav>
  <a href="books.html" data-entry-module="books">Books</a>
  <a href="movies.html" data-entry-module="movies">Movies</a>
  <a href="video-games.html" data-entry-module="video-games">Video Games</a>
</nav>
<main>This is a placeholder for the content that will be loaded on-demand.</main>
<script>
  const main = document.querySelector('main');
  const links = document.querySelectorAll('nav > a');
  for (const link of links) {
    link.addEventListener('click', async (event) => {
      event.preventDefault();
      try {
        const module = await import(`/${link.dataset.entryModule}.mjs`);
        // The module exports a function named `loadPageInto`.
        module.loadPageInto(main);
      } catch (error) {
        main.textContent = error.message;
      }
    });
  }
</script>
```

如果语法正确，那么 `import` 将会发挥它强大的作用。

## babel 中的 import syntax

**Dynamic** `import` 在 [Stage 3 Draft / November 6, 2017](https://tc39.github.io/proposal-dynamic-import/#sec-finishdynamicimport) 提出。那么 *Babel* 推荐使用 [babel-plugin-dynamic-import](https://www.npmjs.com/package/babel-plugin-dynamic-import) 来帮助 *Babel* 解析此语法。此插件也非常简单，只有寥寥数行代码：

```js
// babel-plugin-syntax-dynamic-import/src/index.js
"use strict";

exports.__esModule = true;

exports.default = function () {
  return {
    manipulateOptions: function manipulateOptions(opts, parserOpts) {
      parserOpts.plugins.push("dynamicImport");
    }
  };
};

module.exports = exports["default"];
```
实际上也就是在 parse 的过程中启用了内部插件 `dynamicImport`。那么 *babel* 是如何使用此插件的呢？
此时我们需要先了解一下 babel 的语法解析机制。我们知道 *babel* 使用 *babylon* 作为js语法解析的工具。那么对于新语法的支持应该在 *babylon* 中实现。而 `import` 作为 *esModule* 中的一个关键字，*babylon* 早已支持解析此关键字，但语法只支持 **static** `import` 的形式。
这个解析过程比较复杂，简单来说：*babylon* 在获取一个关键字后，会继续分析后续的语法。当拿到了 `preType` 与 `type` 之后，*babylon* 去找相应的 parse function，比如对于 `const a = 2` 这样的语句，*babylon* 就提供了 `parseVarStatement` 这样的函数来解析并生成 AST 中的 Node。在这样的函数中同时还会再次check一下 `preType` 与 `type`的正确性。如果没有相应的 parse function，或者在parse function中对 type 的解析出错，那么babylon就会抛出异常。

讲了这么多，我们在从代码层面看一下 *babylon* 对于 **Dynamic** `import` 的支持。

### 解析过程

**示例代码：**
```js
// index.js
const importPromise = import('./util.js');
```

**解析过程(babylon)：** 

首先， *Babylon* 内置了一些常量，如 keywork map，keyword type map。用来在之后的 parse 过程中使用。

1. initial Parse Object(ignore file配置, plugin配置, 传入要解析的字符串)
2. 生成AST节点(File Node, Program Node)
3. 开始解析程序中的第一个关键字 [this.nextToken()](https://github.com/babel/babel/blob/master/packages/babylon/src/parser/index.js#L36)
 - 经过一系列判断后（是否需要skipSpace，是否已经完成所有字符的解析，是否需要override），调用 [readToken()](https://github.com/babel/babel/blob/ab7d1231ad6bab4e13199038c58e7ea3ae1e9e27/packages/babylon/src/tokenizer/index.js#L213) 来开始解析字符
 - 对第一个字符的ASCII码进行判断来决定是否继续解析，如果是正确的字符，则调用  [readWord](https://github.com/babel/babel/blob/ab7d1231ad6bab4e13199038c58e7ea3ae1e9e27/packages/babylon/src/tokenizer/index.js#L1297)方法来获取第一个词。
 - readWord 首先调用 [readWord1](https://github.com/babel/babel/blob/ab7d1231ad6bab4e13199038c58e7ea3ae1e9e27/packages/babylon/src/tokenizer/index.js#L1248)。此方法是分词的重要方法。使用了一个 `while` 来获取并返回第一个**非正常字符([isIdentifierChar()](https://github.com/babel/babel/blob/ab7d1231ad6bab4e13199038c58e7ea3ae1e9e27/packages/babylon/src/util/identifier.js#L98), 可对照 ASCII 表自行理解)**之前的单词。此时解析后返回 `const` 字符串。
 - readWord 方法分析 `const` 字符串。如果匹配出此字符串为关键词，则 **更新解析器的状态** 的 type 为 constType，然后调用 [finishToken](https://github.com/babel/babel/blob/ab7d1231ad6bab4e13199038c58e7ea3ae1e9e27/packages/babylon/src/tokenizer/index.js#L388)
 - finishToken 方法 **更新解析器的状态** 的 pos(position) 为当前已经解析到的pos。然后调用 updateContext 看是否需要用当前的 type 来更新之前的 preType。此时，整个 nextToken 调用栈全部完成
4. 调用 [parseTopLevel](https://github.com/babel/babel/blob/ab7d1231ad6bab4e13199038c58e7ea3ae1e9e27/packages/babylon/src/parser/index.js#L37) 来开始整个程序的解析
 - 调用 parseBlockBody 来解析接下来的代码。如果当前的 type 不是 eof，则调用 [parseStatement](https://github.com/babel/babel/blob/f0d681a238d1d80fc7ca3a1bbcfd4d3d03f5c12f/packages/babylon/src/parser/statement.js#L67)
 - 此方法分析 **解析器状态** 中的 type，根据不同的 type 来调用不同的解析函数。在 *babylon* 中，`var let const` 均调用 [parseVarStatement](https://github.com/babel/babel/blob/f0d681a238d1d80fc7ca3a1bbcfd4d3d03f5c12f/packages/babylon/src/parser/statement.js#L547)。
 - parseVarStatement 首先调用 `this.next()` 方法来拿到后续的代码(变量名)。 `this.next()` 方法会再次调用 `nextToken()` 来获取后面的字符串并进行解析。也就是重复第三个步骤。拿到了之后，调用 `parseVarHead -> parseBindingAtom -> parseIdentifier` 来生成 `VarStatement Node`中的 `Identifier Node`，同时再次调用 `this.next()` 方法来获取下一个标识符
 - 拿到下一个标识符后，对此标识符进行分析，如果是 `=`, 则 **再次** 调用 `this.next()`(此时是使用 [this.eat()](https://github.com/babel/babel/blob/f0d681a238d1d80fc7ca3a1bbcfd4d3d03f5c12f/packages/babylon/src/parser/statement.js#L770) 方法来确认是否需要调用) 来获取下一个标识符(也就是要赋予 importPromise 的值)，此时再次重复第三个步骤
 - 完成上一步后，此时 **解析器状态** 的 value 为 `'import'`, 同时 import 作为关键词也有他的类型，因此此时此时 **解析器状态** 的 type 为 `KeywordTokenType`。 此时调用 `this.parseMaybeAssign()` 来做下一步处理。
 - 此时进入 `this.parseMaybeAssign()` 函数。因为对变量的赋值可能会有很多种情况，如 `var a = () => {}`, `var a = true ? 0 : 1`, `var a = await xxx`等等，所以此函数的调用栈较长，对于处理我们的case来说，调用栈为 `parseMaybeAssign -> parseMaybeConditional -> parseExprOps -> parseMaybeUnary -> parseExprSubscripts -> parseExprAtom`。在 `parseExprAtom` 函数中，会针对当前**解析器状态** 的 type 来执行不同的方法。此时函数执行到 [case types._import](https://github.com/babel/babel/blob/ab7d1231ad6bab4e13199038c58e7ea3ae1e9e27/packages/babylon/src/parser/expression.js#L732) 处。
 - 此时会对 Parser 的插件配置做判断，说是插件，其实就是 *babylon* 预设的一些功能。如果未启用 `DynamicImport`，babylon就会报 Unexpected token 的错误。如果启用了，则会调用 this.next() 来继续解析后面的字符，直到生成一个完整的 **Import 节点**。
 - 上一步步执行完成后，回到 `parseMaybeAssign` 函数，此函数返回 Import Node。 回到 parseVar 函数，将未完成的 Identifier 节点的init的值设为Import Node。同时执行 `this.finishNode` 函数表示此 Identifier 节点已经全部生成成功。 回到 `parseVarStatement` 函数，再次执行 `this.finishNode` 表示 VariableDeclaration 节点也已经全部处理完成
5. 至此，解析过程全部完成。回到最初的 `parseTopLevel` 函数，通过执行 `file.program = this.finishNode(program, "Program");`, `return this.finishNode(file, "File");` 后，我们终于完成了代码的解析，并得到了我们代码的AST语法树。

实际上，我们可以把 *babylon* 解析代码的过程简单理解为：提取关键字 -> 继续解析后面的代码直到能完整的生成之前关键字的AST节点 -> 调用了finishToken，然后继续生成下一个节点 -> 解析到文件结尾，结束 这样一个过程。 重点的过程就是在解析到一个keyword之后对后面字符的解析。*babylon* 对特定的语法都有相关的函数来完成接下来的解析，如 `parseVarStatement`, `parseIfStatement` 等等。每一个 keyword 对应的解析函数，都对接下来的 解析到的 *单词 or 字符* 都有相应的期望值，*babylon* 会在此处来决定是继续解析来完成当前节点的渲染还是抛出异常。

## 后话

作者本来在使用 [react-universal-component](https://github.com/faceyspacey/react-universal-component) 出现了问题无法解决，遂打算自己实现一下这种 component，没想到竟然走到了这个地方。。
本文对于 *babylon* 的解析过程的解释还是忽略了很多细节的成分，同时也仅仅对 变量声明 这个case做了分析。并且，对于自定义的 babel plugin 的使用场景还未做分析，而仅仅分析了内置的 plugin 的使用场景。但实际上 *babylon* 的核心也就是这些东西。通过理解这样一个生成 AST 的过程，以后也可以尝试着写一个自己的 js parser。毕竟 ECMA  也只是约定了语法规范而没有约定 AST 的规范。

*TO BE CONTINUE*
 

[tc39/proposal-dynamic-import](https://tc39.github.io/proposal-dynamic-import)
[google/dynamic-import](https://developers.google.com/web/updates/2017/11/dynamic-import)
[medium/dynamic-import](https://medium.com/@WebReflection/javascript-dynamic-import-export-b0e8775a59d4)
