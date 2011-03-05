var uki = require("uki");

uki({
    view: 'Button',
    pos: 'l:50% t:40px w:200px ml:-100px',
    label: 'uki is awesome!',
    tabIndex: 1
}).attach( document.getElementById('test') );

uki('Button[text~=awesome]').on('click', function(e) {
    alert(this.label());
});
