// -*- javascript -*-
//(function() {
requireCss('./native/native.css');

var fun   = require('../core/function'),
    utils = require('../core/utils'),
    dom   = require('../core/dom'),
    env   = require('../core/env'),
    evt   = require('../core/event'),

    Binding   = require('../tool/binding').Binding,
    Focusable = require('../facet/focusable').Focusable,
    Base      = require('../core/view/base').Base;


var ieResize = env.ua.match(/MSIE 6|7/);

/**
 * Base class for native control wrappers.
 * Map common dom attributes and add binding
 */
var NativeControl = new Object.Class('native', Base, Focusable, {
    bindingOptions: fun.newProp('bindingOptions'),

    binding: fun.newProp('binding', function(val) {
        if (this._binding) this._binding.destroy();

        this._binding = val && new Binding(this, val.model,
                                           utils.extend(this._bindingOptions, val));
    }),

    // domForEvent: function(type) {
    //     return this._input;
    // },

    focusableDom: function() {
        return this._input;
    },
    
    domForEvent: function(type) {
        return Focusable._domForEvent.call(this, type) ||
            Base.prototype.domForEvent.call(this, type);
    },

    $: {
        'name checked disabled value type': fun.setterN('_input'),
    },
});
 // fun.delegateProp(NativeControl.prototype,
 //                  ['name', 'checked', 'disabled', 'value', 'type'], '_input');



/**
 * Radio button with a label
 * build({ view: 'native.Radio', name: 'color', value: 'red', text: 'Red' })
 */
var Radio = new Object.Class('Radio', NativeControl, {
    _createDom: function(initArgs) {
        this._input = dom.createElement('input', { type: 'radio' });
        this._label = dom.createElement('span',	{ name: 'label' });
        this._dom = dom.createElement(initArgs.tagName || 'label', {
	    className: 'ui-native-radio'
	}, [this._input, this._label]);
    },
    
    _bindingOptions: {
	viewEvent: 'click', viewProp: 'checked', commitChangesViewEvent: 'click'
    },

    $: {
        html: fun.setter('innerHTML', '_label'),
    },
});
// fun.delegateProp(Radio.prototype, 'html', '_label', 'innerHTML');


/**
 * Checkbox with a label
 * build({ view: 'native.Checkbox', name: 'color', value: 'red', text: 'Red' })
 */
var Checkbox = new Object.Class('Checkbox', NativeControl, {
    _createDom: function(initArgs) {
        this._input = dom.createElement('input', { type: 'checkbox' });
        this._label = dom.createElement('span', { name: 'label' });
        this._dom = dom.createElement(initArgs.tagName || 'label', {
	    className: 'ui-native-checkbox'
	}, [this._input, this._label]);
    },

    _bindingOptions: Radio.prototype._bindingOptions,

    $: {
        html: fun.setter('innerHTML', '_label'),
    },
});
// fun.delegateProp(Checkbox.prototype, 'html', '_label', 'innerHTML');


/**
 * Text input
 * build({ view: 'native.Text', value: 'John Smith', placeholder: 'Name?' })
 */
var Text = new Object.Class('Text', NativeControl, {
    _createDom: function(initArgs) {
        this._inputTag = this._inputTag || 'input';
        this._input = dom.createElement(this._inputTag, { type: 'text' });
        this._dom = dom.createElement(initArgs.tagName || 'span', {
	    className: 'ui-native-text'
	});
        this.dom.appendChild(this._input);
    },

    placeholder: fun.newProp('placeholder', function(v) {
        this._placeholder = v;
        if (this._input.placeholder !== undefined) {
            this._input.placeholder = v;
        } else {
            this._initPlaceholder();
            this._placeholderDom.innerHTML = dom.escapeHTML(v);
        }
    }),

    resized: function() {
        NativeControl.prototype.resized.call(this);
        this._updatePlaceholderHeight();
        // manual resize box-sizing: border-box for ie 6,7
        if (ieResize) {
            this._input.style.width = this.dom.offsetWidth - 6;
        }
    },

    _initPlaceholder: function() {
        if (this._initedPlaceholder) return;
	
        this._initedPlaceholder = true;
        this.addClass('ui-native-text-with-placeholder');
        this._placeholderDom = dom.createElement('span', {
	    name: 'placeholder'
	});
        this.dom.insertBefore(this._placeholderDom, this.dom.firstChild);
        evt.on(this._placeholderDom, 'click',
	       function() { this.focus(); }.bindOnce(this));
        this.on('focus blur change keyup', this._updatePlaceholderVis);
        if (this._input.offsetHeight) {
            this._updatePlaceholderHeight();
        }
    },

    _updatePlaceholderVis: function() {
        this._placeholderDom.style.display =  this.hasFocus()
	    || this.value() ? 'none' : '';
    },

    _updatePlaceholderHeight: function() {
        if (!this._placeholderDom) return;
        var targetStyle = this._placeholderDom.style,
        sourceStyle = dom.computedStyle(this._input);
	
        [
	    'font', 'fontFamily', 'fontSize', 'paddingLeft', 'paddingTop', 'padding'
	].forEach(function(name) {
            if (sourceStyle[name] !== undefined) {
                targetStyle[name] = sourceStyle[name];
            }
        });

        targetStyle.lineHeight = this._input.offsetHeight
	    + (parseInt(sourceStyle.marginTop, 10) || 0)*2 + 'px';
        targetStyle.marginLeft = (parseInt(sourceStyle.marginLeft, 10) || 0)
	    + (parseInt(sourceStyle.borderLeftWidth, 10) || 0) + 'px';
        textProto._updatePlaceholderHeight = fun.FS;
    }
});

var TextArea = new Object.Class('TextArea', Text, {
    init: function(initArgs) {
        this._inputTag = 'textarea';
    },
});

/**
 * Native browser button
 * build({ view: 'native.Button', value: 'Work!'})
 */
var Button = new Object.Class('Button', NativeControl, {
    _createDom: function(initArgs) {
        this._dom = this._input = dom.createElement('input', {
	    className: 'ui-native-button', type: 'button'
	});
    }
});


/**
 * Native browser select
 * build({ view: 'native.Select', options: [
 *   { text: 'Default', options: [
 *       'red',
 *       'blue',
 *       'green'
 *   ]},
 *   { text: 'User', options: [
 *       { text: 'favorite', value: 1234522 },
 *       { text: 'less favorite', value: 1264522 }
 *   ]},
 *   { text: 'Custom', value: '' }
 * ]})
 */
var Select = new Object.Class('Select', NativeControl, {
    _createDom: function(initArgs) {
        this._input = this._dom = dom.createElement('select', {
	    className: 'ui-native-select'
	});
    },

    options: fun.newProp('options', function(val) {
        this._options = val;
        this._input.innerHTML = '';
        appendOptions(this._input, val);
        return this;
    })
});

function appendOptions (root, options) {
    var node;
    options && options.forEach(function(option) {
        if (typeof option === 'string' || typeof option === 'number') {
            option = { text: option, value: option };
        }
        if (option.options) {
            node = dom.createElement('optgroup', {
                label: option.html ? option.html : dom.escapeHTML(option.text)
            });
            appendOptions(node, option.options);
        } else {
            node = dom.createElement('option', {
                html: option.html ? option.html : dom.escapeHTML(option.text),
                value: option.value,
                selected: option.selected
            });
        }
        root.appendChild(node);
    });
}

exports.native = {
    NativeControl: NativeControl,
    Radio:         Radio,
    Checkbox:      Checkbox,
    Text:          Text,
    Button:        Button,
    Select:        Select,
    TextArea:      TextArea,
};
//})();
