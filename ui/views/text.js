requireCss('./text/text.css');

var fun  = require('../core/function'),
    dom  = require('../core/dom'),
    view = require('../core/view'),

    Base = require('../core/view/base').Base;


var Text = new Object.Class(Base, {
    typeName: 'Text',

    _createDom: function() {
        this._dom = dom.createElement('div', { className: 'ui-text' });
    }
});


var P = new Object.Class(Base, {
    typeName: 'P',

    _createDom: function() {
        this._dom = dom.createElement('p', { className: 'ui-text-p' });
    }
});


var Label = new Object.Class(Base, {
    typeName: 'Label',

    _createDom: function(initArgs) {
        this._dom = dom.createElement(initArgs.tagName || 'label', { className: 'ui-label' });
    }
});
fun.delegateProp(Label.prototype, 'for', '_dom');


var Header = new Object.Class(Base, {
    typeName: 'Header',

    _createDom: function() {
        this._dom = dom.createElement('h1', { className: 'ui-header ui-header_size_medium' });
    },

    size: view.newClassMapProp({
        'small': 'ui-header_size_small',
        'medium': 'ui-header_size_medium',
        'large': 'ui-header_size_large'
    })
});


exports.Text   = Text;
exports.P      = P;
exports.Label  = Label;
exports.Header = Header;
