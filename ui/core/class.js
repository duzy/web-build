// ==== Type ==== (see: MooTools:Core.js)
// helps to make new types supports 'type' property, etc.
var Type = function(name, object) {
    if (name) {
	object.prototype.$_type = name;
    }

    object.extend(this);

    return object;
};

new Type('Type', Type);

/*
  make a new class:
	var Base = {}, Base2 = {};
	var MyClass = new Class(Base, Base2, {
		name: 'MyClass',
		init: function() { }
	});
*/
var Class = new Type('Class', function() {
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
