let arr = [1, 2, 3];
console.log(arr[Symbol.isConcatSpreadable]);
console.log([4, 5].concat(arr));
arr[Symbol.isConcatSpreadable] = false;
console.log([4, 5].concat(arr));