//(function() {

var proto;

// ==== Function.prototype ====
proto = Function.prototype;
/*
proto.hook = function(pre, post) {
    var self = this;
    return function() {
	if (pre  && typeof pre  == 'function') pre(self);
	var result = self.apply(self, arguments);
	if (post && typeof post == 'function') post(self);
	return result;
    }
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
        className, i = 0,
        newClass = last && (Object.isFun(last) ? last : last.init),
        baseClass = 1 < len && first.prototype && first;

    if (!newClass) {
	if (baseClass) {
	    newClass = function() { baseClass.apply(this, arguments); };
	} else {
	    newClass = function() {};
	}
    }

    // implements(real inheritance) the first base class
    if (baseClass) {
	var T = function(){}
	T.prototype = baseClass.prototype
	newClass.prototype = new T;
	i = 1; // start mixin from the second arg
    }

    newClass.prototype.extend(this);

    // mixin (see uki:functions.js)
    for (; i < len - 1; ++i) {
	newClass.prototype.extend(arguments[i]);
    }

    if (last) {
	className = last.typeName || this.typename;
	last.typeName && delete last.typeName;
	last.init && delete last.init;
	newClass.prototype.extend(last);
    } else {
	className = this.typename;
    }

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

String.prototype.trim = String.prototype.trim || function(s) {
    return s.replace(/^\s*|\s*$/g, "");
};

//Arguments.prototype.forEach = Array.prototype.forEach;

// module.exports = {
//     Type: Type,
//     Class: Class,
// }

//})();
