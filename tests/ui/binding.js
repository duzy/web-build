requireCss('./binding.css');

var ui = require('ui'),
    fun = require('ui/core/function'),
    Observable = require('ui/tool/observable').Observable;

ui.view(
    require('ui/views/text'),
    require('ui/views/flow')
);
ui.view.NativeControl = require('ui/views/nativeControl.js').nativeControl;

var Person = fun.newClass(Observable, {
    name: Observable.newProp('name'),
    age: Observable.newProp('age')
});

global.bob = new Person();
bob.name('Bob').age(27);

var options = [1,2,3,4,5,6,7,8,9,10]; //ui.range(10, 99);

try {

    ui([
	{ view: 'Header', text: 'Two forms bound to the same data' },
	{ view: 'P', text: 'Input values should be synced on blur event, comboboxes on change' },
	{ view: 'Flow', horizontal: true, spacing: 'large', childViews: [
            { view: 'Container', addClass: 'form', childViews: [
		{ view: 'NativeControl.Text', addClass: 'input', binding: { model: bob, modelProp: 'name' } },
		{ view: 'NativeControl.Select', options: options, binding: { model: bob, modelProp: 'age' } }
            ]},
            { view: 'Container', addClass: 'form', childViews: [
		{ view: 'NativeControl.Text', addClass: 'input', binding: { model: bob, modelProp: 'name' } },
		{ view: 'NativeControl.Select', options: options, binding: { model: bob, modelProp: 'age' } }
            ]}
	]},
	{ view: 'Text', addClass: 'help', text: 'Also try changin name and age props of the object "bob" in the browser JavaScript console' }
    ]).attach();
    
} catch(e) {
    alert(e);
}
