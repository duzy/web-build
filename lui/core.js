(function() {
    require('./core/types');

    var env        = require('./core/env'),
        utils      = require('./core/utils'),
        builder    = require('./core/builder'),
        selector   = require('./core/selector'),
        collection = require('./core/collection');

    /**
     * Shortcut access to builder, selector and
     * Collection constructor
     * lui('#id') is also a shortcut for search view.byId
     *
     * @param {String|view.Base|Object|Array.<view.Base>} val
     * @param {Array.<view.Base>=} optional context for selector
     * @class
     * @namespace
     * @name lui
     * @return {Collection}
     */
    var lui = module.exports = function(val, context) {
	if (typeof val === "string") {
            var m = val.match(/^#((?:[\w\u00c0-\uFFFF_-]|\\.)+)$/),
            e = m && view.byId(m[1]);
            if (m && !context) {
		return new collection.Collection(e ? [e] : []);
            }
            return selector.find(val, context);
	}
	if (val.length === undefined) { val = [val]; }
	if (val.length > 0 && utils.isFunction(val[0].typeName)) {
            return new collection.Collection(val);
	}
	return builder.build(val);
    }

    lui.version = '0.0.1a1'; // derived from lui-0.4.0a2;

    /*
    // push everything into core namespace
    utils.extend(
	lui,
	utils, builder, selector, collection,
	require('./core/function'),
	require('./core/dom'),
	require('./core/event'),
	require('./core/gesture'),
	require('./core/observable'),
	require('./core/binding'),
	require('./core/attachment'),
	require('./core/mustache')
    );
    */


    utils.extend(
	lui,
	require('./core/dom')
    )

    var view = require('./core/view');

    // add view as lui.view namespace
    lui.view = view;

    // register view as default search path for views
    builder.viewNamespaces.unshift(view);

    // copy views from default view namespaces into view
    utils.extend(
	view, 
	require('./core/view/base'),        
	require('./core/view/container')
    );
})();
