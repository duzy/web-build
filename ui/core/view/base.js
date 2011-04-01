// -*- javascript -*-
//(function() {
var view  = require('../view'),
    utils = require('../utils'),
    fun   = require('../function'),
    env   = require('../env'),
    dom   = require('../dom'),
    event = require('../event');

var POS_RULES = [
    'top', 'right', 'left', 'bottom', 'width', 'height',
    'marginLeft', 'marginTop', 'marginBottom', 'marginRight'
],
POS_MAP = {
    t: 'top', r: 'right',
    l: 'left', b: 'bottom',
    w: 'width', h: 'height',
    ml: 'marginLeft', mr: 'marginRight',
    mt: 'marginTop', mb: 'marginBottom'
};

var Base = new Object.Class('Base', {
    $: {
        /**
         * Get views container dom node, all assignments to it will be ignored.
         * @returns {Element} dom
         */
        dom: function() { return this._dom; },
        
        /**
         * Used for fast (on hash lookup) view searches: build('#view_id');
         *
         * @param {string=} id New id value
         * @returns {string|view.Base} current id or self
         */
        id: function(value) {
            if (value !== undefined /*&& value*/) {
                this.dom.id || view.unregisterId(this);
                this.dom.id = value;
                view.registerId(this);
                return this;
            }
            return this.dom.id;
        },

        'left top right bottom width height': function(name,value) {
            var s = this.dom.style;
            if (value !== undefined) {
                //s.position = 'absolute'; // force position to be 'absolute'
                s[name] = value;
            }
            return s[name];
        },

    /**
     * Accessor for view visibility.
     *
     * @param {boolean=} state
     * @returns {boolean|view.Base} current visibility state of self
     */
    visible: function(state) {
	if (state === undefined) {
	    return this.dom.style.display != 'none';
	}
	
	var origState = this.visible;
	this.dom.style.display = state ? '' : 'none';
	
	// if we change from invis to vis, and we have dom, and we're attached
	// redraw
	if (state && !origState && this.dom && this.dom.offsetWidth) {
	    this.resized();
	}
	return this.visible;
    },

        //size: function(value) { // for both 'width' and 'height'
        //},

        //html: fun.newDelegateProp('_dom', 'innerHTML'),
        //html: function(v) { this.dom.innerHTML = v }.$$('innerHTML', 'dom'),
        html: fun.setter('innerHTML', 'dom'),
        text: function(v) { return v && ( this.html = dom.escapeHTML(v)) },

        //className: fun.newDelegateProp('_dom', 'className'),

        // 'scrollTop scrollLeft title alt': function(name, value) {
        //     this.dom[name] = value;
        // }.$$(null, 'dom'),
        'scrollTop scrollLeft title alt className': fun.setterN('dom'),
    },

    //init: NOOP(); 

    destroy: function(args) {
	view.unregisterId(this);
	view.unregister(this);
	this.removeListener();
        (args && args.nodettach) || dom.removeElement(this._dom);
    },

    $create: function(args) { // internal used only, deleted once called
        this._createDom(args);
        var d = this.dom;
        d[env.expando] = d[env.expando] || env.guid++;

        args.style && args.style.forEach(function(value,name){
            d.style[name] = value;
        },this);

        d.onselectstart = fun.FF; // disable selection

        view.register(this);
    },

    _createDom: function(args) {
	this._dom = dom.createElement(args.tagName || 'div');
    },

    // noselect: function(v) {
    //     var d = this._dom;
    //     d.onselectstart = d.onmousedown = v ? fun.FF : fun.FS;
    // },
    
    /**
     * Called when view was resized
     */
    resized: fun.FS,

    /* ----------------------- Common settings --------------------------------*/

    /**
     * Accessor for dom.className
     * @param {string=} className
     *
     * @returns {string|view.Base} className or self
     */

    addClass: function(className) {
	dom.addClass(this.dom, className);
	return this;
    },

    hasClass: function(className) {
	return dom.hasClass(this.dom, className);
    },

    removeClass: function(className) {
	dom.removeClass(this.dom, className);
	return this;
    },

    toggleClass: function(className, condition) {
	dom.toggleClass(this.dom, className, condition);
	return this;
    },

    domForEvent: function(type) {
	return this.dom;
    },

    /**
     * @param {String} name Event name, or space separated names
     * @param {function()} callback
     */
    addListener: function(names, callback) {
	if (typeof names === 'object') {
	    names.forEach(function(callback, name) {
		this.addListener(name, callback);
	    }, this);
	} else {
	    var wrapper = callback.bindOnce(this);
	    this._eventNames || (this._eventNames = {});
	    names.split(' ').forEach(function(name) {
		this._eventNames[name] = true;
		event.addListener(this.domForEvent(name), name, wrapper);
	    }, this);
	}
	return this;
    },

    /**
     * @param {String} name Event name, or space separated names,
     *                      or null to remove from all types
     * @param {function()} callback or null to remove all callbacks
     */
    removeListener: function(names, callback) {
	var wrapper = callback && callback.bindOnce(this);
	names || (names = Object.keys((this._eventNames || {})).join(' '));
	names.split(' ').forEach(function(name) {
	    event.removeListener(this.domForEvent(name), name, wrapper);
	}, this);
	return this;
    },

    trigger: function(e) {
	var node = this.domForEvent(e.type);
	var wrapped = event.createEvent(e, { target: node });
	return event.trigger.call(node, e);
    },

    /**
     * Shortcut to set absolute positioning props
     * @param {string|object} p Position string in the form of
     *                          'l:10px t:10px r:30% h:200px'
     */
    pos: function(pos) {
        if (pos === undefined) {
            return this._styleToPos(this.dom.style);
        }
        pos = this._expandPos(pos);
        this._applyPosToStyle(pos, this.dom.style);
        return this;
    },

    _styleToPos: function(style) {
	var res = {};
	POS_RULES.forEach(function(rule) {
	    if (style[rule]) {
		res[rule] = style[rule];
	    }
	});
	return res;
    },

    _expandPos: function(pos) {
	if (typeof pos === 'string') {
	    var p = pos;
	    pos = {};
	    p.split(/\s+/).forEach(function(rule) {
		var parts = rule.split(':');
		pos[parts[0]] = parts[1];
	    });
	}
	POS_MAP.forEach(function(longRule, shortRule) {
	    if (pos[shortRule]) pos[longRule] = pos[shortRule];
	});
	return pos;
    },

    _applyPosToStyle: function(pos, style) {
	style.position = 'absolute';
	POS_RULES.forEach(function(rule) {
	    style[rule] = pos[rule] || '';
	});
    },

/* ----------------------------- Container api ------------------------------*/

    /**
     * Accessor attribute for parent view. When parent is set view appends its #dom
     * to parents #dom
     *
     * @param {?view.Base=} parent
     * @returns {view.Base} parent or self
     */
    parent: function(parent) {
	if (parent === undefined) {
	    return this._parent;
	}

	this._parent = parent;
	return this;
    },

    /**
     * Reader for previous view
     * @returns {view.Base}
     */
    prevView: function() {
	if (!this.parent()) { return null; }
	return this.parent().childViews()[this._viewIndex - 1] || null;
    },

    /**
     * Reader for next view
     * @returns {view.Base}
     */
    nextView: function() {
	if (!this.parent()) { return null; }
	return this.parent().childViews()[this._viewIndex + 1] || null;
    },

    scroll: function(dx, dy) {
	dx && this.scrollLeft(this.scrollLeft() + dx);
	dy && this.scrollTop(this.scrollTop() + dy);
    },

    /* ----------------------------- Layout ------------------------------*/
    /**
     */
    clientRect: function(ignoreScroll) {
	return dom.clientRect(this.dom, ignoreScroll);
    },

    childViews: function() {
	return [];
    },
    
});

var proto = Base.prototype;
//fun.delegateProp(proto, 'className', 'dom');
//fun.delegateProp(proto, ['scrollTop', 'scrollLeft', 'title', 'alt'], 'dom');

proto.on = proto.addListener,
proto.emit = proto.trigger,

module.exports.Base = Base;
//})();
