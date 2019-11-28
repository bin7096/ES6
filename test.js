function* fn(x) {
    var y = yield (1 + 1);
    yield y;
    yield x;
}
let f = fn(5);
console.log(f.next());
console.log(f.next(12));
console.log(f.next(1));
console.log(f.next(1));