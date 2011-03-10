(function() {
    var fun   = require('../core/function'),
        utils = require('../core/utils');

    var Binding = new Object.Class({
        view: null,
        model: null,
        modelProp: 'value',
        viewProp: 'value',
        modelEvent: '',
        viewEvent: 'blur',

        init: function(view, model, options) {
            utils.extend(this, options);

            this.view = view;
            this.model = model;
            if (!this.modelEvent) {
                this.modelEvent = 'change.' + this.modelProp;
            }

            if (this.model && this.view) {
                this.view.on(this.viewEvent, this.updateModel.bindOnce(this));
                this.model.on(this.modelEvent, this.updateView.bindOnce(this));
                if (this.sync !== false) {
                    this.updateView();
                }
            }
        },

        destruct: function() {
            this.view.removeListener(this.viewEvent, this.updateModel.bindOnce(this));
            this.model.removeListener(this.modelEvent, this.updateView.bindOnce(this));
        },

        viewValue: function(value) {
            return utils.prop(this.view, this.viewProp, value);
        },
	
        modelValue: function(value) {
            return utils.prop(this.model, this.modelProp, value, this);
        },
	
        updateModel: function(e) {
            if (this.viewValue() != this.modelValue()) {
                this.modelValue(this.viewValue());
            }
        },

        updateView: function(e) {
            if ((!e || e.source !== this) &&
                this.viewValue() !== this.modelValue()) {
		
                this.viewValue(this.modelValue());
            }
        }
    });

    exports.Binding = Binding;
})();
