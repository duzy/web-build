//(function() {

var proto;

// ==== Function.prototype ====
/*
proto = Function.prototype;
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

Object.forEach = function(a,action,context) {
    a && a.forEach(action,context);
}

// ==== Array.prototype ====
proto = Array.prototype;
proto.$_type = 'array';

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

global.Type = new Type('Type', Type);

/*
  make a new class:
	var Base = {}, Base2 = {};
	var MyClass = new Class(Base, Base2, {
		name: 'MyClass',
		init: function() { }
	});
*/
var Class = global.Class = new Type('Class', function() {
    var len = arguments.length,
        first = arguments[0],
        last = arguments[len - 1],
        className, i = 0,
        newClass = last && (last.typename === 'function' ? last : last.init),
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
	className = last.name || this.typename;
	last.name && delete last.name;
	last.init && delete last.init;
	newClass.prototype.extend(last);
    } else {
	className = this.typename;
    }

    new Type(className, newClass);

    return newClass;
});

module.exports = {
    Type: Type,
    Class: Class,
}

//})();
