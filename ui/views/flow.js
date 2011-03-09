requireCss('./flow/flow.css');

var fun   = require('../core/function'),
    utils = require('../core/utils'),
    view  = require('../core/view'),
    dom   = require('../core/dom'),

    Can = require('../core/view/can').Can;


var Flow = fun.newClass(Can, {
    typeName: 'Flow',

    spacing: view.newClassMapProp({
        none: 'uki-flow_spacing-none',
        small: 'uki-flow_spacing-small',
        medium: 'uki-flow_spacing-medium',
        large: 'uki-flow_spacing-large'
    }),

    horizontal: view.newToggleClassProp('uki-flow_horizontal'),

    _createDom: function() {
        this._dom = dom.createElement('ul', {
            className: 'uki-flow uki-flow_spacing-small'
        });
    },

    /* Wrap children in lis */
    _removeChildFromDom: function(child) {
        this.dom().removeChild(child.dom().parentNode);
    },

    _appendChildToDom: function(child) {
        var flowClass = utils.prop(child, 'flowRowClass');
        var li = dom.createElement('li', {
            className: 'uki-flow-item' + (flowClass ? ' ' + flowClass : '')
        });
        li.appendChild(child.dom());
        this.dom().appendChild(li);
    },

    _insertBeforeInDom: function(child, beforeChild) {
        this.dom().insertBefore(
            child.dom().parentNode,
            beforeChild.dom().parentNode
        );
    }
});


exports.Flow = Flow;
