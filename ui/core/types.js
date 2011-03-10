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
//})();
