//var ui = require('ui');

try {
    require('ui/core/types');
} catch(e) {
    alert(e);
}

var value, obj;

// ==== Object.prototype.type ====
if (''.type != typeof '') alert('"".type wrong: '+''.type);
if ([].type != 'array') alert('[].type wrong: '+[].type);
if ((0).type != typeof 0) alert('(0).type wrong: '+(0).type);

// ==== Object.prototype.extend ====
obj = {}
{
    var a = {
	//get name() { return 'foo' }
	foo: function(){ return true; }
    };

    a.foobar = function() {}

    var thename = 'foo';

    a.__defineGetter__('name', function(){ return thename });
    a.__defineSetter__('age', function(x){  });

    obj.extend(a);

    if (!obj.foo) alert("Object.prototype.extend: obj.foo");
    if (!obj.foobar) alert("Object.prototype.extend: obj.foobar");

    if (obj.hasOwnProperty('age') || obj.age)
	alert("Object.prototype.extend: obj.age (setter can't be extended)");
    if (obj.hasOwnProperty('name') || obj.name)
	alert("Object.prototype.extend: obj.name (getter can't be extended)");

    thename = 'bar';
    if (a.name !== 'bar') alert('Uncompatible JavaScript runner!');
    // if (obj.name !== 'bar' || obj.name !== a.name)
    // 	alert('Object.prototype.extend: getter not rightly extended: '+obj.name);
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

// ==== Array.prototype.forEach ====
value = 0;
obj = [1,2,3,4,5];
if (!obj.forEach) { alert('Array.prototype.forEach: undefined') }
obj.forEach(function(v,i) { value += v + i });

if (value != (1+2+3+4+5) + (0+1+2+3+4)) {
    alert("Array.prototype.forEach: test failed: "+n);
}

// ==== Function.prototype.overload ====
{
    var preCalled, postCalled, inCalled;

    var preCall = function(fun) {
	preCalled = true;
    }
    var postCall = function(fun) {
	postCalled = true;
	alert(fun.called);
    }

    /*
    var f = function(){
	inCalled = true;
	this.called = 'yes';
    }.hook(preCall, postCall);
    f(1,2,3);
    */
}

// ==== Type ====
{
    var Widget = function() {}

    new Type('Widget', Widget);

    var w = new Widget;
    if (w.type != 'Widgetd') { alert('Type') }
}