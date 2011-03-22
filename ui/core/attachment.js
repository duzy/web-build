// -*- javascript -*-
//(function() {
requireCss('./attachment.css');

var utils = require('./utils'),
    env   = require('./env'),
    evt   = require('./event'),
    dom   = require('./dom'),
    fun   = require('./function'),
    Can = require('./view/can').Can;

// all attached view instances.
var instances = null;

var Attachment = exports.Attachment = new Object.Class('Attachment', Can, {
    typeName: 'Attachment',

    init: function(initArgs) {
        this._dom = initArgs.dom;
        dom.addClass(this.dom, 'ui-attachment');
    },

    parent: function() {
        return null;
    },

});

Attachment.extend({
    attach: function(dom, view) {
        dom = dom || env.doc.body;
        var id = dom[env.expando] = dom[env.expando] || env.guid++;
        if (!instances || !instances[id]) {
            register(new Attachment({ dom: dom }));
        }
        return instances[id].appendChild(view);
    },

    // return a copy of attached view array.
    instances: function() {
        var atts = [];
        instances && instances.forEach(function(a) { atts.push(a); });
        return atts;
    },
});

    function register(a) {
        if (!instances) {
            instances = {};
            var timeout = false;

            evt.on(env.root, 'resize', function() {
                    if (!timeout) {
                        timeout = true;
                        setTimeout(function(i, len) {
                                timeout = false;
                                instances.forEach(function(a) {
                                    a.resized();
                                });
                        }, 1);
                    }
            });
        }
        var el = a.dom,
            id = el[env.expando] = el[env.expando] || env.guid++;

        return (instances[id] = a);
    }
//})();
