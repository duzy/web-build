// -*- javascript -*-
/**
    A MVC mode list.
 **/


var

env        = require('../core/env'),
fun        = require('../core/function'),
dom        = require('../core/dom'),
event      = require('../core/event'),
build      = require('../core/builder').build,

Base       = require('../core/view/base').Base,

Focusable  = require('../facet/focusable').Focusable,
Selectable = require('../facet/selectable').Selectable,

ListView = new Object.Class(Base, Focusable, Selectable, {
    init: function(initArgs) {
    },

    _createDom: function(initArgs) {
        this._dom = dom.createElement('div', {
        });
    },
});

exports.ListView = ListView;
