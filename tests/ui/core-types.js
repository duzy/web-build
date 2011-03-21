// -*- javascript -*-
//var ui = require('ui');

var types;
try {
    types = require('ui/core/types');
} catch(e) {
    alert(e);
    return;
}

var test = require('tool/test');
var value, obj;

// ==== Object.prototype.typename ====
test.equal(''.typename,	typeof '',	"''.typename === string");
test.equal([].typename,	'array',	'[].typename === array');
test.equal((0).typename,	typeof 0,	'(0).typename === number');
test.equal(function(){}.typename, 'function', 'function(){}.typename === function');

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
test.equal(obj.forEach !== undefined, true, 'obj.forEach');
obj.forEach(function(v,n) {
    if (typeof v == 'number') value += v;
    if (typeof v == 'string') value += v.length;
    if (!(n in obj)) {
	test.error('Object.prototype.forEach: bad name: '+n);
    }
});
if (value != obj.name.length + obj.age) {
    test.error("Object.prototype.forEach: test failed: "+value);
}

test.equal(Object.isFun !== undefined, true, 'Object.isFun');
test.equal(Object.isFun(function(){}), true, 'Object.isFun(function(){}) = '+Object.isFun(function(){}));
test.equal(Object.isArray !== undefined, true, 'Object.isArray');
test.equal(Object.isArray([]), true, 'Object.isArray([]) = '+Object.isArray([]));
test.equal(Object.get !== undefined, true, 'Object.get');
test.equal(Object.get('name', obj), 'foo', 'Object.get("name",obj) = '+Object.get('name',obj));
test.equal(Object.keys !== undefined, true, 'Object.keys');
//test.equal(Object.keys(obj) === ['name', 'age'], true, 'Object.keys(obj): '+Object.keys(obj));

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

    var f = function() {
	inCalled = true;
	this.called = 'yes';
    }.chain(preCall, postCall);

    f(1,2,3);

    test.equal(preCalled, true, 'chain pre-call');
    test.equal(postCalled, true, 'chain post-call');
    test.equal(inCalled, true, 'chain in-call');
}

// ==== Type ====
{
    test.equal(Object.Type != undefined, true, 'Object.Type defined');

    var Widget = function() {}
    Widget.prototype.name = 'widget';

    new Object.Type('Widget', Widget);

    var w = new Widget;
    test.equal(w.typename, 'Widget', 'new Type("Widget", object) is: '+w.typename);
    test.check(w.name && w.name === 'widget',
	       'wrong Type inheritance: w.name: '+w.name);
}

// ==== Class ====
{
    test.equal(Object.Class != undefined, true, 'Object.Class defined');

    var BaseDestroyed = 0, Base2Destroyed = 0, MyClassDestroyed = 0;

    var Base = {}; //function(){};
    Base.prototype = { // NOTE: assign to 'Base.prototype', not 'Base'
        name: 'Base',
        init: function(name) {
        },
        destroy: function() {
            ++BaseDestroyed;
            test.info("Base.prototype.destroy");
        },
    };

    var Base2 = {
	foo: 'Base2',
        init: function(name) {
        },
        destroy: function() {
            ++Base2Destroyed;
            //test.info("Base2.destroy");
        },
    };

    var MyClass = new Object.Class('MyClass', Base, Base2, {
	init: function(name) {
	    if (name) this.name = name;
	},
        destroy: function() {
            ++MyClassDestroyed;
            //test.info("MyClass.prototype.destroy");
        },
	extra: 'mixin',
    });

    test.info("test Class.init and Class.destroy");

    var a = new MyClass('foobar');
    var b = new MyClass();

    test.equal(a.init, undefined, 'a.init hidden');
    test.equal(b.init, undefined, 'b.init hidden');
    test.equal(a.destroy != undefined, true, 'a.destroy explosed');
    test.equal(b.destroy != undefined, true, 'b.destroy explosed');

    a.destroy();
    test.equal(BaseDestroyed, 1, 'Base.destroy invoked');
    test.equal(Base2Destroyed, 1, 'Base2.destroy invoked');
    test.equal(MyClassDestroyed, 1, 'MyClass.destroy invoked');

    a.destroy(); // invoke again will take effect
    test.equal(BaseDestroyed, 1, 'Base.destroy reinvoke harmed');
    test.equal(Base2Destroyed, 1, 'Base2.destroy reinvoke harmed');
    test.equal(MyClassDestroyed, 1, 'MyClass.destroy reinvoke harmed');

    b.destroy();
    test.equal(BaseDestroyed, 2, 'Base.destroy invoked');
    test.equal(Base2Destroyed, 2, 'Base2.destroy invoked');
    test.equal(MyClassDestroyed, 2, 'MyClass.destroy invoked');

    b.destroy(); // invoke again will take effect
    test.equal(BaseDestroyed, 2, 'Base.destroy reinvoke harmed');
    test.equal(Base2Destroyed, 2, 'Base2.destroy reinvoke harmed');
    test.equal(MyClassDestroyed, 2, 'MyClass.destroy reinvoke harmed');

    test.equal(a.destroy.invoked != undefined, true, 'a.destroy.invoked is undefined');
    test.equal(b.destroy.invoked != undefined, true, 'b.destroy.invoked is undefined');

    test.equal(a.typename, 'MyClass', 'new Class(...) wrong: not inited by "name"');
    test.equal(b.typename, 'MyClass', 'new Class(...) wrong: not inited by "name"');

    test.equal(a.name, 'foobar', 'new Class(...) wrong: not constructed by "init"');
    test.equal(b.name, 'Base', 'new Class(...) wrong: not inherits "Base"');

    test.equal(a.foo, 'Base2', 'new Class(...) wrong: not mixin Base2');
    test.equal(b.foo, 'Base2', 'new Class(...) wrong: not mixin Base2');

    test.equal(a.extra, 'mixin', 'new Class(...) wrong: not mixin the last arg');
    test.equal(b.extra, 'mixin', 'new Class(...) wrong: not mixin the last arg');
}

test.info('PASSED');
