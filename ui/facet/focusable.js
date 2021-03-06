//(function() {
    var env = require('../core/env'),
        dom = require('../core/dom'),
        fun = require('../core/function');

    var Focusable = {};

    Focusable.focusableDom = function() {
        return this.dom();
    };

    Focusable._domForEvent = function(type) {
        if (type == 'focus' || type == 'blur') {
            return this.focusableDom();
        }
        return false;
    };

    fun.delegateProp(Focusable, 'tabIndex', 'focusableDom');


    Focusable._initFocusEvents = function() {
        this._focusEventsInited = true;
        this.on('focus', this._focus.bindOnce(this));
        this.on('blur', this._blur.bindOnce(this));
    };

    Focusable._destruct = function() {
        this.removeListener('focus', this._focus.bindOnce(this));
        this.removeListener('blur', this._blur.bindOnce(this));
    };

    Focusable._focus = function() {
        if (this.focusedClass()) {
            this.addClass(this.focusedClass());
        }
    };

    Focusable._blur = function() {
        if (this.focusedClass()) {
            this.removeClass(this.focusedClass());
        }
    };

    Focusable.focus = function() {
        this.focusableDom().focus();
        return this;
    };

    Focusable.blur = function() {
        this.focusableDom().blur();
        return this;
    };

    Focusable.hasFocus = function() {
        return this.focusableDom() == env.doc.activeElement;
    };

    fun.addProp(Focusable, 'focusedClass');

    exports.Focusable = Focusable;
//})();
