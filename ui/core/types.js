// -*- javascript -*-
//(function() {

// ==== Object.prototype ====
var NOOP = function() { return function() {} }, noop = NOOP(),

proto = Object.prototype,

hasOwnProperty = proto.hasOwnProperty,
toString = proto.toString,

isFun = function(obj) {
    //return obj && obj.typename === 'function';
    return toString.call(obj) === "[object Function]";
},

isArr = function(obj) {
    //return obj && obj.typename === 'array';
    return toString.call(obj) === "[object Array]";
},

isStr = function(obj) { return typeof obj === 'string'; },

slice = Array.prototype.slice,

// extend 'this' object by other objects' own properties (see hasOwnProperty).
extend = proto.extend = function() {
    var args = arguments, length = args.length, object, i = 0, name;
    for (; i < length; ++i) {
	if ((object = args[i]) != null) {
	    for (name in object) {
		if (!hasOwnProperty.call(object,name)  // only the owned property

		    // skip protected names
		    || name == '$__t' || name == 'typename')
		{
		    continue;
		}

		var g = object.__lookupGetter__(name);
		if (g) {
		    // skip getters?
		    continue;
		}
                /*
                */

		var copy = object[name], names, iss;

                // 'copy !== this' prevents dead-loop, (by jQuery)
		if (copy !== this && copy !== undefined) {
                    ( name === '$' ) // is property spec?
                        ? ( this.defProps(copy) ) // define properties
                        : (
                            iss = isFun(copy) && copy._$$, // is FUN setter?
                            names = name.split(' '),
                            ( names.length === 1 )
                            ? ( this[name] = iss ? copy.getterize(name) : copy )
                            : (
                                names.forEach(function(nm){
                                    this[nm] = iss
                                        ? copy.bind(null,nm).getterize(nm)
                                        : copy.bind(null,nm)
                                }.bind(this))
                            )
                        );
		}
	    }
	}
    }
    return this;
};

// iterate in object's properties
proto.extend({
    forEach: proto.forEach || function(action, context) {
        var name;
        for (name in this) {
	    if (hasOwnProperty.call(this, name)) {
	        action.call(context, this[name], name, this);
	    }
        }
    },

    /*
    clone: function() {
        // http://my.opera.com/GreyWyvern/blog/show.dml/1725165
        //var newObj = (this instanceof Array) ? [] : {}, a, i;
        var newObj = (typeof this ==='array') ? [] : {}, a, i;
        for (i in this) {
            if (hasOwnProperty.call(this,i) && (a = this[i])) {
                newObj[i] = (typeof a === 'object') ? a.clone() : a;
            }
        }
        return newObj;
    },
    */

    defProp: function(name, funs) { // TODO: rename to defProp
        if (name !== 'defProp' && name !== 'defProps' && !this[name]) {
            var g, s, f = isFun(funs);
            g = f ? funs : funs.get;
            s = f ? funs : funs.set;
            this.__defineGetter__(name, g || NOOP());
            this.__defineSetter__(name, s || NOOP());

            // support getter/setter in form of 'a.$name()', 'a.$name(1)'
            this['$'+name] = function(v) {
                if (v === undefined) return this[name];
                this[name] = v;
                return this;
            };
        }
    },

    /**
     * Make the function be a named property getter/setter function(wrap setters):
     *
     *    var a = {};
     *    a.defProps({
     *        foo: function(v) { this._foo = v }._$('foo'),
     *        'foo1 foo2': function(n,v) { this['_'+n] = v }._, // delayed
     *
     *        foobar: function(v) { this._foo = v }._$('foobar'),
     *    });
     *
     *    a.foo = 1; // --> this._foo = 1
     *    a.foo;     // --> return this._foo
     *    a.foo1 = 1; // --> this._foo1 = 1
     *    a.foo1;     // --> return this._foo1
     *    a.foo2 = 2; // --> this._foo2 = 2
     */
    defProps: function(ps) {
        var name, names, f, funs, pn;
        for(name in ps) {
            if (hasOwnProperty.call(ps,name) && (f = ps[name])) {
                names = name.split(' ');
                if (names.length == 1) { // single property name
                    this.defProp(name, f._$$ ? f.getterize(name) : f);
                } else { // multiple or ZERO property names
                    for (i=0; i < names.length; ++i) {
                        pn = names[i];
                        funs = isFun(f)
                            ? (f._$$
                               ? f.bind(null, pn).getterize(pn)
                               : f.bind(null, pn))
                            : {
                                get: f.get && f.get.bind(null, pn),
                                set: f.set && f.set.bind(null, pn),
                            };
                        this.defProp(pn, funs);
                    }
                }
            }
        }
    },
});

// allows all objects to access 'obj.typename' for the type name
/*
proto.__defineGetter__('typename', function() {
    return this.$__t ? this.$__t : typeof this;
});
proto.__defineSetter__('typename', noop); // avoid set error
*/
proto.defProp('typename', function() { // this will allow a.$typename([xxx])
    return this.$__t ? this.$__t : typeof this;
});


Object.extend({
    isFun: isFun,

    isArray: isArr,

    //if (Object.get) throw('Object.get already defined!');

    // find object via a path like 'ui.view.Split'
    get: function(path, context) {
        context = context || global;
        path.split('.').forEach(function(ns){
            context && (context = context[ns])
        });
        return context;
    },

    //https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys
    keys: Object.keys || function(obj) {
        var a = [], p;
        for (p in o) o.hasOwnProperty.call(p) && a.push[p];
        return a;
    },
});

// ==== Function.prototype ====
Function.__huid = 1;
(proto = Function.prototype).extend({
    chain: function(pre, post) {
        var self = this,
        fun = isFun(pre) ? (function() {
            pre.apply(this, arguments);
            self.apply(this, arguments);
        }) : self;

        return isFun(post) ? (function() {
            fun.apply(this, arguments);
            post.apply(this, arguments);
        }) : fun;
    },

    /**
     * Bind a function to a context and optional arguments.
     *
     * function modifyProp(prop, value) {
     *   this[prop] = value;
     * }
     * var obj = {};
     *
     * // bind modifyFoo to obj (this == obj)
     * // with first argument (prop) equals to 'foo'
     * var modifyFoo = fun.bind(modifyFoo, obj, 'foo');
     *
     * // obj['foo'] = 'bar'
     * modifyFoo('bar');
     * obj.bar === 'bar';
     */
    bind: function(context) {
        var self = this, args = slice.call(arguments,1);
        result = args.length
            ? function() {
                // NOTE: must avoid make changes on 'args', any changes on it
                // may affect next call on 'this' function. (this is for
                // the '$$' method.
	        return self.apply(context || this, args.concat(slice.call(arguments,0)));
	    }
            : function() {
	        return self.apply(context || this, arguments);
            };
        result.bound = true;
        return result;
    },
    
    /**
     * Special version of bind. Guarantied to provide the same result
     * for the same fn and context pair provided. Cannot bind arguments
     *
     * Useful for event handlers:
     *   x.on('click', fun.bindOnce(handler, this));
     *   // will unbind bound function here
     *   x.removeListener('click', fun.bindOnce(handler, this));
     */
    // TODO: unit-tests for this
    bindOnce: function(context) {
        this.huid = this.huid || Function.__huid++;
        var bindName = '$__bi_' + this.huid;
        // Optimize:
        // Do not rebind bound functions for the second time
        // since this will not affect their behaviour
        context[bindName] || (
            context[bindName] = this.bound ? this : this.bind(context)
        );
        return context[bindName];
    },

    /**
     * Make 'this' setter function become a getter.
     *
     * Make the function be a named property getter/setter function(wrap setters):
     *    var C = new Class({
     *      $:{
     *        foo: function(v) { this._foo = v }._$('foo'),
     *        'foo1 foo2': function(n,v) { this['_'+n] = v }._, // delayed
     *
     *        foobar: function(v) { this._foo = v }._$('foobar'),
     *      },
     *    });
     *
     *    var a = new C();
     *    a.foo = 1; // --> this._foo = 1
     *    a.foo;     // --> return this._foo
     *    a.foo1 = 1; // --> this._foo1 = 1
     *    a.foo1;     // --> return this._foo1
     *    a.foo2 = 2; // --> this._foo2 = 2
     */
    getterize: function(name, prop) { // getter/setter, expected to be used in '$:{ }' spec
        var self = this, i = name ? 1 : 0,
        f = prop
            ? function(n,v) {
                if (this[prop] !== undefined) {
                    v !== undefined && self.apply(this, slice.call(arguments,i));
                    return this[prop][n];
                }
            }
            : function(n,v) {
                v !== undefined && self.apply(this, slice.call(arguments,i));
                return this['_'+n];
            };
        return name ? f.bind(null, name) : f;
    },

    // work with extend() and defProps() to alias getterization
    _$: function(a,b) {
        if (a || b) {
            return this.getterize(a, b);
        } else {
            this._$$ = true; // mark for delay getterize
            return this;
        }
    },

    $: {
        // work with extend() and defProps() to delay getterization
        _: function() { return this._$(); },
    },

});

// === String.prototype ====
/*
(proto = String.prototype).trim = proto.trim || function(s) {
    return s.replace(/^\s*|\s*$/g, "");
};
*/

// ==== Array.prototype ====
(proto = Array.prototype).extend({
    //TODO: ['indexOf', 'lastIndexOf', 'forEach', 'map', 'filter', 'reduce'];

    // iterate in the elements of array
    /*
    forEach: proto.forEach || function(action,context) {
        for (var i=0, n = this.length; i < n; i++) {
	    if (i in this) {
	        action.call(context, this[i], i, this);
	    }
        }
    }, */

}).$__t = 'array';

////////////////////////////////////////////////////////////////////////////////

// ==== Type ==== (see: MooTools:Core.js)
// helps to make new types supports 'type' property, etc.
var Type = function(name, object) {
    name && ( object.prototype.$__t = name );

    object.extend(this);

    return object;
};

Object.Type = new Type('Type', Type);

/*
  make a new class:
	var Base = {}, Base2 = {};
	var MyClass = new Class('MyClass', Base, Base2, {
		init: function() { }
	});
        var MyClass2 = new Class('MyClass2', {});
        var MyClass3 = new Class({});

        var a = new MyClass(), b = new MyClass2(), c = new MyClass3();
*/
var Class = Object.Class = new Type('Class', function() {
    var args = arguments, len = args.length, arg0 = args[0],
        className = (arg0 && typeof arg0 === 'string') ? arg0 : '',
        superPos = (className ? 1 : 0),
        first = args[superPos],
        last = args[len - 1],
        newClass = (last && (isFun(last) ? last : last.init)) || NOOP(),
        proto = newClass.prototype,
        superClass = (superPos + 1) < len && first.prototype && first,
        i = superClass ? superPos + 1 : superPos,
        superCtr, superDtr, ctr, dtr, a/* temporary */;

    // implements(real inheritance) the first base class
    if (superClass) {
        a = superClass.prototype;
        superCtr = isFun(superClass) ? superClass
            : isFun(a.init) ? a.init : null;
        superDtr = isFun(a.destroy) ? a.destroy : null;
    }

    // chain 'init' and 'destroy' of mixins
    for (; i < len - 1; ++i) {
	a = args[i];
        if (a) {
            superCtr = isFun(a.init)    ? a.init.chain(superCtr)    : superCtr;
            superDtr = isFun(a.destroy) ? a.destroy.chain(0,superDtr) : superDtr;
        }
    }

    if (superClass) {
        if (superCtr) {
	    ctr = newClass;
	    newClass = function() { // TODO: usning ctr.hook(superClass) ?
	        superCtr.apply(this, arguments);
	        ctr.apply(this, arguments);
	    };
        }

	a = NOOP();
	a.prototype = superClass.prototype
	newClass.prototype = proto = new a;
    }

    proto.extend(this); // extends the Class instance

    // reset 'i' to extend from the second arg
    i = superClass ? superPos + 1 : superPos;

    // mixin (see uki:functions.js)
    for (; i < len - 1; ++i) {
        a = args[i];
	a && proto.extend(a);
    }

    // extends more on newClass.prototype
    if (last) {
	proto.extend(last);

        dtr = isFun(last.destroy) ? last.destroy.chain(0,superDtr) : superDtr;

        proto.destroy = dtr ? function() {
            if (!this.destroy.invoked) {
                dtr.apply(this, arguments);
                this.destroy = noop;
                this.destroy.invoked = dtr;
            }
        }
        : noop;
    } else {
        proto.destroy = superDtr;
    }

    proto.init = undefined; // hide any 'init' methods

    new Type(className || this.typename, newClass);

    return newClass;
});

// module.exports = {
//     Type: Type,
//     Class: Class,
// }

//})();
