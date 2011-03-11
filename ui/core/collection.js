//(function() {

var fun = require('./function'),
    utils = require('./utils');

/**
 * Collection performs group operations on view objects.
 * <p>Behaves much like result jQuery(dom nodes).
 * Most methods are chainable like
 *   .prop('text', 'somevalue').on('click', function() { ... })</p>
 *
 * <p>Its easier to call build([view1, view2]) or find('selector')
 * instead of creating collection directly</p>
 *
 * @author voloko
 * @constructor
 * @class
 */
var Collection = new Object.Class(Array, {
    name: 'Collection',
    typeName: 'Collection',

    init: function(views) {
        this.length = 0;
        Array.prototype.push.apply(this, views);
    },

    /**
     * Creates a new Collection populated with found items
     *
     * @function
     *
     * @param {function(view.Base, number):boolean} callback
     * @returns {view.Collection} created collection
     */
    // filter: function(callback, context)
    // map: function(callback, context)

    // reduce: function() {
    // 	alert('coll.reduce');
    // 	Array.prototype.reduce.apply(this, arguments);
    // },

    /**
     * Sets an attribute on all views or gets the value of the attribute
     * on the first view
     *
     * @example
     * c.prop('text', 'my text') // sets text to 'my text' on all
     *                           // collection views
     * c.prop('name') // gets name attribute on the first view
     *
     * @function
     *
     * @param {string} name Name of the attribute
     * @param {object=} value Value to set
     * @returns {view.Collection|Object} Self or attribute value
     */
    prop: function(name, value) {
        if (value !== undefined) {
	    for (var i = this.length - 1; i >= 0; i--) {
                utils.prop(this[i], name, value);
	    }
	    return this;
        } else {
	    return this[0] ? utils.prop(this[0], name) : "";
        }
    },

   /**
    * Appends views to the first item in collection
    *
    * @function
    *
    * @param {Array.<view.Base>} views Views to append
    * @returns {view.Collection} self
    */
    append: function(views) {
        var target = this[0];
        if (!target) { return this; }
	
        views = views.length !== undefined ? views : [views];
	
        for (var i = views.length - 1; i >= 0; i--) {
	    target.appendChild(views[i]);
        }
	
        return this;
    },
	
    appendTo: function(target) {
        target = require('./builder').build(target)[0];
        this.forEach(function(view) { target.appendChild(view); });
        return this;
    },

    attach: function(dom) {
        this.forEach(function(view) {
	    require('./attachment').Attachment.attach(dom, view);
	    view.resized();
        });
        return this;
    }
});

/**#@-*/

var proto = Collection.prototype;

[ ['parent', 'parent'],
  ['next', 'nextView'],
  ['prev', 'prevView']
].forEach(function(desc,i) {
    proto[desc[0]] = function() {
        return new Collection(
	    utils.unique(utils.pluck(this, desc[1]))
        );
    };
});

[ 'addListener', 'removeListener', 'trigger', 'on', 'emit',
  'appendChild', 'removeChild', 'insertBefore', 'toggle'
].forEach(function(name) {
    proto[name] = function() {
        for (var i = this.length - 1; i >= 0; i--) {
	    this[i][name].apply(this[i], arguments);
        }
        return this;
    };
});

exports.Collection = Collection;
//})();
