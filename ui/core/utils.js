// -*- javascript -*-
//(function() {

    var slice = Array.prototype.slice,
        utils = exports;

    var marked = '__marked';

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
        var g = obj.hasProp(prop);
        if (value !== undefined) {
            if (!g && obj[prop] && obj[prop].apply) {
                obj[prop](value, extra);
            } else {
                obj[prop] = value;
            }
            return obj;
        } else {
            if (!g && obj[prop] && obj[prop].apply) {
                return obj[prop]();
            } else {
                return obj[prop];
            }
        }
    };

    utils.pluck = function(array, prop) {
	return array.map(function(v) { return utils.prop(v, prop); });
    };

    utils.without = function(array, value) {
        return array.filter(function(v) { return v !== value; });
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
        var target = arguments[0] || {};
        Object.prototype.extend.apply(target, slice.call(arguments,1));
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

    utils.range = function(from, to) {
        var result = new Array(to - from);
        for (var idx = 0; from <= to; from++, idx++) {
            result[idx] = from;
        }
        return result;
    };

    utils.trim = function(s) { return s.trim(); };

//})();
