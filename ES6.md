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

# L-2 解构赋值
## ES5
在ES5中，开发者们为了从对象和数组中获取特定数据并赋值给变量，编写了许多看起来同质化的代码
```js
let options = {
    repeat: true,
    save: false
};
// 从对象中提取数据
let repeat = options.repeat,
save = options.save;
```
这段代码从options对象中提取repeat和save的值，并将其存储为同名局部变量，提取的过程极为相似

如果要提取更多变量，则必须依次编写类似的代码来为变量赋值，如果其中还包含嵌套结构，只靠遍历是找不到真实信息的，必须要深入挖掘整个数据结构才能找到所需数据

## ES6
ES6添加了解构功能，将数据结构打散的过程变得更加简单，可以从打散后更小的部分中获取所需信息
> 对象解构
```js
let json ={
    name:'Strive',
    age:18,
    job:'码畜'
};
let {name, age, job} = json;
console.log(name, age, job);

////////////////////////////

let {name, age, job} = {
    name:'Strive',
    age:18,
    job:'码畜'
};
console.log(name, age, job);
```
<font color="red">注意：下面这种情况，一定要用一对小括号包裹解构赋值语句，JS引擎将一对开放的花括号视为一个代码块。语法规定，代码块语句不允许出现在赋值语句左侧，添加小括号后可以将块语句转化为一个表达式，从而实现整个解构赋值过程</font>
```js
let json = {
    name: 'zhangsan',
    age: 25,
    sex: 1
}
name = 'lisi';
age = 26;
sex = 0;
// {name, age, sex} = json;    //报错，Uncaught SyntaxError: Unexpected token =
({name, age, sex} = json);
console.log(name, age, sex);    //输出zhangsan 25 1
```
> 数组解构
```js
let [u1, u2, u3, u4] = ['zhangsan', 'lisi', 'wangwu', 'zhaoliu'];
console.log(u1, u2, u3, u4);    //zhangsan lisi wangwu zhaoliu

let arr = ['zhangsan', 'lisi', 'wangwu', 'zhaoliu'];
[u1, u2, u3, u4] = arr;
console.log(u1, u2, u3, u4); //zhangsan lisi wangwu zhaoliu
```
<font color="red">解构时，左边变量不需要与右边一致，但是层级结构需要对应</font>
```js
//不对应
let [u1, u2, u3, u4] = ['zhangsan', 'lisi', ['wangwu', 'zhaoliu']];
console.log(u1, u2, u3, u4);    //zhangsan lisi (2) ["wangwu", "zhaoliu"] undefined

//对应且一致
[u1, u2, [u3, u4]] = ['zhangsan', 'lisi', ['wangwu', 'zhaoliu']];
console.log(u1, u2, u3, u4);    //zhangsan lisi wangwu zhaoliu

//对应但不一致
[u1, u2, [u3]] = ['zhangsan', 'lisi', ['wangwu', 'zhaoliu']];
console.log(u1, u2, u3);    //zhangsan lisi wangwu
```
> 数组长度
```js
let {length} = ['zhangsan', 'lisi', 'wangwu', 'zhaoliu'];
console.log(length);    //4
```
> 不定元素解构
```js
let [first, ...colors] = ['red', 'blue', 'green', 'orange'];
console.log(first);     //red
console.log(colors);    //["blue", "green", "orange"]
console.log(colors.length);     //3
console.log(colors[0], colors[1], colors[2]);   //blue green orange
```
> 数组复制
### ES5
```js
var colors = ['red', 'blue', 'green', 'orange'];
var cloneColors = colors.concat();  //concat()设计初衷是用来连接两个数组，不传参时会返回当前函数的副本
console.log(cloneColors);   //["red", "blue", "green", "orange"]
```
### ES6
```js
let colors = ['red', 'blue', 'green', 'orange'];
let [...cloneColors] = colors;
console.log(cloneColors);   //["red", "blue", "green", "orange"]
```
> 默认值
```js
let [first, second = 'green'] = ['red'];
console.log(first);     //red
console.log(second);    //green
```
```js
let [first, second = 'green'] = ['red', 'blue'];
console.log(first);     //red
console.log(second);    //blue
```
> 互换值操作
### ES5
```js
var a = 'zhangsan';
var b = 'lisi';
//a和b交换值
var c = a;
a = b;
b = c;
console.log(a, b);  //lisi zhangsan
```
### ES6
```js
let a = 'zhangsan';
let b = 'lisi';
//a和b交换值
[b, a] = [a, b];
console.log(a, b);  //lisi zhangsan
```
> 字符串解构

字符串也可以解构赋值。这是因为，字符串被转换成了一个类似数组的对象
```js
let [a, b, c, d, e] = 'hello';
console.log(a); //h
console.log(b); //e
console.log(c); //l
console.log(d); //l
console.log(e); //o
```
类似数组的对象都有一个length属性，因此还可以对这个属性解构赋值
```js
let {length} = 'hello';
console.log(length);    //5
```