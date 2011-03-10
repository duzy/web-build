//(function() {
    var env = require('./env'),
        utils = require('./utils'),
        arrayPrototype = Array.prototype;


    /**
     * Class and function utility functions.
     */

    // dummy subclass
    /** @ignore */
    function inheritance() {}

    var fun = exports;

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
    fun.bind = function(fn, context) {
        // // Optimize:
        // // Do not transform and concat arguments array
        // // if optional arguments are not provided
        //var args = arrayPrototype.slice.call(arguments, 2),
        // result = args.length ?
        // function() {
        //     return fn.apply(context || this,
        //                     args.concat(arrayPrototype.slice.call(arguments, 0)));
        // } :
        // function() {
        //     return fn.apply(context || this, arguments);
        // };
        // // mark bound function so we can optimize later
        // result.bound = true;
        // return result;
	var args = arrayPrototype.slice.call(arguments, 1);
	return Function.prototype.bind.apply(fn,args);
    };

    /**
     * Special version of bind. Guarantied to provide the same result
     * for the same fn and context pair provided. Cannot bind arguments
     *
     * Useful for event handlers:
     *   x.on('click', fun.bindOnce(handler, this));
     *   // will unbind bound function here
     *   x.removeListener('click', fun.bindOnce(handler, this));
     */
    fun.bindOnce = function(fn, context) {
        // fn.huid = fn.huid || env.guid++;
        // var bindingName = '__bind_' + fn.huid;
        // // Optimize:
        // // Do not rebind bound functions for the second time
        // // since this will not affect their behaviour
        // context[bindingName] = context[bindingName] ||
        // (fn.bound ? fn : fun.bind(fn, context));
        // return context[bindingName];
	var args = arrayPrototype.slice.call(arguments, 1);
	return Function.prototype.bindOnce.apply(fn,args);
    };

    /**
     * Creates a new class inherited from base classes.
     * Init function is used as constructor
     * @example
     *   var BaseClass = fun.newClass(function() { this.x = 3 });
     *   // same as
     *   // var BaseClass = function() { this.x = 3 };
     *
     *   // extend baseClass
     *   var ChildClass = fun.newClass(baseClass, {
     *      getSqrt: function() { return this.x*this.x }
     *   });
     *
     *   var Mixin = {
     *      happines: function() {
     *          return 'happines';
     *      }
     *   }
     *
     *   var ChildNinja = fun.newClass(BaseClass, Mixin, {
     *
     *      // use init as a constructor
     *      init: function() {
     *          Base.call(this);
     *      },
     *
     *      happines: function() {
     *          return 'Ninja ' + Mixin.happines.call(this);
     *      },
     *
     *      publicMethod: function() {
     *          // do some public work
     *          privateMethod.call(this);
     *          return this.happines();
     *      }
     *   });
     *
     *   // private ninja method
     *   function privateMethod() {
     *       // do some private stuff
     *   }
     *
     *
     * @param {object=} superClass If superClass has prototype "real" prototype
     *                             base inheritance is used, otherwise superClass
     *                             is treated as mixin
     * @param {Array.<object>=} mixins
     * @param {object} constructor Constructor function or an object with class
     *                             methods and init function as constructor
     *
     * @returns Describe what it returns
     */
    fun.newClass = function(/* [[baseClass], mixin1, mixin2, ..], constructor */) {
        var i,
        length = arguments.length,
        first = arguments[0],
        last = arguments[length - 1],
        klass = Object.isFun(last) ? last : last.init,
        baseClass = length > 1 && first.prototype && first;

        // if nothing was provided create an empty constructor
        // calling base class if available
        if (!klass) {
            if (baseClass) {
                klass = function() { baseClass.apply(this, arguments); };
            } else {
                klass = function() {};
            }
        }

        // real inheritance for the first superclass
        if (baseClass) {
            inheritance.prototype = baseClass.prototype;
            klass.prototype = new inheritance();
        }

        // mixins
        for (i = baseClass ? 1 : 0; i < length - 1; i++) {
            utils.extend(klass.prototype, arguments[i]);
        }

        // if class description was provides
        if (!Object.isFun(last)) {
            utils.extend(klass.prototype, last);
        }

        return klass;
    };

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
            utils.forEach(name, function(n, i) {
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
            utils.forEach(name, function(n, i) {
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


    /**
     * Empty function
     * @type function():boolean
     */
    fun.FF = function() { return false; };
    fun.FT = function() { return true; };
    fun.FS = function() { return this; };
//})();
