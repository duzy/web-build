//(function() {

    var toString = Object.prototype.toString,
        arrayPrototype = Array.prototype,
        slice = arrayPrototype.slice,
        utils = exports,
        compat = require('./compat');

    var marked = '__marked';
    // dummy subclass
    /** @ignore */
    function inheritance() {}

    /**
     * Sets or retrieves property on an object.
     *
     * If target has function with prop it will be called target[prop](value=)
     * If no function present property will be set/get directly:
     *   target[prop] = value or return target[prop]</p>
     *
     * @example
     *   utils.prop(view, 'name', 'funny') // sets name to funny on view
     *   utils.prop(view, 'id') // gets id property of view
     *
     * @param {object} target
     * @param {string} prop Attribute name
     * @param {object=} value Value to set
     * @returns {object} target if value is being set, retrieved value otherwise
     */
    utils.prop = function(obj, prop, value, extra) {
        if (value !== undefined) {
            if (obj[prop] && obj[prop].apply) {
                obj[prop](value, extra);
            } else {
                obj[prop] = value;
            }
            return obj;
        } else {
            if (obj[prop] && obj[prop].apply) {
                return obj[prop]();
            } else {
                return obj[prop];
            }
        }
    };

    utils.pluck = function(array, prop) {
        function prop(v) {
            return utils.prop(v, prop);
        };
	return array.map(prop);
    };

    utils.without = function(array, value) {
        function filter(v) {
            return v !== value;
        };

        return array.filter ? array.filter(filter) : utils.filter(array, filter);
    };

    /**
     * Returns unique elements in array
     *
     * @param {Array} array
     * @returns {Array}
     */
    utils.unique = function(array) {
        var result = [],
        i, length;

        if (array.length && (typeof array[0] == 'object' ||
                             typeof array[0] == 'function')) {

            for (i = 0; i < array.length; i++) {
                if (!array[i][marked]) { result[result.length] = array[i]; }
                array[i][marked] = true;
            }
            for (i = 0; i < result.length; i++) {
                delete result[i][marked];
            }
            return result;

        } else {

            var done = {};
            for (i = 0, length = array.length; i < length; i++) {
                var id = array[i];
                if (!done[id]) {
                    done[id] = true;
                    result.push(array[i]);
                }
            }

            return result;
        }
    };

    /**
     * Copies properties from one object to another
     * @example
     *   utils.extend(x, { width: 13, height: 14 }) // sets x.width = 13,
     *                                            // x.height = 14
     *   options = utils.extend({}, defaultOptions, options)
     *
     * @param {object} target Object to copy properties into
     * @param {...object} sources Objects to take properties from
     * @returns Describe what it returns
     */
    utils.extend = function() {
        var target = arguments[0] || {}, i = 1, length = arguments.length, options;

        for (; i < length; i++) {
            if ((options = arguments[i]) != null) {

                for (var name in options) {
                    var copy = options[name];

                    if (copy !== undefined) {
                        target[name] = copy;
                    }

                }
            }
        }

        return target;
    };

    /**
     * Search closest value in a sorted array
     * @param {nubmer} value to search
     * @param {array} array sorted array
     * @returns {number} index of closest value
     */
    utils.binarySearch = function(value, array) {
        var low = 0, high = array.length, mid;

        while (low < high) {
            mid = (low + high) >> 1;
            array[mid] < value ? low = mid + 1 : high = mid;
        }

        return low;
    };


    utils.camalize = function(string) {
        return string.replace(/[_-]\S/g, function(v) {
            return v.substr(1).toUpperCase();
        });
    };

    utils.dasherize = function(string) {
        return string.replace(/[A-Z]/g, function(v) {
            return '-' + v.toLowerCase();
        });
    };

    utils.path2obj = function(path, context) {
        var parts = path.split('.');

        context = context || global;

        for (var i = 0, l = parts.length; context && i < l; i++) {
            context = context[parts[i]];
        }
        return context;
    };

    utils.range = function(from, to) {
        var result = new Array(to - from);
        for (var idx = 0; from <= to; from++, idx++) {
            result[idx] = from;
        }
        return result;
    };

    utils.applyCompat = compat.applyCompat;

    // compat.arrayFunctions.forEach(function(name) {
    //     if (!utils[name]) {
    //         // using temp argument is faster than slicing
    //         // arguments object
    //         utils[name] = function(array, a, b) {
    //             return compat[name].call(array, a, b);
    //         };
    //     }
    // });

    utils.keys = compat.keys;

    utils.trim = function(s) {
        return compat.trim.call(s);
    };

//})();
