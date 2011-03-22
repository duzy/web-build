// -*- javascript -*-
//(function() {

var utils = require('./utils'),
    env   = require('./env');

var registry = {},
    ids = {};

/** @namespace */
var view = function() {
    //arguments.forEach.call(function(v) { view.extend(v) });
    Array.prototype.forEach.call(arguments, function(v) { view.extend(v) });
}

view.extend({
    register: function(v) {
	registry[v.dom[env.expando]] = v;
    },

    unregister: function(v) {
	delete registry[v.dom[env.expando]];
    },
	
    registerId: function(v) {
	ids[utils.prop(v, 'id')] = v;
    },
	
    unregisterId: function(v) {
	delete ids[utils.prop(v, 'id')];
    },
	
    byId: function(id) {
	return ids[id];
    },
	
    closest: function(dom) {
	while (dom) {
	    var e = dom[env.expando];
	    if (registry[e]) { return registry[e]; }
	    dom = dom.parentNode;
	}
	return null;
    },
	
    contains: function(parent, child) {
	while (child) {
	    if (child == parent) { return true; }
	    child = child.parent();
	}
	return false;
    },

    newToggleClassProp: function(className) {
	return function(state) {
	    if (state === undefined) { return this.hasClass(className); }
	    return this.toggleClass(className, state);
	};
    },


    /**
     * @example
     *   newClass({...
     *      this.border = view.newClassMapProp({
     *          wide: 'my-border-wide'
     *          none: 'my-border-none'
     *          thin: 'my-border-thin'
     *      })
     *   ...})
     *
     *  x = new X()
     *  x.border('wide') // className = 'my-border-wide'
     *  x.border() // => wide
     *  x.border('none') // className = 'my-border-none'
     *  x.border() // => none
     */
    newClassMapProp: function(classMap) {
	return function(state) {
	    if (state === undefined) {
		var res;
		classMap.forEach(function(clasName, enumName) {
		    if (this.hasClass(clasName)) {
			res = enumName;
			return false;
		    }
		}, this);
		return res;
	    }
	    
	    classMap.forEach(function(className, enumName) {
		this.toggleClass(className, state === enumName);
	    }, this);
	    return this;
	};
    }
});

module.exports = view;
//})();
