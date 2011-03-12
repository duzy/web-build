// -*- javascript -*-
//(function() {

var utils      = require('./utils'),
    Collection = require('./collection').Collection;

var NS = [global]; // view namespaces

/**
 * Creates view tree from JSON-like markup
 *
 * @function
 *
 * @param {object} ml JSON-like markup
 * @returns {view.Collection} collection of created elements
 */
function build(ml) {
    return new Collection(createMulti((ml.length === undefined) ? [ml] : ml));
};

function createMulti(ml) {
    return ml.map(function(row) { return createSingle(row); });
}

function createSingle(row) {
    if (row.typeName) {
        return row;
    }

    var C = row.view,
        initArgs = row.init || {},
        result, Obj;

    initArgs.style = initArgs.style || row.style;
    (initArgs.style !== row.style) && initArgs.style.extend(row.style);

    if (Object.isFun(C)) {
        result = new C(initArgs);
    } else if (typeof C === 'string') {
        for (var i = 0, ns = NS, length = ns.length; i < length; i++) {
	    Obj = Object.get(C, ns[i]);
	    if (Obj) {
                result = new Obj(initArgs);
		if (result.$create) {
                    result.$create(initArgs);
                    delete result.$create; // disable '$create' now
                }
                break;
	    }
        }
        if (!Obj) {
	    throw "build: Can't find view with type '" + C + "'";
        }
    } else {
        result = C;
    }
    
    copyAttrs(result, row);
    return result;
}

function copyAttrs(view, row) {
    row.forEach(function(value, name) {
        if (name == 'view' || name == 'init') { return; }
        utils.prop(view, name, value);
    });
    return view;
}

exports.build = build;
exports.NS = NS;
//})();
