requireCss('./textarea.css');

var uki = require('uki'),
dom = require('uki-core/dom'),
view = uki.view,
nat = view.nativeControl,
TextArea = view.newClass('TextArea', nat.Text, {
    _createDom: function(initArgs) {
        this._input = dom.createElement('textarea', {
            className: 'uki-nc-text__input', type: 'text' });
        this._dom = dom.createElement(initArgs.tagName || 'span',
            { className: 'uki-nc-text' });
        this.dom().appendChild(this._input);
    },

    // _layout: function(v) {
    //     if (v !== undefined) this._input.style.resize = v;
    //     return this._input.style.resize;
    // },

    readonly: function(v) {
        if (v !== undefined) this._input.readOnly = v;
        return this._input.readOnly;
    },
});

exports.TextArea = TextArea;
