//var ui = require('ui');

var types;
try {
    types = require('ui/core/types');
} catch(e) {
    alert(e);
}

var test = require('tool/test');
var value, obj;

// ==== Object.prototype.type ====
test.equal(''.type, typeof '', "''.type === string");
test.equal([].type, 'array', '[].type === array');
test.equal((0).type, typeof 0, '(0).type === number');
test.equal(function(){}.type, 'function', 'function(){}.type === function');

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
    Widget.prototype.name = 'widget';

    new types.Type('Widget', Widget);

    var w = new Widget;
    if (w.type != 'Widget') alert('new Type(name, object) failed: '+w.type);
    if (!w.name || w.name !== 'widget')
	alert('wrong Type inheritance: w.name: '+w.name);
}

// ==== Class ====
{
    var Base = {};
    Base.prototype = {
        name: 'Base',
    };

    var Base2 = {
	foo: 'Base2',
    };

    var MyClass = new types.Class(Base, Base2, {
	name: 'MyClass',
	init: function(name) {
	    if (name) this.name = name;
	},
	extra: 'mixin',
    });

    var a = new MyClass('foobar');
    var b = new MyClass();

    if (a.type !== 'MyClass') alert('new Class(...) wrong: not inited by "name"');
    if (b.type !== 'MyClass') alert('new Class(...) wrong: not inited by "name"');

    if (a.name !== 'foobar') alert('new Class(...) wrong: not constructed by "init"');
    if (b.name !== 'Base') alert('new Class(...) wrong: not inherits "Base"');

    if (a.foo !== 'Base2') alert('new Class(...) wrong: not mixin Base2');
    if (b.foo !== 'Base2') alert('new Class(...) wrong: not mixin Base2');

    if (a.extra !== 'mixin') alert('new Class(...) wrong: not mixin the last arg');
    if (b.extra !== 'mixin') alert('new Class(...) wrong: not mixin the last arg');
}

test.info('PASSED');
