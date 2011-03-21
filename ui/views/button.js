// -*- javascript -*-
requireCss('./button/button.css');

var fun  = require('../core/function'),
    view = require('../core/view'),
    dom  = require('../core/dom'),

    Base      = require('../core/view/base').Base,
    Focusable = require('../facet/focusable').Focusable;


var Button = exports.Button = new Object.Class('Button', Base, Focusable, {
    destroy: function() {
        alert('Button.destroy');
    },

    labelHtml: function(value) {
        if (value === undefined) {
            return this._text.innerHTML;
        }
        this._text.innerHTML = value;
        updateImageOnly.call(this);
        return this;
    },

    label: function(value) {
        return this.labelHtml(value && dom.escapeHTML(value));
    },

    disabled: function(state) {
        if (state === undefined) {
            return this.dom().disabled;
        }
        this.dom().disabled = state ? 'disabled' : '';
        this.toggleClass('ui-button_disabled', state);
        return this;
    },

    confirm: view.newToggleClassProp('ui-button_confirm'),

    iconSrc: fun.newProp('iconSrc', function(src) {
        dom.removeElement(this._iconDom);
        this._iconSrc = src;
        if (src) {
            this._iconDom = dom.createElement('img', { className: 'ui-button__icon', src: src });
            this.dom().insertBefore(this._iconDom, this._text);
        }
        updateImageOnly.call(this);
    }),

    _createDom: function() {
        this._text = dom.createElement('span', { className: 'ui-button__text' });
        this._dom = dom.createElement('button', { className: 'ui-button', tabIndex: -1 },
				      [this._text]);
    },
});

function updateImageOnly () {
    this.toggleClass('ui-button_image-only', !!(this.iconSrc() && !this.labelHtml()));
}
