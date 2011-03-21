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
    test.equal(Object.Class != undefined, true, 'Object.Class defined');

    var BaseDestroyed = 0, Base2Destroyed = 0, Base3Destroyed = 0, MyClassDestroyed = 0;

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

        // TODO:
        //  $: { props... }
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

    var Base3 = new Object.Class('Base3', {
        init: function(name) {
            test.info("Base3.prototype.init: "+name);
        },
        destroy: function() {
            ++Base3Destroyed;
            test.info("Base3.prototype.destroy");
        },
    });

    var b3 = new Base3('foo');

    // NOTE: the Base3.prototype.init and Base3.prototype.destroy is not chained!
    var MyClass = new Object.Class('MyClass', Base, Base2, Base3, {
	//_typename: 'MyClass',
	init: function(name) {
            test.info("MyClass.prototype.init");
	    if (name) this.name = name;
	},
        destroy: function() {
            ++MyClassDestroyed;
            test.info("MyClass.prototype.destroy");
        },

	extra: 'mixin',

        $: {
            // multiple property names bind to one single function
            'name1 name2 name3 name4': function(name,value) {
                name = '_' + name;
                if (value !== undefined) this[name] = value;
                return this[name];
            },

            // multiple property names bind to a setter/getter(with 'name') pair
            'foo1 foo2': {
                get: function(name) {
                    name = '_' + name;
                    return this[name];
                },
                set: function(name, value) {
                    return (this['_'+name] = value);
                },
            },

            // single name bind to a single function
            bar: function(value) {
                if (value !== undefined) this._bar = value;
                return this._bar;
            },

            // single name bind to a setter/getter(without 'name') pair
            foobar: {
                get: function() { return this._foobar; },
                set: function(value) { return (this._foobar = value); },
            },
        },
    });

    test.info("====== new MyClass('foobar')");

    var a = new MyClass('foobar');

    test.info("====== new MyClass()");

    var b = new MyClass();

    test.info("=============");

    test.info("====== check properties ");
    // 'name1 name2 name3 name4', 'foo1 foo2', bar, foobar
    a.name1 = 'abc1';
    a.name2 = 'abc2';
    a.name3 = 'abc3';
    a.name4 = 'abc4';
    test.equal(a.name1, 'abc1', 'a.name1 = '+a.name1);
    test.equal(a.name2, 'abc2', 'a.name2 = '+a.name2);
    test.equal(a.name3, 'abc3', 'a.name3 = '+a.name3);
    test.equal(a.name4, 'abc4', 'a.name4 = '+a.name4);
    a.foo1 = 'abc1';
    a.foo2 = 'abc2';
    test.equal(a.foo1, 'abc1', 'a.foo1 = '+a.foo1);
    test.equal(a.foo2, 'abc2', 'a.foo2 = '+a.foo2);
    a.bar = 'abc1';
    test.equal(a.bar, 'abc1', 'a.bar = '+a.bar);
    a.foobar = 'foobar';
    test.equal(a.foobar, 'foobar', 'a.foobar = '+a.foobar);
    test.info("=============");

    test.equal(a.init, undefined, 'a.init hidden');
    test.equal(b.init, undefined, 'b.init hidden');
    test.equal(b3.init, undefined, 'b3.init hidden');
    test.equal(a.destroy != undefined, true, 'a.destroy explosed');
    test.equal(b.destroy != undefined, true, 'b.destroy explosed');
    test.equal(b3.destroy != undefined, true, 'b3.destroy explosed');
    test.equal(Base3.prototype.destroy != undefined, true, 'Base3.prototype.destroy explosed');

    test.info("====== a.destroy()");
    a.destroy();
    test.info("=============");
    test.equal(BaseDestroyed, 1, 'Base.destroy invoked');
    test.equal(Base2Destroyed, 1, 'Base2.destroy invoked');
    test.equal(Base3Destroyed, 0, 'Base3.destroy not invoked');
    test.equal(MyClassDestroyed, 1, 'MyClass.destroy invoked');

    test.info("====== a.destroy() == EMPTY");
    a.destroy(); // invoke again will take effect
    test.info("=============");
    test.equal(BaseDestroyed, 1, 'Base.destroy reinvoke');
    test.equal(Base2Destroyed, 1, 'Base2.destroy reinvoke');
    test.equal(Base3Destroyed, 0, 'Base3.destroy reinvoke');
    test.equal(MyClassDestroyed, 1, 'MyClass.destroy reinvoke');

    test.info("====== b.destroy()");
    b.destroy();
    test.info("=============");
    test.equal(BaseDestroyed, 2, 'Base.destroy invoked');
    test.equal(Base2Destroyed, 2, 'Base2.destroy invoked');
    test.equal(Base3Destroyed, 0, 'Base3.destroy not invoked');
    test.equal(MyClassDestroyed, 2, 'MyClass.destroy invoked');

    test.info("====== b.destroy() == EMPTY");
    b.destroy(); // invoke again will take effect
    test.info("=============");
    test.equal(BaseDestroyed, 2, 'Base.destroy reinvoke');
    test.equal(Base2Destroyed, 2, 'Base2.destroy reinvoke');
    test.equal(Base3Destroyed, 0, 'Base3.destroy reinvoke');
    test.equal(MyClassDestroyed, 2, 'MyClass.destroy reinvoke');

    test.equal(a.destroy.invoked != undefined, true, 'a.destroy.invoked is: '+a.destroy.invoked);
    test.equal(b.destroy.invoked != undefined, true, 'b.destroy.invoked is: '+a.destroy.invoked);

    test.equal(a.typename, 'MyClass', 'a.typename: '+a.typename);
    test.equal(b.typename, 'MyClass', 'b.typename: '+b.typename);
    test.equal(b3.typename, 'Base3', 'class with no bases: '+b3.typename);

    test.equal(a.name, 'foobar', 'constructed by "init"');
    test.equal(b.name, 'Base', 'inherits "Base"');

    test.equal(a.foo, 'Base2', 'a.foo is: '+a.foo);
    test.equal(b.foo, 'Base2', 'b.foo is: '+b.foo);

    test.equal(a.extra, 'mixin', 'a.extra is: '+a.extra);
    test.equal(b.extra, 'mixin', 'b.extra is: '+b.extra);
}

test.info('PASSED');

