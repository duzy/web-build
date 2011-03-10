//(function() {
var env        = require('./core/env'),
    utils      = require('./core/utils'),
    builder    = require('./core/builder'),
    Collection = require('./core/collection').Collection;

var ui = module.exports = function(val, context) {
    if (typeof val === "string") {
	var m = val.match(/^#((?:[\w\u00c0-\uFFFF_-]|\\.)+)$/),
	e = m && view.byId(m[1]);
	if (m && !context) {
	    return new Collection(e ? [e] : []);
	}
	// TODO: find views by keyword 'val'
	return new Collection([]);
    }
    if (val.length === undefined) { val = [val]; }
    if (val.length > 0 && utils.isFunction(val[0].typeName)) {
	return new Collection(val);
    }
    return builder.build(val);
}

ui.version = '0.0.1a1'; // derived from ui-0.4.0a2;

// must require gesture to support mouse dragging.
var gesture = require('./core/gesture');

// add view as ui.view namespace
var view = ui.view = require('./core/view');

// register view as default search path for views
builder.NS.unshift(view);

// copy views from default view namespaces into view
view(
    require('./core/view/base'),
    require('./core/view/can')
);
//})();
