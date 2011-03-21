// -*- javascript -*-
var ui = require('ui');

ui.view(
    require('ui/views/button')
);

var root = ui([
    // BUG: selector.find needs a 'Can' 
    { view: 'Can', childViews: [
	{ view: 'Button', id:'cmd', label: 'label' },
	{ view: 'Button', id:'pub', text: 'text' },
        { view: 'Button', id:'cmd2', iconSrc: '../button/settings.png' },
	{ view: 'Button', id:'cmd3', text: 'cmd3' },
    ]}
]).attach();

var cmd_clicked = 0, cmd2_clicked = 0, cmd3_clicked = 0;
    
ui('#cmd').on('click', function() { ++cmd_clicked });

var pub = ui('#pub')[0];
pub.on('click', function(){ alert('#pub clicked') });
pub.destroy({ nodettach: true }); // test force destroy, will also be dettached from DOM

if (ui('#pub')[0]) { alert('ERROR: destroyed button #pub still findable') }

var selector = require('ui/tool/selector'), cmd2, cmd3;
(cmd2 = selector.find('#cmd2',root)).on('click', function() { ++cmd2_clicked });
(cmd3 = selector.find('[text^=cmd3]',root)).on('click', function() { ++cmd3_clicked });

var doc = window.document, ele;
if (ele = doc.getElementById('cmd'))  ele.click();
if (ele = doc.getElementById('cmd2')) ele.click();

function check(cond, msg) {
    var ele = doc.createElement("div");
    if (cond) {
        ele.innerHTML = "<font color=green>OK: </font>"+msg+"</br>";
    }
    else {
        ele.innerHTML = "<font color=red>FAILED: </font>"+msg+"</br>";
    }
    doc.body.appendChild(ele);
}

ele = doc.createElement("div");
ele.innerHTML = "wait seconds for test results...</br>";
doc.body.appendChild(ele);

setTimeout(function(){
    check(cmd_clicked == 1,         "#cmd click(): "+cmd_clicked);
    check(cmd2 !== undefined,       "#cmd2 found");
    check(cmd2 && cmd2.length == 1, "#cmd2 count: "+cmd2.length);
    check(cmd2_clicked == 1,        "#cmd2 click(): "+cmd2_clicked);
    check(cmd3 !== undefined,       "#cmd3 found");
    check(cmd3 && cmd3.length == 1, "#cmd3 count: "+cmd3.length);
    check(cmd3_clicked == 1,        "#cmd3 click(): "+cmd3_clicked);
}, 1000);
