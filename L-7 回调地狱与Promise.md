# `回调地狱`与`Promise`
> 在ES5以及ES5之前，异步操作结果对应的逻辑处理，都是放在回调中。回调保证了异步的`事件触发时机`和`逻辑代码的执行顺序`，但是也带来了头疼的`回调地狱`问题。
## 回调地狱
> 模拟异步回调层级过多的情况
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
ES6的Promise是为了解决回调地狱的问题而出现的，它用`链式调用`的形式替代了原先的`回调嵌套`形式。链式调用不是JavaScript的新语法（jQuery使用的就是链式语法）。

> Promise简单说就是一个容器，里面保存着某个未来才会结束的事件（通常是一个异步操作）的结果。
> Promise提供统一的API，各种异步操作都可以使用同样的方法进行处理，使得控制异步操作更加容易。
> 有了Promise对象，就可以将异步操作以同步操作的流程表达出来。