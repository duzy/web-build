requireCss('./binding.css');

var ui = require('lui'),
    fun = require('lui/core/function'),
    Observable = require('lui/tool/observable').Observable;

ui.view.NativeControl = require('lui/views/nativeControl.js').nativeControl;

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
