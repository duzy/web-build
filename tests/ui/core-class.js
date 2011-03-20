// -*- javascript -*-
var types;
try {
    types = require('ui/core/types');
} catch(e) {
    alert(e);
    return;
}

var test = require('tool/test');

// ==== Class ====
{
    test.equal(types.Class != undefined, true, 'types.Class defined');

    var BaseDestroyed = 0, Base2Destroyed = 0, MyClassDestroyed = 0;

    var Base = {}; //function(){};
    Base.prototype = { // NOTE: assign to 'Base.prototype', not 'Base'
        _typename: 'Base',
        name: 'Base',
        init: function(name) {
            test.info("Base.prototype.init");
        },
        destroy: function() {
            ++BaseDestroyed;
            test.info("Base.prototype.destroy");
        },
    };

    var Base2 = {
        _typename: 'Base2',
	foo: 'Base2',
        init: function(name) {
            test.info("Base2.init");
        },
        destroy: function() {
            ++Base2Destroyed;
            test.info("Base2.destroy");
        },
    };

    var MyClass = new types.Class(Base, Base2, {}, {
	_typename: 'MyClass',
	init: function(name) {
            test.info("MyClass.prototype.init");
	    if (name) this.name = name;
	},
        destroy: function() {
            ++MyClassDestroyed;
            test.info("MyClass.prototype.destroy");
        },
	extra: 'mixin',
    });

    test.info("====== new MyClass('foobar')");

    var a = new MyClass('foobar');

    test.info("====== new MyClass()");

    var b = new MyClass();

    test.info("=============");

    test.equal(a.init, undefined, 'a.init hidden');
    test.equal(b.init, undefined, 'b.init hidden');
    test.equal(a.destroy != undefined, true, 'a.destroy explosed');
    test.equal(b.destroy != undefined, true, 'b.destroy explosed');

    test.info("====== a.destroy()");
    a.destroy();
    test.info("=============");
    test.equal(BaseDestroyed, 1, 'Base.destroy invoked');
    test.equal(Base2Destroyed, 1, 'Base2.destroy invoked');
    test.equal(MyClassDestroyed, 1, 'MyClass.destroy invoked');

    test.info("====== a.destroy() == EMPTY");
    a.destroy(); // invoke again will take effect
    test.info("=============");
    test.equal(BaseDestroyed, 1, 'Base.destroy reinvoke');
    test.equal(Base2Destroyed, 1, 'Base2.destroy reinvoke');
    test.equal(MyClassDestroyed, 1, 'MyClass.destroy reinvoke');

    test.info("====== b.destroy()");
    b.destroy();
    test.info("=============");
    test.equal(BaseDestroyed, 2, 'Base.destroy invoked');
    test.equal(Base2Destroyed, 2, 'Base2.destroy invoked');
    test.equal(MyClassDestroyed, 2, 'MyClass.destroy invoked');

    test.info("====== b.destroy() == EMPTY");
    b.destroy(); // invoke again will take effect
    test.info("=============");
    test.equal(BaseDestroyed, 2, 'Base.destroy reinvoke');
    test.equal(Base2Destroyed, 2, 'Base2.destroy reinvoke');
    test.equal(MyClassDestroyed, 2, 'MyClass.destroy reinvoke');

    test.equal(a.destroy.invoked != undefined, true, 'a.destroy.invoked is: '+a.destroy.invoked);
    test.equal(b.destroy.invoked != undefined, true, 'b.destroy.invoked is: '+a.destroy.invoked);

    test.equal(a.typename, 'MyClass', 'a.typename: '+a.typename);
    test.equal(b.typename, 'MyClass', 'b.typename: '+b.typename);

    test.equal(a.name, 'foobar', 'constructed by "init"');
    test.equal(b.name, 'Base', 'inherits "Base"');

    test.equal(a.foo, 'Base2', 'a.foo is: '+a.foo);
    test.equal(b.foo, 'Base2', 'b.foo is: '+b.foo);

    test.equal(a.extra, 'mixin', 'new Class(...) has mixin the last arg');
    test.equal(b.extra, 'mixin', 'new Class(...) has mixin the last arg');
}

test.info('PASSED');


