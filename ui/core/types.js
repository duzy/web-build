// -*- javascript -*-
//(function() {

// ==== Object.prototype ====
var NOOP = function() { return function() {} }, noop = NOOP(),

proto = Object.prototype,  hasOwnProperty = proto.hasOwnProperty,

// extend 'this' object by other objects' own properties (see hasOwnProperty).
extend = proto.extend = function() {
    var length = arguments.length, object, i = 0;
    for (; i < length; ++i) {
	if ((object = arguments[i]) != null) {
	    for (var name in object) {
		if (!hasOwnProperty.call(object,name)  // only the owned property

		    // skip protected names
		    || name == '$_type' || name == 'typename')
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

		var copy = object[name];
		if (copy === this) { continue } // prevent dead-loop, (by jQuery)
		if (copy !== undefined) {
		    this[name] = copy;
		}
	    }
	}
    }
    return this;
};

// allows all objects to access 'obj.typename' for the type name
proto.__defineGetter__('typename', function() {
    return this.$_type ? this.$_type : typeof this;
});

proto.__defineSetter__('typename', noop); // avoid set error

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

    /*
    prop: function(name, funs) {
        if (name !== 'prop') {
            funs.get && this.__defineGetter__(name, funs.get);
            this.__defineSetter__(name, funs.set || noop);
        }
    },
    */
});

Object.extend({
    isFun: function(obj) {
        //return toString.call(obj) === "[object Function]";
        return obj && obj.typename === 'function';
    },

    isArray: function(obj) {
        //return toString.call(obj) === "[object Array]";
        return obj && obj.typename === 'array';
    },

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
        fun = Object.isFun(pre) ? (function() {
            pre.apply(this, arguments);
            self.apply(this, arguments);
        }) : self;

        return Object.isFun(post) ? (function() {
            fun.apply(this, arguments);
            post.apply(this, arguments);
        }) : fun;
    },

    /*
    derive: function(name,defer) {
        var self = this;
        return function() {
	    if (this.prototype.hasOwnProperty(name)) {
	        var f = this.prototype[name];
	        if (!Object.isFun(f)) f = null;
	        if (!defer) f.apply(this, arguments);
	        self.apply(this.arguments);
	        if (defer) f.apply(this, arguments);
	    }
        };
    };
    */

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
        var self = this;
        var args = Array.prototype.slice.call(arguments,1);
        result = args.length ?
	    function() {
	        args.concat(Array.prototype.slice.call(arguments,0));
	        return self.apply(context || this, args);
	    } :
        function() {
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
    bindOnce: function(context) {
        this.huid = this.huid || Function.__huid++;
        var bindName = '__bind_' + this.huid;
        // Optimize:
        // Do not rebind bound functions for the second time
        // since this will not affect their behaviour
        context[bindName] = context[bindName] ||
	    (this.bound ? this : this.bind(context));
        return context[bindName];
    },
});

// === String.prototype ====
(proto = String.prototype).trim = proto.trim || function(s) {
    return s.replace(/^\s*|\s*$/g, "");
};

// ==== Array.prototype ====
(proto = Array.prototype).extend({
    //TODO: ['indexOf', 'lastIndexOf', 'forEach', 'map', 'filter', 'reduce'];

    // iterate in the elements of array
    forEach: proto.forEach || function(action,context) {
        for (var i=0, n = this.length; i < n; i++) {
	    if (i in this) {
	    action.call(context, this[i], i, this);
	    }
        }
    },
});
proto.$_type = 'array';

////////////////////////////////////////////////////////////////////////////////

// ==== Type ==== (see: MooTools:Core.js)
// helps to make new types supports 'type' property, etc.
var Type = function(name, object) {
    if (name) {
	object.prototype.$_type = name;
    }

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
    var args = arguments, len = args.length, isFun = Object.isFun, arg0 = args[0],
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
            : isFun(a.init) ? a.init : undefined;
        superDtr = isFun(a.destroy) ? a.destroy : undefined;
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

//Arguments.prototype.forEach = Array.prototype.forEach;

module.exports = {
    Type: Type,
    Class: Class,
}

//})();
