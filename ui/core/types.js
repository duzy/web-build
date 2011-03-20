// -*- javascript -*-
//(function() {

var proto;

// ==== Function.prototype ====
proto = Function.prototype;
proto.chain = function(pre, post) {
    var self = this,
        fun = Object.isFun(pre) ? (function() {
            pre.apply(this, arguments);
            self.apply(this, arguments);
        }) : self;

    return Object.isFun(post) ? (function() {
        fun.apply(this, arguments);
        post.apply(this, arguments);
    }) : fun;
};

/*
proto.derive = function(name,defer) {
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
proto.bind = function(context) {
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
};

Function.huid = 1;

/**
 * Special version of bind. Guarantied to provide the same result
 * for the same fn and context pair provided. Cannot bind arguments
 *
 * Useful for event handlers:
 *   x.on('click', fun.bindOnce(handler, this));
 *   // will unbind bound function here
 *   x.removeListener('click', fun.bindOnce(handler, this));
 */
proto.bindOnce = function(context) {
    this.huid = this.huid || Function.huid++;
    var bindName = '__bind_' + this.huid;
    // Optimize:
    // Do not rebind bound functions for the second time
    // since this will not affect their behaviour
    context[bindName] = context[bindName] ||
	(this.bound ? this : this.bind(context));
    return context[bindName];
}

// ==== Object.prototype ====
proto = Object.prototype;
var hasOwnProperty = proto.hasOwnProperty;

// allows all objects to access 'obj.typename' for the type name
proto.__defineGetter__('typename', function() {
    return this.$_type ? this.$_type : typeof this;
});

proto.__defineSetter__('typename', function() {}); // avoid set error

// extend 'this' object by other objects' own properties (see hasOwnProperty).
proto.extend = function() {
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
}

// iterate in object's properties
proto.forEach = proto.forEach || function(action, context) {
    var name;
    for (name in this) {
	if (hasOwnProperty.call(this, name)) {
	    action.call(context, this[name], name, this);
	}
    }
};

// ==== Array.prototype ====
proto = Array.prototype;
proto.$_type = 'array';

//TODO: ['indexOf', 'lastIndexOf', 'forEach', 'map', 'filter', 'reduce'];

// iterate in the elements of array
proto.forEach = proto.forEach || function(action,context) {
    for (var i=0, n = this.length; i < n; i++) {
	if (i in this) {
	    action.call(context, this[i], i, this);
	}
    }
};

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
	var MyClass = new Class(Base, Base2, {
		name: 'MyClass',
		init: function() { }
	});
*/
var Class = Object.Class = new Type('Class', function() {
    var len = arguments.length,
        first = arguments[0],
        last = arguments[len - 1],
        className,
        newClass = (last && (Object.isFun(last) ? last : last.init)) || function() {},
        superClass = 1 < len && first.prototype && first, i = superClass ? 1 : 0,
        superCtr, superDtr;

    // implements(real inheritance) the first base class
    if (superClass) {
        superCtr = Object.isFun(superClass) ? superClass
            : Object.isFun(superClass.prototype.init) ? superClass.prototype.init
            : undefined;
        superDtr = Object.isFun(superClass.prototype.destroy)
            ? superClass.prototype.destroy : undefined;
    }

    // chain 'init' and 'destroy' of mixins
    for (; i < len - 1; ++i) {
	var b = arguments[i];
        superCtr = Object.isFun(b.init)    ? b.init.chain(superCtr)    : superCtr;
        superDtr = Object.isFun(b.destroy) ? b.destroy.chain(0,superDtr) : superDtr;
    }

    if (i = superClass ? 1 : 0) { // reset 'i' to extend from the second arg
        if (superCtr) {
	    var ctr = newClass;
	    newClass = function() { // TODO: usning ctr.hook(superClass) ?
	        superCtr.apply(this, arguments);
	        ctr.apply(this, arguments);
	    };
        }

	var T = function(){};
	T.prototype = superClass.prototype
	newClass.prototype = new T;
    }

    newClass.prototype.extend(this); // extends the Class instance

    // mixin (see uki:functions.js)
    for (; i < len - 1; ++i) {
	newClass.prototype.extend(arguments[i]);
    }

    if (last) {
	className = last.name || this.typename || last.typeName;
	last.name && delete last.name; // FIXME: don't do this!!
	//last.init && delete last.init;

	newClass.prototype.extend(last);

        var dtr = Object.isFun(last.destroy)
            ? last.destroy.chain(0,superDtr) : superDtr;

        newClass.prototype.destroy = dtr ? function() {
            if (!this.destroy.invoked) {
                dtr.apply(this, arguments);
                this.destroy = function(){};
                this.destroy.invoked = dtr;
            }
        }
        : function() {};
    } else {
	className = this.typename;
        newClass.prototype.destroy = superDtr;
    }

    newClass.prototype.init = undefined; // hide any 'init' methods

    new Type(className, newClass);

    return newClass;
});

Object.isFun = function(obj) {
    //return toString.call(obj) === "[object Function]";
    return obj && obj.typename === 'function';
}

Object.isArray = function(obj) {
    //return toString.call(obj) === "[object Array]";
    return obj && obj.typename === 'array';
}

//if (Object.get) throw('Object.get already defined!');

// find object via a path like 'ui.view.Split'
Object.get = function(path, context) {
    context = context || global;
    path.split('.').forEach(function(ns){ context = context[ns] });
    return context;
}

//https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys
Object.keys = Object.keys || function(obj) {
    var a = [], p;
    for (p in o) o.hasOwnProperty.call(p) && a.push[p];
    return a;
};

String.prototype.trim = String.prototype.trim || function(s) {
    return s.replace(/^\s*|\s*$/g, "");
};

//Arguments.prototype.forEach = Array.prototype.forEach;

module.exports = {
    Type: Type,
    Class: Class,
}

//})();
