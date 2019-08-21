# 回调地狱与Promise
> 在ES5以及ES5之前，异步操作结果对应的逻辑处理，都是放在回调中。回调保证了异步的`事件触发时机`和`逻辑代码的执行顺序`，但是也带来了头疼的`回调地狱`问题。
## 回调地狱
> 模拟异步`回调层级过多`的情况
```php
// 后端代码，使用PHP做接口，并模拟5s的网络延迟
<?php
    // 使用sleep方法延迟5s，模拟较高的网络延迟
    sleep(5);
    // 返回的数据，无关紧要
    $data = [
        'res' => '0',
        'msg' => 'success',
        'data' => [
            ['id' => 0, 'name' => 'zhangsan'],
            ['id' => 1, 'name' => 'lisi'],
            ['id' => 2, 'name' => 'wangwu'],
        ]
    ];
    echo json_encode($data);
```
```js
// 前端JS代码，正常情况下，验证用户名、密码和验证码可以在一次ajax请求中处理完成。这里将这一步骤拆分成三个请求。
function sendAjax(url, data, successCB, errorCB) {
    $.ajax({
        url: url,
        type: 'POST',
        dataType: "json",
        data : data,
        success: function(res){
            successCB && successCB(res);
        },
        error: function (res) {
            errorCB && errorCB(res);
        }
    });
}
// 模拟：如果将登录时验证用户名、密码和验证码的步骤拆分成三个ajax请求
// 验证用户名
sendAjax('http://127.0.0.1:8000/phpserver', {}, function (res) {
    // 逻辑代码...
    // 验证密码
    sendAjax('http://127.0.0.1:8000/phpserver', {}, function (res) {
        // 逻辑代码...
        // 校验验证码
        sendAjax('http://127.0.0.1:8000/phpserver', {}, function (res) {
            // 逻辑代码...
            console.log(res);
            // 假如后续还有其他ajax请求
            // TODO...
        }, function (res) {
            console.log(res);
        });
    }, function (res) {
        console.log(res);
    });
}, function (res) {
    console.log(res);
});
```
> 上面的层层回调嵌套，就是JavaScript的`回调地狱`。但是ES6之后新增了`Promise`，它能有效解决`JS的回调嵌套`问题。
```js
// 上面的JS代码，转换成Promise形式，如下：
function sendAjax(url, data) {
    // 返回一个Promise对象，由于Promise是一个构造函数，这里需要使用new关键字进行实例化
    return new Promise(function (resolve, reject) {
        $.ajax({
            url: url,
            type: 'POST',
            dataType: "json",
            data : data,
            success: function(res){
                // resolve方法触发对应Promise对象下的then方法。
                resolve(res);
            },
            error: function (res) {
                // reject方法触发对应Promise对象下的catch方法，如果使用链式调用，则只会存在一个catch方法，即多步（链式）操作中只要一步错误，就会触发catch方法并中断操作。
                reject(res);
            }
        });
    });
}

let url = 'http://127.0.0.1:8000/phpserver';
let data = {};
// 验证用户名
sendAjax(url, data).then(function (res) {
    // 验证用户名成功之后的逻辑处理
    // TODO...
    console.log('验证用户名的请求结果', res);
    // 返回验证密码的请求（Promise对象），给下一个链式调用的then方法使用
    return sendAjax(url, data);
}).then(function (res) {
    // 验证密码成功之后的逻辑处理
    // TODO...
    console.log('验证密码请求', res);
    // 返回校验验证码的请求（Promise对象），给下一个链式调用的then方法使用
    return sendAjax(url, data);
}).then(function (res) {
    // 校验验证码成功之后的逻辑处理
    // TODO...
    console.log('校验验证码的请求结果', res);
}).catch(function () {
    // 任何一个异步请求失败的结果，都会跑到这里面进行处理，并中断当前异步请求之后的逻辑操作
    // TODO...
    // ...
});
```
可以看到，Promise的形式，使得JavaScript的异步回调处理以`近似同步`的代码编写（实际上请求仍是异步处理）。
## Promise
> ES6的Promise是为了解决回调地狱的问题而出现的，它用`链式调用`的形式替代了原先的`回调嵌套`形式（jQuery的`deferred`也属于Promise范畴）。链式调用不是JavaScript的新语法（jQuery使用的就是链式语法）。
### Promise是什么
> 在JavaScript中，Promise是内置的一个`构造方法`。在使用时，需要使用`new`关键字进行实例化。

参照[`Promise的前世今生和妙用技巧`](https://www.cnblogs.com/whitewolf/p/promise-best-practice.html)介绍如下：

* 英文的意思是`承诺`，它表示如果A调用一个长时间处理任务B时，B会返回一个`“承诺”`给A，A则继续执行其他任务。当B完成任务时，会通过A并执行与A之间预先约定的回调。
* `jQuery`的`deferred`也属于Promise范畴，而`deferred`在英语中意为`“延迟”`。说明Promise解决的问题是一种带有延迟性的事件，这个事件会被延迟到未来某个合适的时机再执行。

参照`阮一峰`出版的[`《ECMAScript6入门》`](http://es6.ruanyifeng.com/)介绍如下：

* Promise简单说就是一个容器，里面保存着某个未来才会结束的事件（通常是一个异步操作）的结果。
* Promise提供统一的API，各种异步操作都可以使用同样的方法进行处理，使得控制异步操作更加容易。
* 有了Promise对象，就可以将异步操作以同步操作的流程表达出来。
### Promise对象的规范
* Promise对象有三种状态：

| 状态      | 意义                         |
| --------- | ---------------------------- |
| Pending   | 进行中，等待任务的完成或被拒绝。|
| Fulfilled | 任务执行完成并且成功的状态。    |
| Rejected  | 任务完成并且失败的状态。       |

* Promise的状态只可能从`pending`状态转到`fulfilled`状态或`rejected`状态，且`不可逆向转换`。同时`fulfilled`和`rejected`状态也不能相互转换。
* Promise对象必须实现`then方法`，then是Promise规范的`核心`。
* Promise的then方法`必须返回`一个Promise对象，同一个Promise对象可以调用`多个then方法`，并且回调的执行顺序跟它们的注册顺序一致。
* then方法接收两个参数，分别为`成功回调`和`失败回调`。分别在`Padding转到fulfilled`和`Padding转到rejected`时调用。
* 当在链式调用结尾使用了`catch方法`时，并且`then方法`不传`第二参数`，在当前链式操作中，`首个失败回调`会在catch中执行，并且中断后面的异步操作。

![avatar](/Promise/promises-流程图.png)

### Promise的作用
> `Promise`可以将原来回调地狱中的回调函数，从`横向式增加`变为`纵向增长`。以`链式的风格`和`纵向的书写`，使得代码拥有`更好的可读性`和`易于维护`。
### Promise和async、await的关系
> 在`ECMAScript2016（ES7）`中引入了`async`和`await`两个关键字，用于解决这类异步任务。这两个关键字是`ES6`中的`生成器（generator）`和`Promise`的组合新语法，`内置generator的执行器`的一种方式。

## Promise的基本使用
### 创建Promise实例
> Promise是ES6中新增的一个内置的构造函数

![avatar](/Promise/PromiseConstructor.png)

> 所以需要使用new关键字实例化一个Promise实例。并且传入一个匿名函数，匿名函数传入两个参数：`resolve（成功回调）`和`reject（失败回调）`。在函数体中进行逻辑判断，并使用resolve或reject触发对应的回调。

ps：`resolve（成功回调）`和`reject（失败回调）`的名称可以自行定义。
```js
let p = new Promise(function (resolve, reject) {
    if (true) {
        resolve(true);
    }else{
        reject(false);
    }
});
console.log(p);
```
上面就是Promise的简单使用，当使用resolve回调方法时，Promise对象的状态便切换到resolved（fulfilled，成功的状态）。输出如下：

![avatar](/Promise/PromiseObject.png)

上面方法仍有局限性。比如通常封装ajax请求的方法，都需要向函数中传入url和数据集，实际效果如下：
```js
let url = 'http://127.0.0.1:8000/phpserver';
let p = new Promise(function (resolve, reject) {
    // 这里打印的url是直接访问父级作用域的变量
    console.log(url);
    $.ajax({
        url: url,
        type: 'POST',
        dataType: "json",
        data : {},
        success: function(res){
            resolve(res);
        },
        error: function (res) {
            reject(res);
        }
    });
});
```
上面这种方式传递参数，在函数体内直接访问父级作用域中的变量。十分不方便，而且容易因为父级作用域中的变量污染而影响到实际的逻辑处理。可以使用以下方式封装：
```js
function sendAjax(url) {
    // 这里访问的url是调用函数时传入的参数
    console.log(url);
    // 使用return返回一个Promise实例，与直接对变量赋值Promise实例是一样的，外部使用变量接收即可。
    return new Promise(function (resolve, reject) {
        $.ajax({
            url: url,
            type: 'POST',
            dataType: "json",
            data : {},
            success: function(res){
                resolve(res);
            },
            error: function (res) {
                reject(res);
            }
        });
    });
}
let p = sendAjax('http://127.0.0.1:8000/phpserver');
console.log(p);         // 这里打印Promise对象时，异步操作仍未完成，所以状态是pending。
```
![avatar](/Promise/1.png)

* 下面的代码示例，都使用上面封装的这个发送ajax请求的Promise对象。
## Promise实例的方法
### then方法
> Promise.prototype.then方法接收两个回调函数作为参数，第一个为resolve（解决/成功）的回调，第二个为reject（拒绝/失败）的回调。两个参数都可不传，不传则不会执行对应的回调体。
```js
let p = sendAjax('http://127.0.0.1:8000/phpserver');
p.then(function (cbData) {
    console.log(cbData);
}, function (cbData) {
    console.log(cbData);
});
```
* 解决（成功）的结果：

![avatar](/Promise/2.png)

* 模拟ajax请求失败时，拒绝（失败）的结果：

![avatar](/Promise/3.png)

* 如果不需要处理失败的回调，上面代码可以简化成如下：
```js
let p = sendAjax('http://127.0.0.1:8000/phpserver');
p.then(function (cbData) {
    console.log(cbData);
});
```
### then方法的链式调用
> 在Promise.prototype.then方法处理回调结束时，返回另一个Promise对象，这个Promise对象可以调用下一个then方法，形成链式调用。如下：
```js
let p = sendAjax('http://127.0.0.1:8000/phpserver');
p.then(function (cbData) {
    console.log(cbData);
    // 此处返回下一次ajax请求的Promise对象
    return sendAjax('http://127.0.0.1:8000/phpserver');
}).then(function (cbData) {
    console.log(cbData);
});
```
![avatar](/Promise/4.png)

* 如果上一步then方法没有返回Promise对象，当前then方法调用仍不会报错，但是回调接受的参数值都为undefined，如下：
```js
let p = sendAjax('http://127.0.0.1:8000/phpserver');
p.then(function (cbData) {
    console.log(cbData);
    // 此处返回下一次ajax请求的Promise对象
    sendAjax('http://127.0.0.1:8000/phpserver');
}).then(function (cbData) {
    console.log(cbData);
});
```
![avatar](/Promise/5.png)
### catch方法
> Promise.prototype.catch方法可以处理Promise对象中reject（拒绝/失败）的回调。如下：
```js
let p = sendAjax('http://127.0.0.1:8000/phpserver/index.html');     //此接口不存在
p.catch(function (cbData) {
    console.log(cbData);
});
```
![avatar](/Promise/6.png)

### then与catch的调用问题
> 当Promise.prototype.then方法和Promise.prototype.catch方法链式调用时，它们的顺序会影响到执行的结果。
#### 1.当先调用了then方法，且then的第二参数（reject的回调）存在，如下：
```js
let p = sendAjax('http://127.0.0.1:8000/phpserver/index.html');     //此接口不存在
p.then(function (cbData) {
    console.log(cbData);
}, function (cbData) {
    console.log(cbData);
}).catch(function (cbData) {
    console.error(cbData);
});
```
* reject触发的回调会进入then的第二个参数（回调函数）中处理，效果如下：

![avatar](/Promise/7.png)

#### 2.当先调用then方法，且then的第二参数（reject的回调）不传时，如下：
```js
let p = sendAjax('http://127.0.0.1:8000/phpserver/index.html');     //此接口不存在
p.then(function (cbData) {
    console.log(cbData);
}).catch(function (cbData) {
    console.error(cbData);
});
```
* reject触发的回调会进入catch方法中处理，效果如下：

![avatar](/Promise/8.png)

#### 3.当先调用catch方法时，且then的第二参数（reject的回调）存在，如下：
```js
let p = sendAjax('http://127.0.0.1:8000/phpserver/index.html');     //此接口不存在
p.catch(function (cbData) {
    console.error(cbData);
}).then(function (cbData) {
    console.log(cbData);
}, function (cbData) {
    console.log(cbData);
});
```
* reject触发的回调会进入catch方法中执行，且先调用catch方法后再链式调用then方法，catch方法中没有返回一个新的Promise对象，then方法会进入resolve回调，但是接受到的参数值为undefined。所以catch并不会中断后面其他方法的执行。如下：

![avatar](/Promise/9.png)

#### 4.所以，一般使用多个then链式调用时，将catch方法的调用放在结尾，并且多个then方法的第二参数都不传。这样如果遇到异步中的首个reject回调，都会进入catch方法中处理回调逻辑，且中断后续的其他异步操作。如下：
```js
let p = sendAjax('http://127.0.0.1:8000/phpserver');                //此接口正常使用
// 用多个then方法链式调用的方式发送三个ajax请求
p.then(function (cbData) {
    console.log(cbData);
    return sendAjax('http://127.0.0.1:8000/phpserver/1.html');      //此接口不存在
}).then(function (cbData) {
    console.log(cbData);
    return sendAjax('http://127.0.0.1:8000/phpserver/2.html');      //此接口不存在
}).then(function (cbData) {
    console.log(cbData);
}).catch(function (cbData) {
    console.error(cbData);
});
```
* 控制台打印出了第一个ajax请求的返回结果和首个ajax请求失败信息，效果如下：

![avatar](/Promise/10.png)

* 进入network中查看实际发送的ajax请求，实际上只成功发送一个请求。当出现第一个发送失败的请求后，后续的发送ajax请求的操作都被中断了，效果如下：

![avatar](/Promise/11.png)

## Promise构造器的方法
### all方法
> Promise.constructor.all方法接收一个可迭代的Promise对象集合（通常为数组）作为参数，它同时监听着传入的Promise对象的状态。
```js
let p1 = sendAjax('http://127.0.0.1:8000/phpserver');
let p2 = sendAjax('http://127.0.0.1:8000/phpserver');

let ps = Promise.all([p1, p2]);

// 由于都是异步任务，这里等待任务执行完毕再打印
setTimeout(function () {
    console.log(p1);
    console.log(p2);
    console.log(ps);
}, 15000);
```
![avatar](/Promise/12.png)
* all方法会“监听”传入的多个Promise对象的状态，当多个Promise对象都为fulfilled状态时，则触发resolve的回调。同时回调接收到的参数也是多个resolve回调传递的参数，顺序与Promise对象集合一致。如下：
```js
let p1 = sendAjax('http://127.0.0.1:8000/phpserver');
let p2 = sendAjax('http://127.0.0.1:8000/phpserver');

let ps = Promise.all([p1, p2]);

ps.then(function (cbData) {
    console.log(cbData);
});
```
![avatar](/Promise/13.png)
* 当多个Promise对象中有一个状态为rejected时，则触发reject的回调。如下：
```js
let p1 = sendAjax('http://127.0.0.1:8000/phpserver');
let p2 = sendAjax('http://127.0.0.1:8000/phpserver');

let ps = Promise.all([p1, p2]);

ps.then(function (cbData) {
    console.log(cbData);
});
```
![avatar](/Promise/14.png)
* 如果打开浏览器的network栏，可以看到多个ajax请求几乎是同时发送，说明Promise.constructor.all方法会同时（并行的方式）执行异步任务。待异步任务都执行完毕后，再根据Promise集合的整体状态触发对应的回调。
![avatar](/Promise/15.png)