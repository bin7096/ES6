# L-1 let 和 coust
## let 和 var的区别

> var

作用域：全局作用域和函数作用域。

允许相同作用域内重复定义同个变量，重新定义后覆盖原有值。

存在变量提升(浏览器预解析)的问题，定义的变量会被提升到作用域顶部并初始化为undefined。

> let

作用域：块级作用域 {代码块}。定义的变量只绑定在当前作用域中，不受父级块和子块的影响。

同一作用域中不允许重复定义同一变量。

不存在变量提升问题，未定义时在变量作用域顶部不会初始化，定义但不赋值会初始化为undefined，在定义变量之前调用会报错。

<font color="red">注意：for( ... 此处为父级块 ... ) { ... 此处为子块 ... }</font>

```js
//////////////////////////////作用域////////////////////////////////
//var
for(var i=0; i<10; i++){ //i为全局作用域
    //TODO
}

alert(i); //输出10

//let
for(let i = 0; i<10; i++){
    console.log(i); //依次输出0-9
}

alert(i);   //报错：i is not defined

//let
var tmp = 123;
if (true) {
  tmp = 'abc'; // ReferenceError
  let tmp;
}
alert(tmp);  //输出值为123，全局tmp与局部tmp不影响

//////////////////////////////变量提升////////////////////////////////
//var
console.log(foo); // 输出undefined
var foo = 2;

//相当于
var foo;  //声明且初始化为undefined
console.log(foo);
foo=2;

//let
console.log(bar); // 报错ReferenceError
let bar = 2;    
//相当于在第一行先声明bar但没有初始化，直到赋值时才初始化

//let
let a;
alert(a);//值为undefined
alert(b);//会报错
let b;

//////////////////////////////作用域内重复定义变量////////////////////////////////
//var
function () {
  var a = 10;
  var a = 1;    //不报错
}
//let
function () {
  let a = 10;
  var a = 1;    //报错
}
// 报错
function () {
  let a = 10;
  let a = 1;    //报错
}
```

## const
const与let特性基本一样，只是适用于定义常量，定义后无法修改。

const定义常量时必须赋值。

<font color="red">由于对象或数组内部某个值赋值时使用的是对象或数组引用，所以不会报错</font>

```js
const arr = [0,1,2];
arr = [];   //报错，Uncaught TypeError: Assignment to constant variable.
console.log(arr);

///////////////////////////////////////////////////////////////////////

const arr = [0,1,2];
arr[0] = 3;
console.log(arr);   //输出[3, 1, 2],不会报错
```