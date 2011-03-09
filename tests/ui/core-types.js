var ui = require('lui');

// ==== Array.prototype.forEach ====
var value, obj;
value = 0;
obj = [1,2,3,4,5];
if (!obj.forEach) { alert('Array.prototype.forEach: undefined') }
obj.forEach(function(v,i) { value += v + i });

if (value != (1+2+3+4+5) + (0+1+2+3+4)) {
    alert("Array.prototype.forEach: test failed: "+n);
}

// ==== Object.prototype.forEach ====
value = 0;
obj = {
    name: 'foo',
    age: 100,
};
if (!obj.forEach) { alert('Object.prototype.forEach: undefined') }
obj.forEach(function(v,n) {
    if (typeof v == 'number') value += v;
    if (typeof v == 'string') value += v.length;
    if (!(n in obj)) {
	alert('Object.prototype.forEach: bad name: '+n);
    }
});
if (value != obj.name.length + obj.age) {
    alert("Object.prototype.forEach: test failed: "+value);
}
