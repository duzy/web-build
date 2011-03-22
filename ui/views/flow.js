// -*- javascript -*-
requireCss('./flow/flow.css');

var fun   = require('../core/function'),
    utils = require('../core/utils'),
    view  = require('../core/view'),
    dom   = require('../core/dom'),

    Can = require('../core/view/can').Can;


var Flow = new Object.Class(Can, {
    typeName: 'Flow',

    spacing: view.newClassMapProp({
        none: 'ui-flow_spacing-none',
        small: 'ui-flow_spacing-small',
        medium: 'ui-flow_spacing-medium',
        large: 'ui-flow_spacing-large'
    }),

    horizontal: view.newToggleClassProp('ui-flow_horizontal'),

    _createDom: function() {
        this._dom = dom.createElement('ul', {
            className: 'ui-flow ui-flow_spacing-small'
        });
    },

    /* Wrap children in lis */
    _removeChildFromDom: function(child) {
        this.dom.removeChild(child.dom.parentNode);
    },

    _appendChildToDom: function(child) {
        var flowClass = utils.prop(child, 'flowRowClass');
        var li = dom.createElement('li', {
            className: 'ui-flow-item' + (flowClass ? ' ' + flowClass : '')
        });
        li.appendChild(child.dom);
        this.dom.appendChild(li);
    },

    _insertBeforeInDom: function(child, beforeChild) {
        this.dom.insertBefore(
            child.dom.parentNode,
            beforeChild.dom.parentNode
        );
    }
});


exports.Flow = Flow;
