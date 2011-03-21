// -*- javascript -*-
//(function() {
var env = require('../core/env'),
    dom = require('../core/dom'),
    fun = require('../core/function');

var Focusable = exports.Focusable = {
    destroy: function() {
        this.removeListener('focus', this._focus.bindOnce(this));
        this.removeListener('blur', this._blur.bindOnce(this));
        alert('Focusable.destroy');
    },

    focusableDom: function() {
        return this.dom();
    },

    _domForEvent: function(type) {
        if (type == 'focus' || type == 'blur') {
            return this.focusableDom();
        }
        return false;
    },

    _initFocusEvents: function() {
        this._focusEventsInited = true;
        this.on('focus', this._focus.bindOnce(this));
        this.on('blur', this._blur.bindOnce(this));
    },

    _focus: function() {
        if (this.focusedClass()) {
            this.addClass(this.focusedClass());
        }
    },

    _blur: function() {
        if (this.focusedClass()) {
            this.removeClass(this.focusedClass());
        }
    },

    focus: function() {
        this.focusableDom().focus();
        return this;
    },

    blur: function() {
        this.focusableDom().blur();
        return this;
    },
    
    hasFocus: function() {
        return this.focusableDom() == env.doc.activeElement;
    },
};

fun.delegateProp(Focusable, 'tabIndex', 'focusableDom');
fun.addProp(Focusable, 'focusedClass');
//})();
