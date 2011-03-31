// -*- javascript -*-
//(function() {
    var env = require('./env'),
        utils = require('./utils'),
        arrayPrototype = Array.prototype;


    /**
     * Class and function utility functions.
     */

    var fun = exports;

    function newProp(prop, setter) {
        var propName = '_' + prop;
        if (setter) {
            return function(value) {
                if (value === undefined) { return this[propName]; }
                setter.apply(this, arguments);
                return this;
            };
        } else {
            return function(value) {
                if (value === undefined) { return this[propName]; }
                this[propName] = value;
                return this;
            };
        }
    }
    fun.newProp = newProp;

    /**
     * Creates default property function
     * <p>If value is given to this function it sets property to value
     * If no arguments given than function returns current property value</p>
     *
     * <p>Optional setter can be given. In this case setter will be called instead
     * of simple this[prop] = value</p>
     *
     * <p>If used as setter function returns self</p>
     *
     * @example
     *   fun.addProp(x, 'width');
     *   x.width(12); // x._width = 12
     *   x.width();   // return 12
     *   fun.addProp(x, ['width', 'height'])
     *
     * @param {Object} proto Prototype of the object to add property to
     * @param {string} prop Prop name
     * @param {function(object)=} setter
     * @returns {function(object=):object}
     */
    fun.addProp = fun.addProps = function(source, prop, setter) {
        if (Object.isArray(prop)) {
            for (var i = 0, len = prop.length; i < len; i++) {
                source[prop[i]] = newProp(prop[i], setter && setter[i]);
            }
        } else {
            source[prop] = newProp(prop, setter);
        }
    };

    function newDelegateProp(target, targetName) {
        return function(value) {
            var targetObj = utils.prop(this, target);
            if (value === undefined) {
                return targetObj ? utils.prop(targetObj, targetName) : null;
            }
            targetObj && utils.prop(targetObj, targetName, value);
            return this;
        };
    }

    fun.newDelegateProp = newDelegateProp;

    fun.delegateProp = function(source, name, target, targetName) {
        if (Object.isArray(name)) {
            name.forEach(function(n, i) {
                fun.delegateProp(source, n, target, targetName && targetName[i]);
            });
        } else {
            targetName = targetName || name;
            source[name] = newDelegateProp(target, targetName);
        }
    };

    function newDelegateCall(target, targetName) {
        return function() {
            var obj = utils.prop(this, target);
            return obj[targetName].apply(obj, arguments);
        };
    }

    fun.newDelegateCall = newDelegateCall;

    fun.delegateCall = function(source, name, target, targetName) {
        if (Object.isArray(name)) {
            name.forEach(function(n, i) {
                fun.delegateCall(source, n, target, targetName && targetName[i]);
            });
        } else {
            targetName = targetName || name;
            source[name] = newDelegateCall(target, targetName);
        }
    };


    var afterBound = {},
        afterTimer = 0,
        afterQueue = [];

    fun.after = function(callback) {
        callback.huid = callback.huid || env.guid++;
        if (afterBound[callback.huid]) { return; }
        afterBound[callback.huid] = true;
        afterQueue.push(callback);
        if (!afterTimer) { after._startTimer(); }
    };

    function runAfterCallbacks() {
        clearAfterTimer();
        var queue = afterQueue;
        afterQueue = [];
        afterBound = {};
        for (var i = 0; i < afterQueue.length; i++) {
            queue[i]();
        }
    };

    function scheduleAfterCallbacks() {
        if (afterTimer) { return; }
        afterTimer = setTimeout(runAfterCallbacks, 1);
    };

    function clearAfterTimer() {
        if (!afterTimer) { return; }
        clearTimeout(afterTimer);
        afterTimer = 0;
    };



    function timer(fn, timeout, debounce) {
        var running;

        return function() {
            // last call params
            var context = this,
            args = arguments;
	    
            if (debounce && running) {
                running = clearTimeout(running);
            }
            running = running || setTimeout(function() {
                running = null;
                fn.apply(context, args);
            }, timeout);
	    
        };
    }

    fun.throttle = function(fn, timeout) {
        return timer(fn, timeout);
    };
    
    fun.debounce = function(fn, timeout) {
        return timer(fn, timeout, true);
    };

    fun.defer = function(fn, timeout) {
        timeout = timeout || 0;
        return setTimeout(fn, timeout);
    };

fun.setterN = function(prop) {
    return prop
        ? function(name,v) { this[prop][name] = v; }.$$(null, prop)
        : function(name,v) { this[name] = v; }.$$(null, prop)
};

fun.setter = function(name, prop) {
    return prop
        ? function(v) { this[prop][name] = v; }.$$(name, prop)
        : function(v) { this[name] = v; }.$$(name, prop)
    /* // maximum call stack size eceeded
    var f = fun.setterN(prop);
    return name ? f.bind(null,name) : f;
    */
};

/**
 * Empty function
 * @type function():boolean
 */
fun.FF = function() { return false; };
fun.FT = function() { return true; };
fun.FS = function() { return this; };
//})();
